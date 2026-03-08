/**
 * app.js
 * Alpine.js component for the Filament hooks interactive reference.
 * Depends on: hooks-data.js (window.HOOKS_DATA), highlight.js (window._shikiHighlight)
 */

/* global Alpine, window */

function selectHookById(id) {
    const app = Alpine.store('hooksApp');
    if (app) app.selectHook(id);
}

function hooksApp() {
    return {
        selectedGroup:      'field',
        selectedHook:       null,
        mobileMenuOpen:     false,
        highlightedHtml:    '',
        highlightedHtmls:   [],
        highlightedNoteHtml:'',

        hookGroups: window.HOOKS_DATA,

        get currentGroup() {
            return this.hookGroups.find(g => g.id === this.selectedGroup) || this.hookGroups[0];
        },
        get selectedHookData() {
            if (!this.selectedHook) return null;
            return this.currentGroup.hooks.find(h => h.id === this.selectedHook);
        },
        selectHook(hookId) {
            this.selectedHook = this.selectedHook === hookId ? null : hookId;
            this.renderBulbs();
        },

        renderBulbs() {
            const container = document.getElementById('bulbs-container');
            if (!container) return;
            const hooks = this.currentGroup.hooks;
            const w = window.innerWidth;

            if (w < 520) {
                this._renderBulbsMobile(container, hooks);
            } else if (w < 1025) {
                this._renderBulbsTablet(container, hooks);
            } else {
                this._renderBulbsDesktop(container, hooks);
            }
        },

        _renderBulbsDesktop(container, hooks) {
            const n = hooks.length;

            const viewW    = 1200;
            const padY     = 22;
            const viewH    = 200 + padY * 2;
            const wireY    = 38 + padY;
            const sagBulbs = 26;
            const sagEdge  = 14;
            const spacing  = 155;
            const totalSpan = (n - 1) * spacing;
            const startX   = Math.round((viewW - totalSpan) / 2);
            const attachX  = hooks.map((_, i) => startX + i * spacing);

            let wirePath = `M 0 ${wireY + 3}`;
            wirePath += ` Q ${attachX[0] / 2} ${wireY + sagEdge} ${attachX[0]} ${wireY}`;
            for (let i = 0; i < n - 1; i++) {
                const mid = (attachX[i] + attachX[i+1]) / 2;
                wirePath += ` Q ${mid} ${wireY + sagBulbs} ${attachX[i+1]} ${wireY}`;
            }
            wirePath += ` Q ${(attachX[n-1] + viewW) / 2} ${wireY + sagEdge} ${viewW} ${wireY + 3}`;

            const loopsHTML = attachX.map(x => {
                const r = 5.2;
                return `
                  <circle class="wire-loop" cx="${x}" cy="${wireY - r + 1}" r="${r}"/>
                  <circle fill="#162030" stroke="#2a3a52" stroke-width="1" cx="${x}" cy="${wireY + 1}" r="2.8"/>`;
            }).join('');

            container.style.overflowX = '';
            container.innerHTML = `
            <svg width="100%" viewBox="0 0 ${viewW} ${viewH}"
                 preserveAspectRatio="xMidYMid meet"
                 style="overflow:visible; display:block; min-height:180px;">
                <path class="wire" d="${wirePath}"/>
                ${loopsHTML}
                ${this._buildBulbsHTML(hooks, attachX, wireY, 0, 22, 75)}
            </svg>`;
        },

        _renderBulbsTablet(container, hooks) {
            const chunkSize = 4;
            const chunks = [];
            for (let i = 0; i < hooks.length; i += chunkSize) {
                chunks.push({ hooks: hooks.slice(i, i + chunkSize), startIdx: i });
            }

            // Wide viewBox with generous spacing; fixed height keeps bulb size stable
            const viewW    = 800;
            const padY     = 22;
            const viewH    = 200 + padY * 2;
            const wireY    = 38 + padY;
            const sagBulbs = 26;
            const sagEdge  = 14;
            const spacing  = 190;
            const bW = 22, bH = 75;
            const svgPxH   = viewH;

            const rows = chunks.map(({ hooks: rowHooks, startIdx }) => {
                const n = rowHooks.length;
                const totalSpan = (n - 1) * spacing;
                const startX = Math.round((viewW - totalSpan) / 2);
                const attachX = rowHooks.map((_, i) => startX + i * spacing);

                let wirePath = `M 0 ${wireY + 3}`;
                wirePath += ` Q ${attachX[0] / 2} ${wireY + sagEdge} ${attachX[0]} ${wireY}`;
                for (let i = 0; i < n - 1; i++) {
                    const mid = (attachX[i] + attachX[i+1]) / 2;
                    wirePath += ` Q ${mid} ${wireY + sagBulbs} ${attachX[i+1]} ${wireY}`;
                }
                wirePath += ` Q ${(attachX[n-1] + viewW) / 2} ${wireY + sagEdge} ${viewW} ${wireY + 3}`;

                const loopsHTML = attachX.map(x => {
                    const r = 5.2;
                    return `
                      <circle class="wire-loop" cx="${x}" cy="${wireY - r + 1}" r="${r}"/>
                      <circle fill="#162030" stroke="#2a3a52" stroke-width="1" cx="${x}" cy="${wireY + 1}" r="2.8"/>`;
                }).join('');

                return `<svg height="${svgPxH}" viewBox="0 0 ${viewW} ${viewH}"
                             preserveAspectRatio="xMidYMid meet"
                             style="overflow:visible; display:block; width:100%; margin-bottom:-8px;">
                    <path class="wire" d="${wirePath}"/>
                    ${loopsHTML}
                    ${this._buildBulbsHTML(rowHooks, attachX, wireY, startIdx, bW, bH)}
                </svg>`;
            });

            container.style.overflowX = '';
            container.innerHTML = rows.join('');
        },

        _renderBulbsMobile(container, hooks) {
            const chunkSize = 3;
            const chunks = [];
            for (let i = 0; i < hooks.length; i += chunkSize) {
                chunks.push({ hooks: hooks.slice(i, i + chunkSize), startIdx: i });
            }

            // Wide viewBox with generous spacing so labels never overlap.
            // SVG renders at a fixed CSS pixel height (not 100% width) so
            // bulb physical size stays consistent regardless of screen width.
            const viewW    = 600;
            const padY     = 22;
            const viewH    = 200 + padY * 2;
            const wireY    = 38 + padY;
            const sagBulbs = 26;
            const sagEdge  = 14;
            const spacing  = 190;
            const bW = 22, bH = 75;
            // Fixed pixel height keeps bulbs the same physical size on all phones
            const svgPxH   = viewH;   // 1 SVG unit ≈ 1 CSS px at this height

            const rows = chunks.map(({ hooks: rowHooks, startIdx }) => {
                const n = rowHooks.length;
                const totalSpan = (n - 1) * spacing;
                const startX = Math.round((viewW - totalSpan) / 2);
                const attachX = rowHooks.map((_, i) => startX + i * spacing);

                let wirePath = `M 0 ${wireY + 3}`;
                wirePath += ` Q ${attachX[0] / 2} ${wireY + sagEdge} ${attachX[0]} ${wireY}`;
                for (let i = 0; i < n - 1; i++) {
                    const mid = (attachX[i] + attachX[i+1]) / 2;
                    wirePath += ` Q ${mid} ${wireY + sagBulbs} ${attachX[i+1]} ${wireY}`;
                }
                wirePath += ` Q ${(attachX[n-1] + viewW) / 2} ${wireY + sagEdge} ${viewW} ${wireY + 3}`;

                const loopsHTML = attachX.map(x => {
                    const r = 5.2;
                    return `
                      <circle class="wire-loop" cx="${x}" cy="${wireY - r + 1}" r="${r}"/>
                      <circle fill="#162030" stroke="#2a3a52" stroke-width="1" cx="${x}" cy="${wireY + 1}" r="2.8"/>`;
                }).join('');

                return `<svg height="${svgPxH}" viewBox="0 0 ${viewW} ${viewH}"
                             preserveAspectRatio="xMidYMid meet"
                             style="overflow:visible; display:block; width:100%; margin-bottom:-8px;">
                    <path class="wire" d="${wirePath}"/>
                    ${loopsHTML}
                    ${this._buildBulbsHTML(rowHooks, attachX, wireY, startIdx, bW, bH)}
                </svg>`;
            });

            container.innerHTML = rows.join('');
        },

        _buildBulbsHTML(hooks, attachX, wireY, globalOffset, bW, bH) {
            let bulbsHTML = '';
            hooks.forEach((hook, i) => {
                const globalIdx = globalOffset + i;
                const x     = attachX[i];
                const isLit = this.selectedHook === hook.id;
                const delay = (globalIdx * 0.55) % 4.5;
                const sT = wireY + 2, sH = 14, sB = sT + sH;
                const bTop = sB, bBot = bTop + bH, bMid = bTop + bH * 0.5;
                const hCy  = bTop + bH * 0.52;
                const hRx  = bW + 60, hRy = bH * 0.72;

                const coilCx  = x;
                const coilTop = bMid - 20;
                const coilBot = bMid + 20;
                const teeth   = 8;
                const toothW  = Math.round(bW * 0.36);
                const segH    = (coilBot - coilTop) / teeth;
                const ctrl    = segH * 0.18;

                const buildCoil = (offsetY, startSide) => {
                    const sx = startSide === 'L' ? coilCx - toothW : coilCx + toothW;
                    let d = `M ${sx} ${coilTop + offsetY}`;
                    for (let t = 0; t < teeth; t++) {
                        const flipped = startSide === 'R' ? 1 : 0;
                        const y0 = coilTop + offsetY + t * segH;
                        const y1 = y0 + segH;
                        const xA = (t + flipped) % 2 === 0 ? coilCx - toothW : coilCx + toothW;
                        const xB = (t + flipped) % 2 === 0 ? coilCx + toothW : coilCx - toothW;
                        d += ` C ${xA} ${y0 + ctrl}, ${xB} ${y1 - ctrl}, ${xB} ${y1}`;
                    }
                    return d;
                };

                const frontCoil = buildCoil(0, 'L');
                const backCoil  = buildCoil(-segH * 0.5, 'R');
                const glintPath = `M ${x - bW*0.55} ${bTop + bH*0.2} Q ${x - bW*0.7} ${bTop + bH*0.42} ${x - bW*0.52} ${bTop + bH*0.65}`;

                bulbsHTML += `
                <g class="bulb-group${isLit ? ' lit' : ''}"
                   style="transform-origin:${x}px ${wireY}px; animation-delay:${delay}s;"
                   onclick="selectHookById('${hook.id}')">
                    <defs>
                        <radialGradient id="g${globalIdx}" cx="50%" cy="50%" r="50%">
                            <stop offset="0%"   stop-color="#fde047" stop-opacity="0.88"/>
                            <stop offset="22%"  stop-color="#fbbf24" stop-opacity="0.68"/>
                            <stop offset="48%"  stop-color="#f59e0b" stop-opacity="0.36"/>
                            <stop offset="72%"  stop-color="#ea580c" stop-opacity="0.11"/>
                            <stop offset="90%"  stop-color="#7c2d12" stop-opacity="0.03"/>
                            <stop offset="100%" stop-color="#000"    stop-opacity="0"/>
                        </radialGradient>
                    </defs>
                    <ellipse class="glow-halo" cx="${x}" cy="${hCy}" rx="${hRx}" ry="${hRy}" fill="url(#g${globalIdx})"/>
                    <line class="hanger" x1="${x}" y1="${wireY+2}" x2="${x}" y2="${sT}"/>
                    <rect class="bulb-socket" x="${x-9}" y="${sT}" width="18" height="${sH}" rx="3"/>
                    <line class="socket-rib" x1="${x-9}" y1="${sT+4}"  x2="${x+9}" y2="${sT+4}"/>
                    <line class="socket-rib" x1="${x-9}" y1="${sT+8}"  x2="${x+9}" y2="${sT+8}"/>
                    <path class="bulb-body"
                          d="M ${x} ${bTop}
                             Q ${x+bW} ${bTop+5}, ${x+bW} ${bTop+bH*.42}
                             Q ${x+bW} ${bTop+bH*.72}, ${x+12} ${bTop+bH*.9}
                             Q ${x+6}  ${bBot}, ${x} ${bBot}
                             Q ${x-6}  ${bBot}, ${x-12} ${bTop+bH*.9}
                             Q ${x-bW} ${bTop+bH*.72}, ${x-bW} ${bTop+bH*.42}
                             Q ${x-bW} ${bTop+5}, ${x} ${bTop} Z"/>
                    <path class="bulb-glint" d="${glintPath}"/>
                    <path class="filament filament-back" d="${backCoil}"/>
                    <path class="filament" d="${frontCoil}"/>
                    <text class="bulb-label" x="${x}" y="${bBot+21}">${hook.name}</text>
                </g>`;
            });
            return bulbsHTML;
        },

        async highlightCurrent() {
            const data = this.selectedHookData;
            if (!data) {
                this.highlightedHtml = '';
                this.highlightedHtmls = [];
                this.highlightedNoteHtml = '';
                return;
            }

            const hl = async (code) => {
                const escaped = `<pre class="shiki" style="background:#1a1b26;padding:1.1rem 1.4rem;overflow-x:auto"><code style="color:#a9b1d6;font-family:var(--font-body);font-size:.77rem;line-height:1.78">${code.replace(/&/g,'&amp;').replace(/</g,'&lt;')}</code></pre>`;
                if (!window._shikiHighlight) return escaped;
                try { return await window._shikiHighlight(code); } catch(e) { return escaped; }
            };

            if (data.methods) {
                this.highlightedHtmls = await Promise.all(data.methods.map(m => hl(m.example)));
                this.highlightedHtml = '';
                this.highlightedNoteHtml = '';
            } else {
                this.highlightedHtml = await hl(data.example);
                this.highlightedHtmls = [];
                this.highlightedNoteHtml = data.noteExample ? await hl(data.noteExample) : '';
            }
        },

        init() {
            this.$nextTick(() => this.renderBulbs());
            this.$watch('selectedGroup', () => {
                this.selectedHook = null;
                this.$nextTick(() => this.renderBulbs());
            });
            this.$watch('selectedHook', () => {
                this.$nextTick(() => {
                    this.renderBulbs();
                    this.highlightCurrent();
                });
            });
            window.addEventListener('shiki-ready', () => {
                if (this.selectedHookData) this.highlightCurrent();
            });

            // Re-render bulbs on resize (e.g. orientation change)
            let _resizeTimer;
            window.addEventListener('resize', () => {
                clearTimeout(_resizeTimer);
                _resizeTimer = setTimeout(() => this.renderBulbs(), 120);
            });

            Alpine.store('hooksApp', this);
        }
    };
}
