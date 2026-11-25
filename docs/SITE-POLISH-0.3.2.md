# Z-Aura 0.3.2 — website-only polish

Local follow-up to the delivered 0.3.2 candidate, 2026-11-25. No desktop changes or
EXE rebuild, commits, pushes, Pages deployment or Developer Portal changes.

## Requested changes

- Russian navigation no longer compresses a link onto two lines or pushes Download beyond
  its glass container. Both languages use the same grid; the full menu moves into a separate
  row below 1181 px. At 640 px and narrower Download gets a full-width row. Links remain
  available rather than being hidden. Anchor scrolling accounts for actual header height.
- The main site's native theme select is replaced by a compact sun/moon segmented control
  with matching lilac glass, selected outline, custom tooltips and keyboard focus. No OS popup
  or popup scrollbar. Both controls have translated accessible names, radio semantics,
  roving Tab focus, arrow/Home/End keys and native Enter/Space activation.
- Theme choice still validates light/dark, remembers localStorage, updates the theme query
  for reload, and carries only appearance into the real language link. Blocked storage/history
  do not prevent switching. The shared script retains the legal pages' existing select behavior;
  legal pages/disclosures remain unmodified and draft-only.
- Main-site logo in header/footer is the exact supplied `assets/logo.png`, not the old generic
  diamond SVG; the same PNG is the favicon/touch icon. Original PNG bytes remain unchanged.
- Scrollbars use thin, rounded purple thumbs with dark/light variables and an automatic
  forced-colors fallback. No scrollbar is hidden. No external library/asset request added.
- Existing minimum card widths and mockup grid constraints also fit a 320 px viewport.
  All donation details, external links and candidate/not-a-VPN disclosures remain intact.

## Local verification

- All **76 Node tests passed** (69 prior plus 7 focused site-header/preference tests).
- Chromium: **56 layout cases**, RU/ENG × light/dark × 14 widths:
  320, 375, 640, 641, 800, 1024, 1100, 1180, 1181, 1200, 1240, 1307, 1440, 1920 px.
  Header bounds, link wrapping, overlaps, document/header overflow, PNG load and selected
  theme checked with same-origin iframe viewports after font readiness. No failures in
  the final matrix. At the screenshot's 1307 px width both languages have a 66 px header.
- Actual browser click, ArrowRight, Space and Enter switched state correctly; keyboard outline
  remained visible. Reload and real ENG navigation preserved dark theme; no console errors.
- Scoped Chromium testing is not a full accessibility audit, physical mixed-DPI/mobile-device
  test or a Windows/Firefox/Safari browser matrix.

## Upload package

`C:\Users\Takira\Desktop\Z-Aura-Site-Fix-0.3.2\UPLOAD-TO-REPO.zip`
contains the complete current static main site at the repository root, a matching copy under
`Z-Aura-GitHub/` for README/build paths, and the main-site builder/catalog/shared script.
Extract and upload its **contents**, keeping the folders and replacing matching main-site
files in the Pages source branch. Do not upload the outer ZIP as the site. No EXE/user
settings/credentials/legal deployment files are included. Old 0.3.2 delivery archives are
retained, not silently overwritten. Only the owner can trigger an actual public deployment.
