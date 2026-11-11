/**
 * Builds assets/stats.svg from the public GitHub API.
 * Run locally with a token (gh auth token) or let .github/workflows/stats.yml run it daily.
 *
 *   GITHUB_TOKEN=$(gh auth token) node scripts/stats.mjs
 */
import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(import.meta.dirname, '..');
const USER = 'sepehrsdq';
const OUT = path.join(ROOT, 'assets', 'stats.svg');
const FONT_DIR = path.join(ROOT, 'assets', 'fonts');

const token = process.env.GITHUB_TOKEN || '';
const headers = { Accept: 'application/vnd.github+json', 'User-Agent': USER, ...(token ? { Authorization: `Bearer ${token}` } : {}) };

const api = async (url) => {
    const response = await fetch(`https://api.github.com${url}`, { headers });
    if (!response.ok) throw new Error(`${url} -> ${response.status}`);
    return response.json();
};

const toPersian = (value) => String(value).replace(/\d/g, (digit) => '۰۱۲۳۴۵۶۷۸۹'[Number(digit)]);

const PERSIAN_MONTHS = ['ژانویه', 'فوریه', 'مارس', 'آوریل', 'مه', 'ژوئن', 'ژوئیه', 'اوت', 'سپتامبر', 'اکتبر', 'نوامبر', 'دسامبر'];

// Gregorian date rendered with Persian month names so bidi never reorders the parts.
const persianDate = (iso) => {
    const [year, month, day] = iso.split('-').map(Number);
    return `${toPersian(day)} ${PERSIAN_MONTHS[month - 1]} ${toPersian(year)}`;
};

const LANG_COLORS = {
    JavaScript: '#F1E05A',
    TypeScript: '#3178C6',
    Python: '#3572A5',
    'C#': '#178600',
    Shell: '#89E051',
    HTML: '#E34C26',
    CSS: '#563D7C',
    PHP: '#4F5D95',
    Dockerfile: '#384D54',
    Batchfile: '#C1F12E',
    PowerShell: '#012456',
    'C++': '#F34B7D',
    Go: '#00ADD8',
    Java: '#B07219',
};

const font = (file) => fs.readFileSync(path.join(FONT_DIR, file)).toString('base64');
const ARABIC_RANGE =
    'U+0600-06FF, U+0750-077F, U+0870-0891, U+0897-08E1, U+08E3-08FF, U+200C-200E, U+2010-2011, U+204F, U+2E41, U+FB50-FDFF, U+FE70-FE74, U+FE76-FEFC';
const LATIN_RANGE =
    'U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+0304, U+0308, U+0329, U+2000-206F, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD';

async function collect() {
    const user = await api(`/users/${USER}`);
    const repos = await api(`/users/${USER}/repos?per_page=100&type=owner&sort=updated`);

    const publicRepos = repos.filter((repo) => !repo.fork);
    const stars = publicRepos.reduce((sum, repo) => sum + repo.stargazers_count, 0);

    const languages = {};
    for (const repo of publicRepos) {
        if (!repo.language) continue;
        try {
            const bytes = await api(`/repos/${repo.full_name}/languages`);
            for (const [name, value] of Object.entries(bytes)) languages[name] = (languages[name] || 0) + value;
        } catch {
            languages[repo.language] = (languages[repo.language] || 0) + 1;
        }
    }

    const total = Object.values(languages).reduce((sum, value) => sum + value, 0) || 1;
    const ranked = Object.entries(languages)
        .sort((a, b) => b[1] - a[1])
        .map(([name, value]) => ({ name, share: value / total }));

    const top = ranked.slice(0, 5);
    const rest = ranked.slice(5).reduce((sum, item) => sum + item.share, 0);
    if (rest > 0.005) top.push({ name: 'سایر', share: rest });

    return {
        repos: user.public_repos,
        stars,
        followers: user.followers,
        languages: top,
        updated: new Date().toISOString().slice(0, 10),
    };
}

