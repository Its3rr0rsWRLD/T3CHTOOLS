const axios = require('axios');
const fs = require('fs');
const prompt = require('prompt-sync')();
const path = require('path');
const globalConfig = require('../config.json');

module.exports = {
    name: 'Proxy Scraper',
    description: 'Scrape proxies on websites',

    config: {
        threads: 10
    },

    async execute() {
        const config = globalConfig['Proxy Scraper'] || module.exports.config;
        const threadCount = config.threads || 10;

        const urls = [
            'https://api.proxyscrape.com/v2/?request=displayproxies&protocol=http&timeout=10000&country=all&ssl=all&anonymity=all',
            'https://vakhov.github.io/fresh-proxy-list/http.txt',
            'https://raw.githubusercontent.com/proxifly/free-proxy-list/main/proxies/http.txt',
            'https://raw.githubusercontent.com/TheSpeedX/PROXY-List/main/http.txt',
            'https://raw.githubusercontent.com/monosans/proxy-list/main/proxies/http.txt'
        ];

        const outputPath = path.resolve(__dirname, '../proxies.txt');
        const output = fs.createWriteStream(outputPath, { flags: 'w' });
        let index = 0;

        async function scrape(url) {
            try {
                const res = await axios.get(url, { timeout: 8000 });
                const lines = res.data.split('\n');
                for (const line of lines) {
                    const trimmed = line.trim();
                    if (/^\d{1,3}(\.\d{1,3}){3}:\d{2,5}$/.test(trimmed)) {
                        output.write(trimmed + '\n');
                    }
                }
                console.log(`[✔] Scraped from: ${url}`.green);
            } catch (err) {
                console.log(`[✘] Failed: ${url}`.red);
            }
        }

        async function runBatch() {
            const promises = [];
            for (let t = 0; t < threadCount; t++) {
                if (index >= urls.length) break;
                const url = urls[index++];
                promises.push(scrape(url));
            }
            await Promise.all(promises);
            if (index < urls.length) {
                await runBatch();
            }
        }

        await runBatch();
        output.end();

        const total = fs.readFileSync(outputPath, 'utf8').split('\n').filter(Boolean).length;
        console.log(`\nScraped and saved ${total} proxies to proxies.txt`.cyan);
        prompt('\nPress any key to return to menu');
    }
}
