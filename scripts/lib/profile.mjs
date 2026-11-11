/**
 * Small GitHub API helper shared by the generators.
 * Returns null when the API is unavailable so callers can fall back to sane defaults.
 */
const USER = 'sepehrsdq';

const TOPIC_DISPLAY = {
    nodejs: 'Node.js',
    webrtc: 'WebRTC',
    rtl: 'RTL',
    'self-hosted': 'Self-hosted',
    'video-conferencing': 'Video calls',
    sfu: 'SFU',
    mediasoup: 'mediasoup',
    persian: 'Persian',
    docker: 'Docker',
    kubernetes: 'Kubernetes',
    redis: 'Redis',
    postgresql: 'PostgreSQL',
    'csharp': 'C#',
    'dotnet': '.NET',
};

const DISPLAY = {
    JavaScript: 'JavaScript',
    TypeScript: 'TypeScript',
    Python: 'Python',
    'C#': 'C#',
    Shell: 'Shell',
    HTML: 'HTML',
    CSS: 'CSS',
    PHP: 'PHP',
    Dockerfile: 'Docker',
    PowerShell: 'PowerShell',
    'C++': 'C++',
    Go: 'Go',
    Java: 'Java',
    Ruby: 'Ruby',
    Rust: 'Rust',
    Batchfile: 'Batch',
};

async function api(url, headers) {
    const response = await fetch(`https://api.github.com${url}`, { headers });
    if (!response.ok) throw new Error(`${url} -> ${response.status}`);
    return response.json();
}

// "3h ago" style relative time for the terminal line.
const ago = (iso) => {
    const minutes = Math.max(0, Math.round((Date.now() - new Date(iso).getTime()) / 60000));
    if (minutes < 2) return 'just now';
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.round(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.round(hours / 24);
    if (days < 30) return `${days}d ago`;
    return `${Math.round(days / 30)}mo ago`;
};

export async function loadProfile() {
    const token = process.env.GITHUB_TOKEN || '';
    const headers = {
        Accept: 'application/vnd.github+json',
        'User-Agent': USER,
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };

    try {
        const [user, repos] = await Promise.all([
            api(`/users/${USER}`, headers),
            api(`/users/${USER}/repos?per_page=100&type=owner&sort=pushed`, headers),
        ]);

        const own = repos.filter((repo) => !repo.fork && repo.name !== USER);
        const languages = {};
        for (const repo of own) {
            if (!repo.language) continue;
            try {
                const bytes = await api(`/repos/${repo.full_name}/languages`, headers);
                for (const [name, value] of Object.entries(bytes)) languages[name] = (languages[name] || 0) + value;
            } catch {
                languages[repo.language] = (languages[repo.language] || 0) + 1;
            }
        }

        const total = Object.values(languages).reduce((sum, value) => sum + value, 0) || 1;
        const ranked = Object.entries(languages)
            .sort((a, b) => b[1] - a[1])
            .map(([name, value]) => ({ name, label: DISPLAY[name] || name, share: value / total }));

        let latest = null;
        const newest = own.find((repo) => !repo.archived) || own[0];
        if (newest) {
            try {
                const commits = await api(`/repos/${newest.full_name}/commits?per_page=1`, headers);
                latest = { repo: newest.name, message: (commits[0]?.commit?.message || '').split('\n')[0].trim() };
            } catch {
                latest = { repo: newest.name, message: (newest.description || '').trim() };
            }
        }

        // Newest commit written by me (search index, one request), skipping the profile repo itself.
        let lastCommit = null;
        try {
            const found = await api(
                `/search/commits?q=${encodeURIComponent(`author:${USER} -repo:${USER}/${USER}`)}&sort=committer-date&order=desc&per_page=1`,
                headers,
            );
            const hit = found.items?.[0];
            if (hit) {
                lastCommit = {
                    repo: hit.repository?.name || '',
                    sha: String(hit.sha || '').slice(0, 7),
                    message: String(hit.commit?.message || '').split('\n')[0].trim(),
                    when: ago(hit.commit?.committer?.date || hit.commit?.author?.date || Date.now()),
                    at: hit.commit?.committer?.date || null,
                };
            }
        } catch {
            if (latest) lastCommit = { ...latest, sha: '', when: '', at: null };
        }

        if (!lastCommit && latest) lastCommit = { ...latest, sha: '', when: '', at: null };

        const topicCounts = {};
        for (const repo of own) {
            for (const topic of repo.topics || []) topicCounts[topic] = (topicCounts[topic] || 0) + 1;
        }
        const topics = Object.entries(topicCounts)
            .sort((a, b) => b[1] - a[1])
            .map(([name]) => TOPIC_DISPLAY[name] || name);

        return {
            login: user.login,
            repos: user.public_repos,
            stars: own.reduce((sum, repo) => sum + repo.stargazers_count, 0),
            followers: user.followers,
            topics,
            projects: own.slice(0, 4).map((repo) => repo.name),
            languages: ranked,
            latest,
            lastCommit,
        };
    } catch (error) {
        console.warn(`profile data unavailable: ${error.message}`);
        return null;
    }
}

export const truncate = (text, max) => {
    if (text.length <= max) return text;
    const cut = text.slice(0, max - 1);
    const space = cut.lastIndexOf(' ');
    return `${(space > max * 0.6 ? cut.slice(0, space) : cut).trimEnd()}…`;
};
