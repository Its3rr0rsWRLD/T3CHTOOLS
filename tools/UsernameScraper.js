const https = require('https');
const fs = require('fs');
const path = require('path');
const colors = require('colors');
const globalConfig = require('../config.json');

module.exports = {
    name: 'Username Scraper',
    description: 'Check all possible usernames of a specific length for availability',

    config: {
        threads: 25,
        length: 5,
        charset: 'abcdefghijklmnopqrstuvwxyz0123456789',
        savePath: './datasets/available_usernames.txt'
    },

    async execute() {
        console.clear();
        console.log('[*] Username Sniper starting...'.yellow);

        const config = globalConfig['Username Sniper'] || module.exports.config;
        const threadCount = Number(config.threads || 10);
        const usernameLength = Number(config.length || 4);
        const charset = config.charset;
        const savePath = path.resolve(__dirname, '..', config.savePath);
        const outputDir = path.dirname(savePath);

        if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });

        const combinations = [];
        const generateCombos = (prefix = '') => {
            if (prefix.length === usernameLength) {
                combinations.push(prefix);
                return;
            }
            for (const char of charset) {
                generateCombos(prefix + char);
            }
        };
        generateCombos();

        const chunkSize = Math.ceil(combinations.length / threadCount);
        let available = [];

        const checkUsername = (username) => {
            return new Promise(resolve => {
                const options = {
                    hostname: 'users.roblox.com',
                    path: `/v1/usernames/validate?username=${username}&birthday=2000-01-01`,
                    method: 'GET',
                    timeout: 5000
                };
                const req = https.request(options, res => {
                    let data = '';
                    res.on('data', chunk => data += chunk);
                    res.on('end', () => {
                        try {
                            const result = JSON.parse(data);
                            if (result.code === 0) {
                                available.push(username);
                                console.log(`[✔] ${username}`.green);
                            } else {
                                const reason = {
                                    1: 'Invalid username',
                                    2: 'Username already taken',
                                    3: 'Inappropriate username',
                                    4: 'Too short',
                                    5: 'Too long'
                                }[result.code] || 'Unavailable';
                                console.log(`[✘] ${username} - ${reason}`.red);
                            }
                        } catch {
                            console.log(`[✘] ${username} - Parse error`.red);
                        }
                        resolve();
                    });
                });
                req.on('error', () => {
                    console.log(`[✘] ${username} - Request error`.red);
                    resolve();
                });
                req.on('timeout', () => {
                    console.log(`[✘] ${username} - Timeout`.red);
                    req.destroy();
                    resolve();
                });
                req.end();
            });
        };

        const runWorker = async (chunk) => {
            for (const name of chunk) {
                await checkUsername(name);
            }
        };

        const chunks = Array.from({ length: threadCount }, (_, i) => combinations.slice(i * chunkSize, (i + 1) * chunkSize));
        await Promise.all(chunks.map(runWorker));

        fs.writeFileSync(savePath, available.join('\n'));
        console.log(`\n[*] Done. ${available.length} available usernames saved to ${savePath}`.cyan);
    }
};