/**
 * Builds assets/hero.svg — an animated terminal banner for the profile.
 *
 *   node scripts/hero.mjs
 */
import fs from 'node:fs';
import path from 'node:path';

import { loadProfile, truncate } from './lib/profile.mjs';

const esc = (value) =>
    String(value).replace(/[&<>"]/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[character]);

const ROOT = path.resolve(import.meta.dirname, '..');
const FONT_DIR = path.join(ROOT, 'assets', 'fonts');

const font = (file) => fs.readFileSync(path.join(FONT_DIR, file)).toString('base64');

const ARABIC_RANGE =
    'U+0600-06FF, U+0750-077F, U+0870-0891, U+0897-08E1, U+08E3-08FF, U+200C-200E, U+2010-2011, U+204F, U+2E41, U+FB50-FDFF, U+FE70-FE74, U+FE76-FEFC';

// Small deterministic PRNG so the star field is stable between builds.
let seed = 20261014;
const random = () => {
    seed = (seed * 1664525 + 1013904223) % 4294967296;
    return seed / 4294967296;
};

const stars = Array.from({ length: 34 }, () => {
    const x = Math.round(20 + random() * 1160);
    const y = Math.round(14 + random() * 392);
    const radius = (0.5 + random() * 1.3).toFixed(2);
    const delay = (random() * 8).toFixed(2);
    const duration = (3.6 + random() * 4.5).toFixed(2);
    return `<circle cx="${x}" cy="${y}" r="${radius}" fill="#cfe0ff" class="star" style="animation-delay:-${delay}s;animation-duration:${duration}s"/>`;
}).join('\n        ');

const chips = [
    ['C# / .NET', 96, 0],
    ['Python', 84, 106],
    ['Node.js', 92, 200],
    ['WebRTC', 92, 302],
]
    .map(([label, width, offset]) => {
        const x = 1156 - offset - width;
        return `<g class="chip" transform="translate(${x} 300)"><rect width="${width}" height="34" rx="17" /><text x="${width / 2}" y="22" text-anchor="middle">${label}</text></g>`;
    })
    .join('\n        ');

const line = (y, markup) => `<text class="line" x="70" y="${y}">${markup}</text>`;

// Live data with a graceful fallback so a rate-limited build never breaks the design.
const profile = await loadProfile();
const projectNames = (profile?.projects?.length ? profile.projects : ['sepehr-meeting', 'darsjo', 'Zanjir', 'SdqTerminal'])
    .slice()
    .filter(Boolean);

const picked = [];
let used = 0;
for (const name of projectNames) {
    const short = truncate(name, 16);
    if (used + short.length + 1 > 54) break;
    picked.push({ short, first: picked.length === 0 });
    used += short.length + 1;
}

const projectsLine = picked
    .map(({ short, first }) => `<tspan fill="${first ? '#79C0FF' : '#8B949E'}">${esc(short)}</tspan>`)
    .join(' ');

const commit = profile?.lastCommit || {
    repo: 'Sepehr-Meeting',
    sha: '4b7c1d9',
    message: 'self-hosted video calls that work in Persian',
    when: '',
};

const commitPrefix = [commit.sha, commit.repo ? `${commit.repo}:` : ''].filter(Boolean).join(' ');
const commitMessage = truncate(commit.message || 'shipping something small', Math.max(24, 56 - commitPrefix.length));
const commitLine = [
    commit.sha ? `<tspan fill="#E3B341">${esc(commit.sha)}</tspan>` : '',
    commit.repo ? `<tspan fill="#79C0FF">${esc(commit.repo)}:</tspan>` : '',
    `<tspan fill="#C7D2F0">${esc(commitMessage)}</tspan>`,
]
    .filter(Boolean)
    .join(' ');

const tagline = 'self-hosted video calls that don\u2019t need a cloud';

const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="420" viewBox="0 0 1200 420" role="img" aria-labelledby="title desc">
    <title id="title">Sepehr Seddiq — profile banner</title>
    <desc id="desc">An animated terminal window with a short introduction</desc>
    <defs>
        <style type="text/css"><![CDATA[
            @font-face {
                font-family: 'Vazirmatn';
                font-style: normal;
                font-weight: 100 900;
                src: url(data:font/woff2;base64,${font('vazir-arabic.woff2')}) format('woff2');
                unicode-range: ${ARABIC_RANGE};
            }

            .mono { font-family: ui-monospace, 'Cascadia Code', 'SFMono-Regular', Consolas, 'Liberation Mono', monospace; }
            .name { font-family: 'Vazirmatn', 'Segoe UI', system-ui, sans-serif; }
            .sans { font-family: 'Segoe UI', system-ui, -apple-system, sans-serif; }

            .star { opacity: .35; animation: twinkle 4s ease-in-out infinite; }
            @keyframes twinkle {
                0%, 100% { opacity: .1; }
                50% { opacity: .65; }
            }

            .aurora-a { animation: drift-a 24s ease-in-out infinite alternate; }
            .aurora-b { animation: drift-b 30s ease-in-out infinite alternate; }
            @keyframes drift-a {
                from { transform: translate(-30px, -20px) scale(1); }
                to   { transform: translate(50px, 26px) scale(1.12); }
            }
            @keyframes drift-b {
                from { transform: translate(26px, 16px) scale(1.04); }
                to   { transform: translate(-44px, -26px) scale(.94); }
            }

            .cursor { opacity: 0; animation: blink 1.1s steps(1, end) 5s infinite; }
            @keyframes blink { 0%, 49% { opacity: 1; } 50%, 100% { opacity: 0; } }

            .dot { animation: pulse 3.2s ease-in-out infinite; }
            @keyframes pulse {
                0%, 100% { opacity: .35; }
                50% { opacity: 1; }
            }

            .win { animation: lift 7s ease-in-out infinite; }
            @keyframes lift {
                0%, 100% { transform: translateY(0); }
                50% { transform: translateY(-4px); }
            }

            .scan { animation: scan 7s linear infinite; }
            @keyframes scan {
                from { transform: translateY(0); }
                to   { transform: translateY(250px); }
            }

            .chip rect { fill: rgba(255,255,255,.045); stroke: rgba(147,160,198,.22); stroke-width: 1; }
            .chip text {
                font-family: 'Segoe UI', system-ui, sans-serif;
                fill: #C7D2F0; font-size: 13.5px; font-weight: 600; letter-spacing: .2px;
            }

            @media (prefers-reduced-motion: reduce) {
                .star, .aurora-a, .aurora-b, .cursor, .dot, .win { animation: none; }
                .cursor { opacity: 1; }
            }
        ]]></style>

        <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stop-color="#06090F" />
            <stop offset=".6" stop-color="#0A1020" />
            <stop offset="1" stop-color="#0C1330" />
        </linearGradient>

        <radialGradient id="violet">
            <stop offset="0" stop-color="#7C5CFF" stop-opacity=".5" />
            <stop offset="1" stop-color="#7C5CFF" stop-opacity="0" />
        </radialGradient>
        <radialGradient id="cyan">
            <stop offset="0" stop-color="#22D3EE" stop-opacity=".34" />
            <stop offset="1" stop-color="#22D3EE" stop-opacity="0" />
        </radialGradient>

        <linearGradient id="name" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stop-color="#FFFFFF" />
            <stop offset=".6" stop-color="#E6ECFF" />
            <stop offset="1" stop-color="#9DBDFF" />
        </linearGradient>

        <linearGradient id="rule" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stop-color="#8B5CF6" stop-opacity="0" />
            <stop offset=".35" stop-color="#8B5CF6" stop-opacity=".55" />
            <stop offset=".7" stop-color="#22D3EE" stop-opacity=".45" />
            <stop offset="1" stop-color="#22D3EE" stop-opacity="0" />
        </linearGradient>

        <linearGradient id="scanGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#7EE787" stop-opacity="0" /><stop offset=".5" stop-color="#7EE787" stop-opacity=".10" /><stop offset="1" stop-color="#7EE787" stop-opacity="0" /></linearGradient>\n        <linearGradient id="term" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stop-color="#0C1224" />
            <stop offset="1" stop-color="#0A0F1E" />
        </linearGradient>

        <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M40 0H0V40" fill="none" stroke="#7C8BB8" stroke-opacity=".07" stroke-width="1" />
        </pattern>

        <filter id="soft" x="-40%" y="-40%" width="180%" height="180%">
            <feGaussianBlur stdDeviation="52" />
        </filter>
        <filter id="shadow" x="-20%" y="-20%" width="140%" height="150%">
            <feDropShadow dx="0" dy="10" stdDeviation="16" flood-color="#000" flood-opacity=".45" />
        </filter>

        <clipPath id="canvas"><rect width="1200" height="420" rx="20" /></clipPath>
    </defs>

    <g clip-path="url(#canvas)">
        <rect width="1200" height="420" fill="url(#bg)" />
        <rect width="1200" height="420" fill="url(#grid)" />

        <g filter="url(#soft)">
            <circle class="aurora-a" cx="210" cy="330" r="210" fill="url(#violet)" />
            <circle class="aurora-b" cx="1010" cy="70" r="200" fill="url(#cyan)" />
        </g>

        ${stars}

        <!-- Terminal window -->
        <g class="win" filter="url(#shadow)">
            <rect x="44" y="40" width="620" height="336" rx="14" fill="url(#term)" stroke="rgba(147,160,198,.18)" />
            <path d="M44 54a14 14 0 0 1 14-14h592a14 14 0 0 1 14 14v22H44z" fill="rgba(255,255,255,.035)" />
            <line x1="44" y1="76" x2="664" y2="76" stroke="rgba(147,160,198,.16)" />
            <circle cx="66" cy="58" r="4.6" fill="#FF5F57" />
            <circle cx="82" cy="58" r="4.6" fill="#FEBC2E" />
            <circle cx="98" cy="58" r="4.6" fill="#28C840" />
            <text x="118" y="62.5" class="mono" font-size="11.5" fill="#6E7CA3">sepehr@github: ~</text>

            <rect class="scan" x="44" y="80" width="620" height="46" fill="url(#scanGrad)" opacity=".5" /><g class="mono" font-size="14.5">
                ${line(108, '<tspan fill="#7EE787">~/sepehr</tspan> <tspan fill="#8B949E">$</tspan> <tspan fill="#E6EDF3">whoami</tspan>')}
                ${line(134, '<tspan fill="#C7D2F0">sepehr</tspan> <tspan fill="#8B949E">— backend &amp; whatever-else-breaks</tspan>')}
                ${line(164, '<tspan fill="#7EE787">~/sepehr</tspan> <tspan fill="#8B949E">$</tspan> <tspan fill="#E6EDF3">ls projects/</tspan>')}
                ${line(190, projectsLine)}
                ${line(220, '<tspan fill="#7EE787">~/sepehr</tspan> <tspan fill="#8B949E">$</tspan> <tspan fill="#E6EDF3">git log -1 --oneline</tspan>')}
                ${line(246, commitLine)}
                ${line(276, '<tspan fill="#7EE787">~/sepehr</tspan> <tspan fill="#8B949E">$</tspan> <tspan fill="#E6EDF3">cat now.txt</tspan>')}
                ${line(302, `<tspan fill="#C7D2F0">${esc(tagline)}</tspan>`)}
                ${line(330, '<tspan fill="#7EE787">~/sepehr</tspan> <tspan fill="#8B949E">$</tspan>')}
            </g>
            <text x="648" y="246" text-anchor="end" class="mono" font-size="11.5" fill="#55638C">${esc(commit.when || 'today')}</text>
            <rect class="cursor" x="168" y="317" width="9" height="18" rx="2" fill="#7EE787" />
        </g>

        <!-- Identity -->
        <g class="name">
            <text x="1156" y="112" text-anchor="end" font-size="54" font-weight="800" fill="url(#name)">سپهر صدیق</text>
        </g>
        <text x="1156" y="150" text-anchor="end" class="mono" font-size="13.5" fill="#6E7CA3">@sepehrsdq</text>

        <g class="sans" font-size="15.5" fill="#93A0C6">
            <text x="1156" y="198" text-anchor="end">Self-hosting beats trusting someone else's uptime.</text>
            <text x="1156" y="224" text-anchor="end">Mostly C#, sometimes Python, always a terminal.</text>
            <text x="1156" y="250" text-anchor="end">Currently: video calls that don't need a cloud.</text>
        </g>

        ${chips}

        <text x="1156" y="372" text-anchor="end" class="mono" font-size="12" fill="#55638C">github.com/sepehrsdq</text>

        <rect x="44" y="396" width="1112" height="1.2" fill="url(#rule)" />
        <circle class="dot" cx="60" cy="396" r="2.6" fill="#22D3EE" />

        <rect width="1200" height="420" rx="20" fill="none" stroke="rgba(147,160,198,.14)" />
    </g>
</svg>
`;

fs.mkdirSync(path.join(ROOT, 'assets'), { recursive: true });
fs.writeFileSync(path.join(ROOT, 'assets', 'hero.svg'), svg, 'utf8');
console.log(`wrote assets/hero.svg (${(svg.length / 1024).toFixed(1)} KB)`);
