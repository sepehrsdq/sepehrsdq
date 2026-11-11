/**
 * Builds assets/hero.svg — an animated, Persian-first profile banner.
 * Fonts are embedded so the banner renders identically on GitHub (SVG is served as an image).
 *
 *   node scripts/hero.mjs
 */
import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(import.meta.dirname, '..');
const FONT_DIR = path.join(ROOT, 'assets', 'fonts');

const read = (file) => fs.readFileSync(path.join(ROOT, file), 'utf8');
const font = (file) => fs.readFileSync(path.join(FONT_DIR, file)).toString('base64');

const ARABIC_RANGE =
    'U+0600-06FF, U+0750-077F, U+0870-0891, U+0897-08E1, U+08E3-08FF, U+200C-200E, U+2010-2011, U+204F, U+2E41, U+FB50-FDFF, U+FE70-FE74, U+FE76-FEFC';
const LATIN_RANGE = 'U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+0304, U+0308, U+0329, U+2000-206F, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD';

const arabic = font('vazir-arabic.woff2');
const latin = font('vazir-latin.woff2');

// Small deterministic PRNG so every build produces the same star field.
let seed = 20261014;
const random = () => {
    seed = (seed * 1664525 + 1013904223) % 4294967296;
    return seed / 4294967296;
};

const stars = Array.from({ length: 46 }, (_, index) => {
    const x = Math.round(24 + random() * 1150);
    const y = Math.round(16 + random() * 390);
    const radius = (0.6 + random() * 1.5).toFixed(2);
    const delay = (random() * 7).toFixed(2);
    const duration = (3.4 + random() * 4).toFixed(2);
    return `<circle cx="${x}" cy="${y}" r="${radius}" class="star" style="animation-delay:-${delay}s;animation-duration:${duration}s"/>`;
}).join('\n        ');

const chips = [
    ['C# / .NET', 150],
    ['Python', 96],
    ['WebRTC', 104],
    ['AI Agents', 118],
];
let chipX = 1136;
const chipMarkup = chips
    .map(([label, width]) => {
        const x = chipX - width;
        chipX = x - 12;
        return `<g class="chip" transform="translate(${x} 300)">
            <rect width="${width}" height="38" rx="19" />
            <text x="${width / 2}" y="25" text-anchor="middle">${label}</text>
        </g>`;
    })
    .join('\n        ');

