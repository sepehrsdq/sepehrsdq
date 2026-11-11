/**
 * Builds assets/stack.svg — the tool strip under the hero.
 * Uses the same visual language as the hero so the page feels like one piece.
 *
 *   node scripts/stack.mjs
 */
import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(import.meta.dirname, '..');
const FONT_DIR = path.join(ROOT, 'assets', 'fonts');

const font = (file) => fs.readFileSync(path.join(FONT_DIR, file)).toString('base64');

const ARABIC_RANGE =
    'U+0600-06FF, U+0750-077F, U+0870-0891, U+0897-08E1, U+08E3-08FF, U+200C-200E, U+2010-2011, U+204F, U+2E41, U+FB50-FDFF, U+FE70-FE74, U+FE76-FEFC';
const LATIN_RANGE =
    'U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+0304, U+0308, U+0329, U+2000-206F, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD';

const items = [
    ['C# / .NET', 96],
    ['Python', 84],
    ['Node.js', 92],
    ['PostgreSQL', 112],
    ['Redis', 78],
    ['Docker', 86],
    ['Linux', 74],
    ['WebRTC', 92],
    ['mediasoup', 108],
    ['AI agents', 100],
];

const gap = 10;
const total = items.reduce((sum, [, width]) => sum + width, 0) + gap * (items.length - 1);
const height = 84;
const top = 22;

let x = Math.round((1200 - total) / 2);
const chips = items
    .map(([label, width]) => {
        const markup = `<g transform="translate(${x} ${top})">
            <rect width="${width}" height="40" rx="20" />
            <text x="${width / 2}" y="26" text-anchor="middle">${label}</text>
        </g>`;
        x += width + gap;
        return markup;
    })
    .join('\n        ');

const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="${height}" viewBox="0 0 1200 ${height}" role="img" aria-label="ابزارها و فناوری‌ها">
    <defs>
        <style type="text/css"><![CDATA[
            @font-face {
                font-family: 'Vazirmatn';
                font-style: normal;
                font-weight: 100 900;
                src: url(data:font/woff2;base64,${font('vazir-arabic.woff2')}) format('woff2');
                unicode-range: ${ARABIC_RANGE};
            }
            @font-face {
                font-family: 'Vazirmatn';
                font-style: normal;
                font-weight: 100 900;
                src: url(data:font/woff2;base64,${font('vazir-latin.woff2')}) format('woff2');
                unicode-range: ${LATIN_RANGE};
            }
            text { font-family: 'Vazirmatn', 'Segoe UI', system-ui, sans-serif; fill: #C7D2F0; font-size: 15px; font-weight: 600; letter-spacing: .2px; }
            rect { fill: rgba(255,255,255,.04); stroke: rgba(147,160,198,.22); stroke-width: 1; }
            g:hover rect { stroke: rgba(139,92,246,.65); }
        ]]></style>
        <linearGradient id="line" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stop-color="#8B5CF6" stop-opacity="0" />
            <stop offset=".5" stop-color="#8B5CF6" stop-opacity=".55" />
            <stop offset="1" stop-color="#22D3EE" stop-opacity="0" />
        </linearGradient>
    </defs>
    <rect x="0" y="${height - 6}" width="1200" height="1" fill="url(#line)" />
    ${chips}
</svg>
`;

fs.mkdirSync(path.join(ROOT, 'assets'), { recursive: true });
fs.writeFileSync(path.join(ROOT, 'assets', 'stack.svg'), svg, 'utf8');
console.log(`wrote assets/stack.svg (${(svg.length / 1024).toFixed(1)} KB)`);
