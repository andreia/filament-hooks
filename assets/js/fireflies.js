/**
 * fireflies.js
 * Injects randomised per-fly CSS keyframes and positions at page load.
 * Static base styles (.firefly, @keyframes drift/flash) live in style.css.
 */

(function () {
    const COUNT = 15;

    function rand(a, b) { return a + Math.random() * (b - a); }
    function ri(a, b)   { return Math.floor(rand(a, b + 1)); }

    let css = '';

    for (let i = 1; i <= COUNT; i++) {
        const steps    = ri(12, 22);
        const driftSpd = rand(50, 90).toFixed(1) + 's';
        const orbitR   = rand(3, 18).toFixed(1) + 'vw';
        const flashDur = ri(9000, 20000) + 'ms';
        const flashDly = ri(0, 28000) + 'ms';
        const startL   = rand(5, 95).toFixed(1) + '%';
        const startT   = rand(5, 95).toFixed(1) + '%';

        css += `.firefly:nth-child(${i}) { animation-name: move${i}; left: ${startL}; top: ${startT}; }`;
        css += `.firefly:nth-child(${i})::before { animation-duration: ${driftSpd}; transform-origin: -${orbitR}; }`;
        css += `.firefly:nth-child(${i})::after  { animation-duration: ${driftSpd}, ${flashDur}; animation-delay: 0ms, ${flashDly}; transform-origin: -${orbitR}; }`;
        css += `@keyframes move${i} {`;
        for (let s = 0; s <= steps; s++) {
            const pct = Math.round((s / steps) * 100);
            const tx  = rand(-42, 42).toFixed(1);
            const ty  = rand(-42, 42).toFixed(1);
            css += `${pct}%{transform:translateX(${tx}vw) translateY(${ty}vh)}`;
        }
        css += '}';
    }

    const style = document.createElement('style');
    style.textContent = css;
    document.head.appendChild(style);

    const frag = document.createDocumentFragment();
    for (let i = 0; i < COUNT; i++) {
        const d = document.createElement('div');
        d.className = 'firefly';
        d.setAttribute('aria-hidden', 'true');
        frag.appendChild(d);
    }
    document.body.insertBefore(frag, document.body.firstChild);
})();
