const prompt = require('prompt-sync')();
const axios = require('axios');
const fs = require('fs');
const HttpsProxyAgent = require('https-proxy-agent');
const colors = require('colors');

module.exports = {
    name: 'Proxy Checker',
    description: 'Check proxies',
    delete_failed_proxies: true,

    config: {
        threads: 100,
        timeout: 10
    },

    async execute() {
        let self = module.exports;
        let proxies = fs.readFileSync('./proxies.txt', 'utf8')
            .split('\n')
            .map(proxy => proxy.trim())
            .filter(proxy => proxy && /^(\d{1,3}\.){3}\d{1,3}:\d{2,5}(:\w+:\w+)?$/.test(proxy));

        console.log(`\n[+] Loaded ${proxies.length} proxies`.info);
        console.log(`[+] Checking proxies...`.info);

        let working = [];
        let workingProxies = 0;
        let failedProxies = 0;

        const parseProxy = (proxy) => {
            const parts = proxy.split(':');
            if (parts.length === 4) {
                return { ip: parts[0], port: parts[1], auth: `${parts[2]}:${parts[3]}` };
            } else {
                return { ip: parts[0], port: parts[1] };
            }
        };

        const checkProxy = async (proxy) => {
            const parsed = parseProxy(proxy);
            const proxyUrl = parsed.auth ? `http://${parsed.auth}@${parsed.ip}:${parsed.port}` : `http://${parsed.ip}:${parsed.port}`;

            try {
                const agent = new HttpsProxyAgent(proxyUrl);
                await axios.get('https://api.ipify.org', {
                    httpsAgent: agent,
                    timeout: self.config.timeout * 1000
                });
                workingProxies++;
                working.push(proxy);
            } catch (error) {
                failedProxies++;
                console.log(`[✘] ${proxy} failed: ${error.code || error.message}`.red);
            }

            console.clear();
            console.log(`[+] Working proxies: ${workingProxies} || Failed proxies: ${failedProxies}`.info);
        };

        let index = 0;
        while (index < proxies.length) {
            const tasks = [];
            for (let i = 0; i < self.config.threads && index < proxies.length; i++) {
                tasks.push(checkProxy(proxies[index++]));
            }
            await Promise.all(tasks);
        }

        if (self.delete_failed_proxies) {
            fs.writeFileSync('./proxies.txt', working.join('\n'));
        }

        prompt('\nPress any key to return to menu');
    }
};