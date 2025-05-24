const fs = require('fs');
const path = require('path');
const prompt = require('prompt-sync')();
const globalConfig = require('../config.json');
const axios = require('axios');
const { randomUUID } = require('crypto');
const colors = require('colors');

module.exports = {
    name: 'Proxy Generator',
    description: 'Generates and downloads proxies via Webshare.io using captcha bypass and threading',

    config: {
        proxyless: true,
        captcha_apikey: '',
        captcha_service: 'capsolver',
        proxy_file: 'proxies.txt',
        threads: 5,
        proxy_format: 'ip:port:user:pass'
    },

    async execute() {
        const config = globalConfig['Proxy Generator'] || module.exports.config;

        if (!config.captcha_apikey || config.captcha_apikey.trim() === '') {
            console.log('[!] Missing CapSolver API key. Please add it to your config.json under "Proxy Generator".'.red);
            prompt('\nPress any key to return to menu...');
            return;
        }

        const proxies = (config.proxyless || !config.proxy_file)
            ? []
            : (fs.existsSync(config.proxy_file) ? fs.readFileSync(config.proxy_file, 'utf8').split('\n').filter(Boolean) : []);

        const WEBSITE_KEY = "6LeHZ6UUAAAAAKat_YS--O2tj_by3gv3r_l03j9d";
        const BASE_URL = "https://proxy.webshare.io/api/v2";
        const USER_AGENT = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/113.0.0.0 Safari/537.36";

        const generateEmail = () => {
            const roots = ["pixel", "alpha", "drift", "neo", "astro", "zenith", "echo", "nova", "crypt", "orbit"];
            const suffixes = ["tv", "hub", "io", "xd", "on", "lab", "it", "max", "sys", "hq"];
            const base = roots[Math.floor(Math.random() * roots.length)];
            const suffix = suffixes[Math.floor(Math.random() * suffixes.length)];
            const number = Math.random() < 0.4 ? Math.floor(Math.random() * 1000) : '';
            return `${base}${suffix}${number}@gmail.com`;
        };

        const generatePassword = () => {
            const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
            return Array.from({ length: 12 }, () => chars.charAt(Math.floor(Math.random() * chars.length))).join('');
        };

        const solveCaptcha = async () => {
            try {
                const createTaskRes = await axios.post('https://api.capsolver.com/createTask', {
                    clientKey: config.captcha_apikey,
                    task: {
                        type: "ReCaptchaV2TaskProxyless",
                        websiteURL: "https://webshare.io",
                        websiteKey: WEBSITE_KEY,
                        userAgent: USER_AGENT
                    }
                });

                const taskId = createTaskRes.data.taskId;
                if (!taskId) throw new Error('CapSolver: Task creation failed');

                while (true) {
                    await new Promise(res => setTimeout(res, 3000));
                    const result = await axios.post('https://api.capsolver.com/getTaskResult', {
                        clientKey: config.captcha_apikey,
                        taskId
                    });

                    if (result.data.status === 'ready') {
                        return result.data.solution.gRecaptchaResponse;
                    } else if (result.data.status === 'failed') {
                        throw new Error('CapSolver: Captcha solving failed');
                    }
                }
            } catch (err) {
                throw new Error('[CapSolver] '.red + err.message);
            }
        };

        const registerAccount = async (captchaToken) => {
            const email = generateEmail();
            const password = generatePassword();

            const payload = {
                email,
                password,
                tos_accepted: true,
                recaptcha: captchaToken
            };

            const response = await axios.post(`${BASE_URL}/register/`, payload, {
                headers: { 'User-Agent': USER_AGENT }
            });

            if (!response.data.token) throw new Error('Registration failed: ' + JSON.stringify(response.data));
            return { token: response.data.token, email, password };
        };

        const downloadProxies = async (token) => {
            const response = await axios.get(`${BASE_URL}/proxy/list/?mode=direct&page=1&page_size=10`, {
                headers: {
                    'Authorization': `Token ${token}`,
                    'User-Agent': USER_AGENT
                }
            });

            const proxies = response.data.results || [];
            const outputPath = path.resolve(__dirname, '../proxies.txt');
            const stream = fs.createWriteStream(outputPath, { flags: 'a' });

            proxies.forEach(p => {
                let proxyString = '';
                if (config.proxy_format === 'ip:port') {
                    proxyString = `${p.proxy_address}:${p.port}`;
                } else if (config.proxy_format.includes('@')) {
                    proxyString = `${p.username}:${p.password}@${p.proxy_address}:${p.port}`;
                } else {
                    proxyString = `${p.proxy_address}:${p.port}:${p.username}:${p.password}`;
                }
                stream.write(proxyString + '\n');
            });

            stream.end();
            return proxies.length;
        };

        console.log('[*] Proxy Generator starting...'.cyan);

        const startWorker = async (id) => {
            while (true) {
                try {
                    const captcha = await solveCaptcha();
                    const { token } = await registerAccount(captcha);
                    const count = await downloadProxies(token);
                    console.log(`[✔] Thread ${id} generated ${count} proxies`.green);
                } catch (e) {
                    if (e.response?.status === 429) {
                        console.log(`[!] Thread ${id} rate limited. Sleeping 10s...`.yellow);
                        await new Promise(res => setTimeout(res, 10000));
                        continue;
                    }
                    console.log(`[✘] Thread ${id} error:`.red, e.message);
                }
            }
        };

        for (let i = 0; i < config.threads; i++) {
            startWorker(i + 1);
        }

        await new Promise(() => {}); // keep alive
    }
};