const https = require('https');
const fs = require('fs');
const path = require('path');
const colors = require('colors');

const globalConfig = require('../config.json');

module.exports = {
    name: 'User Scraper',
    description: 'Scrape all public data about users by ID using a threaded GET approach',

    config: {
        startId: 1,
        batchSize: 250,
        limit: 1000,
        threads: 50,
        savePath: './datasets/users_dataset.jsonl'
    },

    async execute() {
        console.clear();
        console.log('Scraper starting, please give it a second to load...'.yellow);

        const config = globalConfig['User Scraper'] || module.exports.config;

        const startId = Number(config.startId || 1);
        const limit = Number(config.limit || 1000);
        const threads = Number(config.threads || 5);
        const batchSize = Number(config.batchSize || 25);
        const flushLimit = Math.max(1, Math.floor(batchSize / 2));
        const savePath = path.resolve(__dirname, '..', config.savePath || './datasets/users_dataset.jsonl');

        if (!Number.isInteger(startId) || startId <= 0) {
            console.log('Invalid startId in config.'.red);
            return;
        }

        const saveDir = path.dirname(savePath);
        if (!fs.existsSync(saveDir)) fs.mkdirSync(saveDir, { recursive: true });

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

        const fetch = (hostname, path) => {
            return new Promise(resolve => {
                const options = { hostname, path, method: 'GET', timeout: 15000 };
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

        const fetchUser = async (userId) => {
            if (seenIds.has(userId)) {
                console.log(`[↺] ${userId} - Already scraped`.gray);
                return;
            }

            const base = await fetch('users.roblox.com', `/v1/users/${userId}`);
            if (!base || base.error || !base.name) {
                console.log(`[✘] ${userId} - ${base?.error || 'Invalid user or banned'}`.gray);
                return;
            }

            const [profile, avatar, usernames, badges, premium, friends, followers, followings, groups, games, favorites, status, headshot] = await Promise.all([
                fetch('users.roblox.com', `/v1/users/${userId}/profile`),
                fetch('avatar.roblox.com', `/v1/users/${userId}/avatar`),
                fetch('users.roblox.com', `/v1/users/${userId}/username-history?limit=50`),
                fetch('accountinformation.roblox.com', `/v1/users/${userId}/roblox-badges`),
                fetch('premiumfeatures.roblox.com', `/v1/users/${userId}/validate-membership`),
                fetch('friends.roblox.com', `/v1/users/${userId}/friends/count`),
                fetch('friends.roblox.com', `/v1/users/${userId}/followers/count`),
                fetch('friends.roblox.com', `/v1/users/${userId}/followings/count`),
                fetch('groups.roblox.com', `/v2/users/${userId}/groups/roles`),
                fetch('games.roblox.com', `/v2/users/${userId}/games?accessFilter=2&sortOrder=Asc&limit=10`),
                fetch('catalog.roblox.com', `/v1/favorites/users/${userId}/favorites?assetTypeId=1&limit=10`),
                fetch('users.roblox.com', `/v1/users/${userId}/status`),
                fetch('thumbnails.roblox.com', `/v1/users/avatar-headshot?userIds=${userId}&size=150x150&format=Png&isCircular=false`)
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
            if (buffer.length >= flushLimit) flushBuffer();
            console.log(`[✔] ${base.id} - ${base.name}`.green);
        };

        let index = 0;
        const runThreads = async () => {
            while (index < ids.length) {
                const slice = ids.slice(index, index + threads);
                await Promise.all(slice.map(fetchUser));
                index += threads;
                await new Promise(r => setTimeout(r, 100));
            }
        };

        await runThreads();
        flushBuffer();

        console.log(`\nScraping complete. Data saved to ${savePath}`.green);
    }
};