function render(data) {
    const barX = 96;
    const barWidth = 520;
    const barY = 138;
    const barHeight = 14;

    let cursor = barX;
    const segments = data.languages
        .map((lang) => {
            const width = Math.max(4, Math.round(lang.share * barWidth));
            const color = LANG_COLORS[lang.name] || '#8B5CF6';
            const segment = `<rect x="${cursor}" y="${barY}" width="${width}" height="${barHeight}" rx="0" fill="${color}" />`;
            cursor += width;
            return segment;
        })
        .join('\n        ');

    const legend = data.languages
        .map((lang, index) => {
            const column = index % 3;
            const row = Math.floor(index / 3);
            const x = barX + column * 180;
            const y = barY + 46 + row * 30;
            const color = LANG_COLORS[lang.name] || '#8B5CF6';
            return `<g transform="translate(${x} ${y})">
            <circle cx="5" cy="5" r="4.5" fill="${color}" />
            <text x="18" y="10" font-size="13.5" fill="#C7D2F0">${lang.name}</text>
            <text x="150" y="10" font-size="13" fill="#7C8BB8" text-anchor="end">${toPersian(Math.round(lang.share * 100))}٪</text>
        </g>`;
        })
        .join('\n        ');

    const stats = [
        [data.repos, 'مخزن عمومی'],
        [data.stars, 'ستاره'],
        [data.followers, 'دنبال‌کننده'],
    ]
        .map(([value, label], index) => {
            const x = 1136 - index * 170;
            return `<g transform="translate(${x} 0)">
            <text x="0" y="150" text-anchor="end" font-size="46" font-weight="800" fill="url(#num)">${toPersian(value)}</text>
            <text x="0" y="178" text-anchor="end" font-size="14" fill="#7C8BB8">${label}</text>
        </g>`;
        })
        .join('\n        ');

    return `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="250" viewBox="0 0 1200 250" role="img" aria-label="آمار گیت‌هاب سپهر صدیق">
    <title>آمار گیت‌هاب — به‌روزرسانی ${data.updated}</title>
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
            text { font-family: 'Vazirmatn', 'Segoe UI', system-ui, sans-serif; }
        ]]></style>
        <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stop-color="#080D1C" />
            <stop offset="1" stop-color="#0C1228" />
        </linearGradient>
        <linearGradient id="num" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stop-color="#FFFFFF" />
            <stop offset="1" stop-color="#A9C4FF" />
        </linearGradient>
        <linearGradient id="rule" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stop-color="#8B5CF6" stop-opacity="0" />
            <stop offset=".5" stop-color="#8B5CF6" stop-opacity=".5" />
            <stop offset="1" stop-color="#22D3EE" stop-opacity="0" />
        </linearGradient>
        <clipPath id="bar"><rect x="${barX}" y="${barY}" width="${barWidth}" height="${barHeight}" rx="7" /></clipPath>
        <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M40 0H0V40" fill="none" stroke="#7C8BB8" stroke-opacity=".07" stroke-width="1" />
        </pattern>
    </defs>

    <rect width="1200" height="250" rx="20" fill="url(#bg)" />
    <rect width="1200" height="250" rx="20" fill="url(#grid)" />

    <text x="1136" y="52" text-anchor="end" font-size="14" fill="#7C8BB8">در یک نگاه</text>
    <text x="1136" y="86" text-anchor="end" font-size="22" font-weight="700" fill="#E8ECFF">آمار گیت‌هاب</text>
    ${stats}

    <text x="96" y="104" font-size="14" fill="#7C8BB8">زبان‌هایی که با آن‌ها کار می‌کنم</text>
    <g clip-path="url(#bar)">
        ${segments}
    </g>
    <rect x="${barX}" y="${barY}" width="${barWidth}" height="${barHeight}" rx="7" fill="none" stroke="rgba(147,160,198,.18)" />
    ${legend}

    <text x="96" y="52" font-size="12" fill="#55638C">آخرین به‌روزرسانی: ${persianDate(data.updated)}</text>\n    <rect x="96" y="226" width="1008" height="1" fill="url(#rule)" />
    <rect width="1200" height="250" rx="20" fill="none" stroke="rgba(147,160,198,.14)" />
</svg>
`;
}

try {
    const data = await collect();
    fs.mkdirSync(path.dirname(OUT), { recursive: true });
    fs.writeFileSync(OUT, render(data), 'utf8');
    console.log(`wrote assets/stats.svg — ${data.repos} repos, ${data.stars} stars, ${data.followers} followers`);
    console.log('languages:', data.languages.map((l) => `${l.name} ${Math.round(l.share * 100)}%`).join(', '));
} catch (error) {
    if (fs.existsSync(OUT)) {
        console.warn(`stats not refreshed: ${error.message}`);
    } else {
        throw error;
    }
}
