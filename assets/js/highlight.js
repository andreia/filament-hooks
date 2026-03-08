/**
 * highlight.js
 * Shiki syntax highlighting setup.
 * Loaded as type="module" — initialises async and signals readiness via a
 * custom DOM event so Alpine can re-highlight if Shiki finishes after boot.
 */

import { codeToHtml } from 'https://esm.run/shiki@1';

window._shikiHighlight = async (code) => {
    return await codeToHtml(code, { lang: 'php', theme: 'tokyo-night' });
};

window._shikiReady = true;
window.dispatchEvent(new CustomEvent('shiki-ready'));
