const fs = require('fs');
const path = require('path');
const axios = require('axios');
const { HttpsProxyAgent } = require('https-proxy-agent');
const colors = require('colors');
const prompt = require('prompt-sync')();

module.exports = {
    name: 'Proxy Checker',
    description: 'Validate proxies via ipify, supports ip:port and ip:port:user:pass',
    config: {
        threads: 50,
        timeout: 10,
        delete_failed: true,
        proxyFile: './proxies.txt'
    },

    async execute() {
        const configPath = path.resolve(__dirname, '../config.json');
        let globalConfig = {};
        if (fs.existsSync(configPath)) {
            globalConfig = JSON.parse(fs.readFileSync(configPath, 'utf8'));
        }
        const cfg = globalConfig['Proxy Checker'] || this.config;
        const threads = Number(cfg.threads);
        const timeout = Number(cfg.timeout) * 1000;
        const deleteFailed = cfg.delete_failed !== false;
        const filePath = path.resolve(__dirname, '..', cfg.proxyFile);

        if (!fs.existsSync(filePath)) {
            console.log('No proxies.txt found'.red);
            return;
        }

        const raw = fs.readFileSync(filePath, 'utf8');
        const proxies = raw.split(/\r?\n/)
            .map(l => l.trim())
            .filter(Boolean)
            .filter(p => /^\d{1,3}(?:\.\d{1,3}){3}:\d{2,5}(?::\w+:\w+)?$/.test(p));
        const total = proxies.length;

        let working = [];
        let failedCount = 0;
        let completed = 0;
        let index = 0;

        const parseProxy = (str) => {
            const parts = str.split(':');
            if (parts.length === 4) {
                return `http://${parts[2]}:${parts[3]}@${parts[0]}:${parts[1]}`;
            }
            return `http://${parts[0]}:${parts[1]}`;
        };

        const showStatus = () => {
            console.clear();
            console.log(
                `[Checking] ${completed}/${total} | Working: ${working.length} | Failed: ${failedCount}`.info
            );
        };

        console.log(`\nLoaded ${total} proxies`.info);
        showStatus();

        const timeoutPromise = (ms) => new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), ms));

        const worker = async () => {
            while (true) {
                let proxyStr;
                if (index >= total) return;
                proxyStr = proxies[index++];

                const proxyUrl = parseProxy(proxyStr);

                try {
                    await Promise.race([
                        axios.get('https://api.ipify.org?format=json', {
                            httpAgent: new HttpsProxyAgent(proxyUrl),
                            httpsAgent: new HttpsProxyAgent(proxyUrl),
                            timeout
                        }),
                        timeoutPromise(timeout + 2000)
                    ]);
                    working.push(proxyStr);
                } catch {
                    failedCount++;
                }

                completed++;
                showStatus();
            }
        };

        await Promise.all(
            Array.from({ length: threads }, () => worker())
        );

        showStatus();
        console.log('\nDone.'.green);

        if (deleteFailed) {
            fs.writeFileSync(filePath, working.join('\n'), 'utf8');
            console.log(`Saved ${working.length} working proxies.`.green);
        }

        prompt('\nPress any key to return to menu');
    }
};
