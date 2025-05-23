const https = require('https');
const http = require('http');
const fs = require('fs');
const path = require('path');
const colors = require('colors');
const readline = require('readline');
const globalConfig = require('../config.json');
const { HttpsProxyAgent } = require('https-proxy-agent');

module.exports = {
    name: 'Friend Scraper',
    description: 'Recursively scrape friends of a user to a defined depth',

    config: {
        userId: 1,
        depth: 2,
        threads: 5,
        savePath: './datasets/friends_dataset.jsonl',
        proxy: ''
    },

    async execute() {
        console.clear();
        console.log('Friend Scraper starting...'.yellow);

        const config = globalConfig['Friend Scraper'] || module.exports.config;
        const startId = Number(config.userId);
        const maxDepth = Number(config.depth || 1);
        const threads = Number(config.threads || 5);
        const savePath = path.resolve(__dirname, '..', config.savePath || './datasets/friends_dataset.jsonl');
        const proxy = config.proxy || null;

        const saveDir = path.dirname(savePath);
        if (!fs.existsSync(saveDir)) fs.mkdirSync(saveDir, { recursive: true });

        const seen = new Set();
        const saved = new Set();
        const buffer = [];
        const startTime = Date.now();
        let totalFriends = 0;
        let processedUsers = 0;
        let completed = false;
        let rateLimitHit = false;
        let lastStatus = '';
        let lastPrintedRateLimit = false;

        if (fs.existsSync(savePath)) {
            const lines = fs.readFileSync(savePath, 'utf8').split('\n').filter(Boolean);
            lines.forEach(line => {
                try {
                    const user = JSON.parse(line);
                    saved.add(user.id);
                } catch {}
            });
        }

        const flushBuffer = () => {
            if (buffer.length > 0) {
                const out = buffer.map(u => JSON.stringify(u)).join('\n') + '\n';
                fs.appendFileSync(savePath, out);
                buffer.length = 0;
            }
        };

        const fetchFriends = (userId) => {
            return new Promise(resolve => {
                const options = {
                    hostname: 'friends.roblox.com',
                    path: `/v1/users/${userId}/friends`,
                    method: 'GET',
                    timeout: 5000,
                    agent: proxy ? new HttpsProxyAgent(proxy) : undefined
                };

                const req = https.request(options, res => {
                    let data = '';
                    res.on('data', chunk => data += chunk);
                    res.on('end', () => {
                        if (res.statusCode === 429) {
                            if (!lastPrintedRateLimit) {
                                console.log('\n[!] Rate limit hit. Slowing down...'.yellow);
                                lastPrintedRateLimit = true;
                            }
                        } else {
                            lastPrintedRateLimit = false;
                        }
                        try {
                            const parsed = JSON.parse(data);
                            resolve(Array.isArray(parsed.data) ? parsed.data : []);
                        } catch {
                            resolve([]);
                        }
                    });
                });

                req.on('error', () => resolve([]));
                req.on('timeout', () => { req.destroy(); resolve([]); });
                req.end();
            });
        };

        const queue = [{ id: startId, depth: 0 }];

        const logStatus = () => {
            const elapsed = (Date.now() - startTime) / 1000;
            const eta = processedUsers ? (elapsed / processedUsers) * (queue.length + processedUsers - processedUsers) : 0;
            const etaString = completed ? 'done' : `${Math.round(eta)}s remaining`;
            const status = `[STATUS] Processed: ${processedUsers} | Friends Found: ${totalFriends} | ETA: ${etaString}`.cyan;

            if (status !== lastStatus) {
                readline.clearLine(process.stdout, 0);
                readline.cursorTo(process.stdout, 0);
                process.stdout.write(status + '\n');
                lastStatus = status;
            }
        };

        const runThreads = async () => {
            const workers = Array.from({ length: threads }).map(async () => {
                while (queue.length > 0) {
                    const next = queue.shift();
                    if (!next) continue;
                    const { id, depth } = next;
                    if (depth > maxDepth || seen.has(id)) continue;
                    seen.add(id);

                    const friends = await fetchFriends(id);
                    totalFriends += friends.length;
                    processedUsers++;

                    for (const friend of friends) {
                        if (!saved.has(friend.id)) {
                            buffer.push(friend);
                            saved.add(friend.id);
                            console.log(`[✔] ${friend.id} - ${friend.name}`.green);
                            if (buffer.length >= 10) flushBuffer();
                        }
                        if (!seen.has(friend.id)) {
                            queue.push({ id: friend.id, depth: depth + 1 });
                        }
                    }

                    logStatus();
                    await new Promise(r => setTimeout(r, 100));
                }
            });

            await Promise.all(workers);
            completed = true;
        };

        await runThreads();
        flushBuffer();
        logStatus();

        console.log(`\nFriend scraping complete. Data saved to ${savePath}`.green);
    }
} 