const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="420" viewBox="0 0 1200 420" role="img" aria-labelledby="title desc">
    <title id="title">سپهر صدیق — مهندس نرم‌افزار</title>
    <desc id="desc">بنر متحرک پروفایل گیت‌هاب سپهر صدیق</desc>
    <defs>
        <style type="text/css"><![CDATA[
            @font-face {
                font-family: 'Vazirmatn';
                font-style: normal;
                font-weight: 100 900;
                src: url(data:font/woff2;base64,${arabic}) format('woff2');
                unicode-range: ${ARABIC_RANGE};
            }
            @font-face {
                font-family: 'Vazirmatn';
                font-style: normal;
                font-weight: 100 900;
                src: url(data:font/woff2;base64,${latin}) format('woff2');
                unicode-range: ${LATIN_RANGE};
            }
            text { font-family: 'Vazirmatn', 'Segoe UI', system-ui, sans-serif; }

            .star { fill: #cfe0ff; opacity: .35; animation: twinkle 4s ease-in-out infinite; }
            @keyframes twinkle {
                0%, 100% { opacity: .12; }
                50% { opacity: .72; }
            }

            .aurora-a { animation: drift-a 22s ease-in-out infinite alternate; }
            .aurora-b { animation: drift-b 28s ease-in-out infinite alternate; }
            .aurora-c { animation: drift-c 26s ease-in-out infinite alternate; }
            @keyframes drift-a {
                from { transform: translate(-40px, -26px) scale(1); }
                to   { transform: translate(60px, 34px) scale(1.14); }
            }
            @keyframes drift-b {
                from { transform: translate(30px, 20px) scale(1.05); }
                to   { transform: translate(-50px, -30px) scale(.92); }
            }
            @keyframes drift-c {
                from { transform: translate(0, 18px) scale(.95); }
                to   { transform: translate(-36px, -22px) scale(1.12); }
            }

            .orbit { transform-box: view-box; transform-origin: 168px 204px; animation: spin 26s linear infinite; }
            @keyframes spin { to { transform: rotate(360deg); } }

            .sheen { animation: sweep 9s ease-in-out infinite; }
            @keyframes sweep {
                0%   { transform: translateX(-520px); opacity: 0; }
                12%  { opacity: .5; }
                55%  { opacity: .5; }
                70%, 100% { transform: translateX(1320px); opacity: 0; }
            }

            .chip rect { fill: rgba(255,255,255,.055); stroke: rgba(147,160,198,.28); stroke-width: 1; }
            .chip text { fill: #C7D2F0; font-size: 14.5px; font-weight: 600; letter-spacing: .2px; }

            .pulse { animation: pulse 5.5s ease-in-out infinite; }
            @keyframes pulse {
                0%, 100% { opacity: .55; }
                50% { opacity: 1; }
            }
        ]]></style>

        <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stop-color="#070B18" />
            <stop offset=".55" stop-color="#0A1024" />
            <stop offset="1" stop-color="#0D1330" />
        </linearGradient>

        <radialGradient id="auroraViolet">
            <stop offset="0" stop-color="#7C5CFF" stop-opacity=".55" />
            <stop offset="1" stop-color="#7C5CFF" stop-opacity="0" />
        </radialGradient>
        <radialGradient id="auroraCyan">
            <stop offset="0" stop-color="#22D3EE" stop-opacity=".42" />
            <stop offset="1" stop-color="#22D3EE" stop-opacity="0" />
        </radialGradient>
        <radialGradient id="auroraPink">
            <stop offset="0" stop-color="#F472B6" stop-opacity=".32" />
            <stop offset="1" stop-color="#F472B6" stop-opacity="0" />
        </radialGradient>

        <linearGradient id="nameFill" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stop-color="#FFFFFF" />
            <stop offset=".55" stop-color="#E6ECFF" />
            <stop offset="1" stop-color="#A9C4FF" />
        </linearGradient>

        <linearGradient id="ring" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stop-color="#8B5CF6" />
            <stop offset=".5" stop-color="#22D3EE" />
            <stop offset="1" stop-color="#F472B6" />
        </linearGradient>

        <linearGradient id="sheenGradient" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stop-color="#ffffff" stop-opacity="0" />
            <stop offset=".5" stop-color="#ffffff" stop-opacity=".14" />
            <stop offset="1" stop-color="#ffffff" stop-opacity="0" />
        </linearGradient>

        <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M40 0H0V40" fill="none" stroke="#7C8BB8" stroke-opacity=".09" stroke-width="1" />
        </pattern>

        <filter id="soft" x="-40%" y="-40%" width="180%" height="180%">
            <feGaussianBlur stdDeviation="46" />
        </filter>
        <filter id="glow" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="9" result="b" />
            <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>

        <clipPath id="canvas"><rect width="1200" height="420" rx="22" /></clipPath>
    </defs>

    <g clip-path="url(#canvas)">
        <rect width="1200" height="420" fill="url(#bg)" />
        <rect width="1200" height="420" fill="url(#grid)" />

        <g filter="url(#soft)">
            <circle class="aurora-a" cx="230" cy="330" r="220" fill="url(#auroraViolet)" />
            <circle class="aurora-b" cx="980" cy="60" r="210" fill="url(#auroraCyan)" />
            <circle class="aurora-c" cx="700" cy="360" r="190" fill="url(#auroraPink)" />
        </g>

        ${stars}

        <g transform="translate(-240 0) skewX(-14)">
            <rect class="sheen" x="0" y="0" width="240" height="420" fill="url(#sheenGradient)" />
        </g>

        <!-- Monogram -->
        <g transform="translate(96 132)">
            <circle cx="72" cy="72" r="70" fill="rgba(255,255,255,.03)" stroke="url(#ring)" stroke-width="1.6" />
            <circle cx="72" cy="72" r="58" fill="none" stroke="rgba(147,160,198,.18)" stroke-width="1" stroke-dasharray="3 7" />
            <text x="72" y="96" text-anchor="middle" font-size="64" font-weight="800" fill="url(#nameFill)">S</text>
            <g class="orbit">
                <circle cx="72" cy="2" r="4.5" fill="#22D3EE" filter="url(#glow)" />
            </g>
        </g>
        <text x="96" y="316" font-size="12.5" letter-spacing="4.2" fill="#7C8BB8" font-weight="600">SEPEHR SEDDIQ</text>

        <!-- Name (RTL) -->
        <g>
            <text x="1136" y="196" text-anchor="end" font-size="62" font-weight="800" fill="url(#nameFill)">سپهر صدیق</text>
            <text x="1136" y="240" text-anchor="end" font-size="20" fill="#93A0C6">مهندس نرم‌افزار · سازندهٔ سامانهٔ سپهر</text>
            <text x="1136" y="270" text-anchor="end" font-size="14" fill="#6E7CA3" letter-spacing=".6">Software engineer · Persian-first, self-hosted tooling</text>
            ${chipMarkup}
        </g>

        <!-- baseline -->
        <g class="pulse">
            <rect x="96" y="372" width="1008" height="1.4" fill="url(#ring)" opacity=".55" />
        </g>
        <rect width="1200" height="420" rx="22" fill="none" stroke="rgba(147,160,198,.16)" stroke-width="1" />
    </g>
</svg>
`;

fs.mkdirSync(path.join(ROOT, 'assets'), { recursive: true });
fs.writeFileSync(path.join(ROOT, 'assets', 'hero.svg'), svg, 'utf8');
console.log(`wrote assets/hero.svg (${(svg.length / 1024).toFixed(1)} KB)`);
