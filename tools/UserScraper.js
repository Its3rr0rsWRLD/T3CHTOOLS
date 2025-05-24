const https = require('https');
const fs = require('fs');
const path = require('path');
const colors = require('colors');
const cliProgress = require('cli-progress');
const { HttpsProxyAgent } = require('https-proxy-agent');

const configPath = path.resolve(__dirname, '../config.json');
if (!fs.existsSync(configPath)) {
    fs.writeFileSync(configPath, JSON.stringify({}, null, 4));
}

const globalConfig = require('../config.json');

module.exports = {
    name: 'User Scraper',
    description: 'Scrape all public data about users by ID using a threaded GET approach',

    config: {
        startId: 1,
        batchSize: 250,
        limit: 1000,
        threads: 50,
        savePath: './datasets/users_dataset.jsonl',
        proxyFile: './proxies.txt',
        useProxies: false
    },

    async execute() {
        console.clear();
        console.log('Scraper starting, please give it a second to load...'.yellow);

        const config = globalConfig['User Scraper'] || module.exports.config;

        const startId = Number(config.startId || 1);
        const limit = Number(config.limit || 1000);
        const threads = Number(config.threads || 5);
        const batchSize = Number(config.batchSize || 25);
        const savePath = path.resolve(__dirname, '..', config.savePath || './datasets/users_dataset.jsonl');

        if (!Number.isInteger(startId) || startId <= 0) {
            console.log('Invalid startId in config.'.red);
            return;
        }

        const saveDir = path.dirname(savePath);
        if (!fs.existsSync(saveDir)) fs.mkdirSync(saveDir, { recursive: true });

        let proxyList = [];
        if (config.useProxies && fs.existsSync(config.proxyFile)) {
            proxyList = fs.readFileSync(config.proxyFile, 'utf8').split(/\r?\n/).filter(Boolean);
        }

        const ids = Array.from({ length: limit }, (_, i) => startId + i);
        const seenIds = new Set();
        if (fs.existsSync(savePath)) {
            const lines = fs.readFileSync(savePath, 'utf8').split('\n').filter(Boolean);
            lines.forEach(line => {
                try {
                    const user = JSON.parse(line);
                    seenIds.add(user.id);
                } catch {}
            });
        }

        const fetch = (hostname, path, proxy = null) => {
            return new Promise(resolve => {
                const options = { hostname, path, method: 'GET', timeout: 15000 };
                if (proxy) options.agent = new HttpsProxyAgent(proxy);
                const req = https.request(options, res => {
                    let data = '';
                    res.on('data', chunk => data += chunk);
                    res.on('end', () => {
                        try { resolve(JSON.parse(data)); } catch { resolve(null); }
                    });
                });
                req.on('error', () => resolve({ error: 'Request error' }));
                req.on('timeout', () => { req.destroy(); resolve({ error: 'Timeout' }); });
                req.end();
            });
        };

        const buffer = [];
        const flushBuffer = () => {
            if (buffer.length > 0) {
                const out = buffer.map(u => JSON.stringify(u)).join('\n') + '\n';
                fs.appendFileSync(savePath, out);
                buffer.length = 0;
            }
        };

        let checked = 0;
        let success = 0;
        let failed = 0;
        let logs = [];

        const progressBar = new cliProgress.SingleBar({
            format: `[✔] Checked: {checked}/{total} | Success: {success} | Failed: {failed}`.cyan,
            hideCursor: true,
            clearOnComplete: false
        }, cliProgress.Presets.shades_classic);

        progressBar.start(limit, 0, { checked: 0, success: 0, failed: 0 });

        const fetchUser = async (userId) => {
            if (seenIds.has(userId)) return;

            const proxy = config.useProxies && proxyList.length > 0 ? `http://${proxyList[Math.floor(Math.random() * proxyList.length)]}` : null;
            const base = await fetch('users.roblox.com', `/v1/users/${userId}`, proxy);
            if (!base || base.error || !base.name) {
                failed++;
                checked++;
                progressBar.update(checked, { checked, success, failed });
                return;
            }

            const [profile, avatar, usernames, badges, premium, friends, followers, followings, groups, games, favorites, status, headshot] = await Promise.all([
                fetch('users.roblox.com', `/v1/users/${userId}/profile`, proxy),
                fetch('avatar.roblox.com', `/v1/users/${userId}/avatar`, proxy),
                fetch('users.roblox.com', `/v1/users/${userId}/username-history?limit=50`, proxy),
                fetch('accountinformation.roblox.com', `/v1/users/${userId}/roblox-badges`, proxy),
                fetch('premiumfeatures.roblox.com', `/v1/users/${userId}/validate-membership`, proxy),
                fetch('friends.roblox.com', `/v1/users/${userId}/friends/count`, proxy),
                fetch('friends.roblox.com', `/v1/users/${userId}/followers/count`, proxy),
                fetch('friends.roblox.com', `/v1/users/${userId}/followings/count`, proxy),
                fetch('groups.roblox.com', `/v2/users/${userId}/groups/roles`, proxy),
                fetch('games.roblox.com', `/v2/users/${userId}/games?accessFilter=2&sortOrder=Asc&limit=10`, proxy),
                fetch('catalog.roblox.com', `/v1/favorites/users/${userId}/favorites?assetTypeId=1&limit=10`, proxy),
                fetch('users.roblox.com', `/v1/users/${userId}/status`, proxy),
                fetch('thumbnails.roblox.com', `/v1/users/avatar-headshot?userIds=${userId}&size=150x150&format=Png&isCircular=false`, proxy)
            ]);

            const record = {
                id: base.id,
                name: base.name,
                displayName: base.displayName,
                created: base.created,
                description: profile?.description || '',
                avatar: avatar || {},
                pastUsernames: usernames?.data || [],
                badges: badges || [],
                isPremium: premium === true,
                friendCount: friends?.count || 0,
                followerCount: followers?.count || 0,
                followingCount: followings?.count || 0,
                groups: groups?.data || [],
                games: games?.data || [],
                favorites: favorites?.data || [],
                status: status?.status || '',
                headshot: headshot?.data?.[0]?.imageUrl || ''
            };

            buffer.push(record);
            seenIds.add(base.id);
            success++;
            checked++;
            logs.push(`[✔] ${userId} - ${base.name}`.green);
            if (logs.length > 20) logs.shift();
            if (buffer.length >= batchSize) flushBuffer();
            console.clear();
            logs.forEach(log => console.log(log));
            progressBar.update(checked, { checked, success, failed });
        };

        let index = 0;
        const runThreads = async () => {
            while (index < ids.length) {
                const slice = ids.slice(index, index + threads);
                await Promise.all(slice.map(fetchUser));
                index += threads;
            }
        };

        await runThreads();
        flushBuffer();
        progressBar.stop();
        console.log(`\nScraping complete. Data saved to ${savePath}`.green);
    }
};