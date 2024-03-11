const readline = require('readline');
const axios = require('axios');
const fs = require('fs');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

module.exports = {
    name: 'Proxy Checker',
    description: 'Check proxies',
    delete_failed_proxies: true,
    number: 3,

    config: {
        threads: 1500,
        timeout: 10
    },

    async execute() {
        let self = module.exports;
        let proxies = fs.readFileSync('./proxies.txt', 'utf8').split('\n').map(proxy => proxy.trim()).filter(proxy => proxy); // Read proxies from file

        console.log(`\n[+] Loaded ${proxies.length} proxies`.info);
        console.log(`[+] Checking proxies...`.info);

        let workingProxies = 0;
        let failedProxies = 0;

        // Define a function to check a single proxy
        const checkProxy = async (proxy) => {
            try {
                const response = await axios.get('https://www.google.com/', {
                    proxy: {
                        host: proxy.split(':')[0],
                        port: parseInt(proxy.split(':')[1])
                    },
                    timeout: self.config.timeout * 1000
                });
                workingProxies++;
                console.clear();
                console.log(`[+] Working proxies: ${workingProxies} || Failed proxies: ${failedProxies}`.info);
            } catch (error) {
                failedProxies++;
                console.clear();
                console.log(`[+] Working proxies: ${workingProxies} || Failed proxies: ${failedProxies}`.info);
            }
        };

        // Check proxies with dynamic assignment of workers
        let index = 0;
        while (index < proxies.length) {
            const tasks = [];
            for (let i = 0; i < self.config.threads && index < proxies.length; i++) {
                tasks.push(checkProxy(proxies[index++]));
            }
            await Promise.all(tasks);
        }

        if (self.delete_failed_proxies) {
            fs.writeFileSync('./proxies.txt', proxies.join('\n'));
        }

        rl.question('\nPress any key to return to menu'.yellow, () => {
            rl.close();
        });
    }
}