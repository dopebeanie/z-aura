import { readFile, writeFile, mkdir, readdir } from "node:fs/promises";
import { resolve, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const root = fileURLToPath(new URL("../", import.meta.url));
const source = join(root, "website", "legal");
const pages = [
  ["index.html", "О приложении", "Z-Aura: назначение приложения, документы и интеграция Discord."],
  ["terms.html", "Условия использования", "Условия использования Windows-приложения Z-Aura."],
  ["privacy.html", "Политика конфиденциальности", "Локальные данные, сетевые обращения и Discord Rich Presence в Z-Aura."],
];
const control = /[\u0000-\u001f\u007f]/;
export const escapeHtml = value => String(value).replace(/[&<>"']/g, char => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[char]);
function text(value, name, maximum = 2000) {
  if (typeof value !== "string" || !value.trim() || value.length > maximum || control.test(value)) throw new Error(`Fill ${name} with real, single-line publication information.`);
  return value.trim();
}
function httpsUrl(value, name) {
  const raw = text(value, name);
  let url;
  try { url = new URL(raw); } catch { throw new Error(`${name}: invalid URL`); }
  const host = url.hostname.toLowerCase();
  if (url.protocol !== "https:" || url.username || url.password || url.hash || url.search || !host.includes(".") || /(^|\.)(localhost|local|invalid|test)$/.test(host) || /(^|\.)(example\.com|example\.net|example\.org)$/.test(host)) throw new Error(`${name} must be a real public HTTPS URL without credentials, query or fragment.`);
  return url;
}
function contactUrl(value) {
  const contact = text(value, "contactUrl", 1000);
  if (contact.startsWith("mailto:")) {
    if (!/^mailto:[^\s<>"'?,;]+@[^\s<>"'?,;]+\.[^\s<>"'?,;]+$/.test(contact)) throw new Error("contactUrl: use a real email address without extra mailto parameters.");
  } else httpsUrl(contact, "contactUrl");
  return contact;
}
function isoDate(value) {
  const result = text(value, "effectiveDate", 10);
  const date = new Date(result + "T00:00:00Z");
  if (!/^\d{4}-\d{2}-\d{2}$/.test(result) || Number.isNaN(date.getTime()) || date.toISOString().slice(0, 10) !== result) throw new Error("effectiveDate: expected a valid YYYY-MM-DD date.");
  return result;
}
export function validatePublication(config) {
  if (config.publicationApproved !== true) throw new Error("Publication is blocked: the owner must review the documents and set publicationApproved:true. Use --draft for local preview only.");
  const ownerName = text(config.ownerName, "ownerName", 180);
  const hostingDisclosure = text(config.hostingDisclosure, "hostingDisclosure", 4000);
  const site = httpsUrl(config.siteUrl, "siteUrl");
  if (!site.pathname.endsWith("/")) site.pathname += "/";
  const contact = contactUrl(config.contactUrl);
  const effectiveDate = isoDate(config.effectiveDate);
  return { ownerName, hostingDisclosure, contactUrl: contact, effectiveDate, siteUrl: site.href };
}
function render(template, values) {
  return template.replace(/\{\{(\w+)\}\}/g, (_, key) => {
    if (!(key in values)) throw new Error(`Unknown template field: ${key}`);
    return values[key];
  });
}
export async function assembleSite(config, { draft = false } = {}) {
  const values = draft ? {
    ownerName: config.ownerName ? text(config.ownerName, "ownerName", 180) : "[Владелец должен быть указан до публикации]",
    contactUrl: config.contactUrl ? contactUrl(config.contactUrl) : "#contact",
    effectiveDate: config.effectiveDate ? isoDate(config.effectiveDate) : "[Дата редакции утверждается владельцем]", siteUrl: null,
    hostingDisclosure: config.hostingDisclosure ? text(config.hostingDisclosure, "hostingDisclosure", 4000) : "[До публикации укажите реального провайдера хостинга, получаемые им технические данные (например, IP-адрес, путь запроса и журналы), сроки/правила хранения и ссылку на его политику. Инфраструктура сайта пока не выбрана.]",
  } : validatePublication(config);
  const escaped = Object.fromEntries(Object.entries(values).map(([key, value]) => [key, escapeHtml(value ?? "")]));
  if (/^\d{4}-\d{2}-\d{2}$/.test(values.effectiveDate)) escaped.effectiveDate = values.effectiveDate.split("-").reverse().join(".");
  escaped.contactLabel = values.contactUrl === "#contact" ? "[Контакт владельца не задан]" : escapeHtml(values.contactUrl.replace(/^mailto:/, ""));
  escaped.draftBanner = draft ? '<aside class="draft" role="note"><strong>Черновик для локального просмотра.</strong> Окончательная редакция ещё не утверждена, доступность публичных страниц не подтверждена. Не публикуйте эту версию и не вставляйте её адреса в Developer Portal.</aside>' : "";
  const frame = await readFile(join(source, "templates", "page.html"), "utf8");
  const files = {};
  const labels = {
    ru: { skipLabel: "Перейти к содержимому", navLabel: "Документы приложения", aboutLabel: "О приложении", termsLabel: "Условия использования", privacyLabel: "Конфиденциальность", telegramLabel: "Telegram-канал", languageLabel: "ENG", themeLabel: "Тема сайта", lightLabel: "Светлая тема", darkLabel: "Тёмная тема", ownerLabel: "Ответственный за приложение и этот сайт:", contactIntro: "Связь по вопросам приложения и данных:", independence: "Z-Aura — независимый проект. Не является продуктом Discord и не одобрен Discord самим фактом размещения этих документов.", newsIntro: "Новости и changelog:", privateContact: "Для непубличных обращений по данным используйте контакт ответственного выше, а не публичный канал." },
    en: { skipLabel: "Skip to content", navLabel: "App documents", aboutLabel: "About", termsLabel: "Terms of use", privacyLabel: "Privacy", telegramLabel: "Telegram channel", languageLabel: "RU", themeLabel: "Site theme", lightLabel: "Light theme", darkLabel: "Dark theme", ownerLabel: "Responsible for this app and site:", contactIntro: "App and data inquiries:", independence: "Z-Aura is an independent project, not a Discord product. Publishing these documents does not imply Discord approval.", newsIntro: "News and changelog:", privateContact: "For private data inquiries, use the responsible party's contact above, not the public channel." },
  };
  for (const language of ["ru", "en"]) for (const [name, title, description] of pages) {
    const pageName = language === "en" ? name.replace(".html", ".en.html") : name;
    const local = { ...escaped, ...labels[language], language, otherLanguage: language === "en" ? "ru" : "en", otherLanguagePath: language === "en" ? name : name.replace(".html", ".en.html"), indexPath: language === "en" ? "index.en.html" : "index.html", termsPath: language === "en" ? "terms.en.html" : "terms.html", privacyPath: language === "en" ? "privacy.en.html" : "privacy.html" };
    if (language === "en") {
      if (config.ownerNameEn) local.ownerName = escapeHtml(text(config.ownerNameEn, "ownerNameEn", 180));
      if (config.hostingDisclosureEn) local.hostingDisclosure = escapeHtml(text(config.hostingDisclosureEn, "hostingDisclosureEn", 4000));
      if (draft) local.draftBanner = '<aside class="draft" role="note"><strong>Local preview draft.</strong> Not yet approved or publicly verified. Do not publish or paste its URLs into Developer Portal.</aside>';
    }
    const body = render(await readFile(join(source, "templates", pageName), "utf8"), local);
    files[pageName] = render(frame, { ...local, title: escapeHtml(language === "en" ? labels.en[name === "index.html" ? "aboutLabel" : name === "terms.html" ? "termsLabel" : "privacyLabel"] : title), description: escapeHtml(language === "en" ? "Z-Aura Windows application documents, privacy and optional Discord integration." : description), body });
  }
  files["styles.css"] = await readFile(join(source, "styles.css"), "utf8");
  files["preferences.js"] = await readFile(join(root, "website", "shared", "preferences.js"), "utf8");
  const links = {
    status: draft ? "draft-not-for-publication" : "built-not-yet-deployed-or-discord-verified",
    interactionsEndpointUrl: null, linkedRolesVerificationUrl: null,
    termsOfServiceUrl: draft ? null : new URL("terms.html", values.siteUrl).href,
    privacyPolicyUrl: draft ? null : new URL("privacy.html", values.siteUrl).href,
    note: "Interactions/Linked Roles are intentionally not implemented for the current Rich Presence-only app. Leave these fields blank. Legal URLs must be publicly deployed and checked before pasting into Discord.",
  };
  files["portal-links.json"] = JSON.stringify(links, null, 2) + "\n";
  return { files, links };
}
async function main() {
  const args = process.argv.slice(2);
  let configPath = join(source, "site.config.example.json");
  let output = join(root, "artifacts", "discord-legal-site");
  let draft = false;
  for (let i = 0; i < args.length; i++) {
    if (args[i] === "--draft") draft = true;
    else if (["--config", "--out"].includes(args[i]) && args[i + 1] && !args[i + 1].startsWith("--")) {
      const option = args[i++]; const path = resolve(root, args[i]);
      if (option === "--config") configPath = path; else output = path;
    } else throw new Error(`Unknown/incomplete argument: ${args[i]}`);
  }
  const config = JSON.parse(await readFile(configPath, "utf8"));
  const { files, links } = await assembleSite(config, { draft });
  await mkdir(output, { recursive: true });
  const unexpected = (await readdir(output)).filter(name => !(name in files));
  if (unexpected.length) throw new Error(`Refusing to overwrite a directory containing unfamiliar files: ${unexpected.join(", ")}`);
  for (const [name, contents] of Object.entries(files)) await writeFile(join(output, name), contents, "utf8");
  console.log(`${draft ? "DRAFT ONLY" : "STATIC SITE BUILT; NOT DEPLOYED"}: ${output}\n${JSON.stringify(links, null, 2)}`);
}
if (process.argv[1] && pathToFileURL(resolve(process.argv[1])).href === import.meta.url) {
  main().catch(error => { console.error(error.message); process.exitCode = 1; });
}
