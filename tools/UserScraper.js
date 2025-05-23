const https = require('https');
const fs = require('fs');
const path = require('path');
const colors = require('colors');

const globalConfig = require('../config.json');

module.exports = {
    name: 'User Scraper',
    description: 'Scrape public data about users by ID using a threaded GET approach',

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
                const options = { hostname, path, method: 'GET', timeout: 5000 };
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
            if (!base || base.error) {
                console.log(`[✘] ${userId} - ${base?.error || 'No response'}`.gray);
                return;
            }

            if (!base.name) {
                console.log(`[✘] ${userId} - Deleted or banned`.gray);
                return;
            }

            const [profile, avatar, created, badges, premium] = await Promise.all([
                fetch('users.roblox.com', `/v1/users/${userId}/profile`),
                fetch('avatar.roblox.com', `/v1/users/${userId}/avatar`),
                fetch('users.roblox.com', `/v1/users/${userId}/username-history?limit=50`),
                fetch('accountinformation.roblox.com', `/v1/users/${userId}/roblox-badges`),
                fetch('premiumfeatures.roblox.com', `/v1/users/${userId}/validate-membership`)
            ]);

            const record = {
                id: base.id,
                name: base.name,
                displayName: base.displayName,
                created: base.created,
                description: profile?.description || '',
                avatar: avatar || {},
                pastUsernames: created?.data || [],
                badges: badges || [],
                isPremium: premium === true
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
}
