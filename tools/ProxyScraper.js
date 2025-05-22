const axios = require('axios');
const fs = require('fs');

const prompt = require('prompt-sync')();

module.exports = {
    name: 'Proxy Scraper',
    description: 'Scrape proxies on websites',
    number: 2,

    async execute() {
        const urls = [
            'http://rootjazz.com/proxies/proxies.txt',
            'http://rootjazz.com/proxies/proxies.txt',
            'http://spys.me/proxy.txt',
            'http://proxysearcher.sourceforge.net/Proxy%20List.php?type=http',
            'https://www.freeproxychecker.com/result/http_proxies.txt',
            'https://raw.githubusercontent.com/TheSpeedX/SOCKS-List/master/http.txt',
            'https://raw.githubusercontent.com/TheSpeedX/PROXY-List/master/http.txt',
            'http://proxysearcher.sourceforge.net/Proxy/List.php?type=socks',
            'https://www.my-proxy.com/free-proxy-list-4.html',
            'https://www.my-proxy.com/free-transparent-proxy.html',
            'https://www.my-proxy.com/free-proxy-list-3.html',
            'https://www.my-proxy.com/free-proxy-list-2.html',
            'https://raw.githubusercontent.com/UserR3X/proxy-list/main/online/http.txt',
            'https://www.my-proxy.com/free-proxy-list-9.html',
            'https://raw.githubusercontent.com/shiftytr/proxy-list/master/proxy.txt',
            'https://www.my-proxy.com/free-socks-4-proxy.html',
            'https://www.my-proxy.com/free-proxy-list-5.html',
            'https://www.my-proxy.com/free-anonymous-proxy.html',
            'https://www.freeproxychecker.com/result/socks4_proxies.txt',
            'https://raw.githubusercontent.com/ShiftyTR/Proxy-List/master/http.txt',
            'https://www.proxy-list.download/api/v1/get?type=http',
            'https://www.my-proxy.com/free-proxy-list-8.html',
            'https://www.freeproxychecker.com/result/socks4_proxies.txt',
            'https://raw.githubusercontent.com/opsxcq/proxy-list/master/list.txt',
            'https://www.my-proxy.com/free-proxy-list.html',
            'https://www.my-proxy.com/free-proxy-list-7.html',
            'https://www.my-proxy.com/free-proxy-list-6.html',
            'https://raw.githubusercontent.com/clarketm/proxy-list/master/proxy-list-raw.txt',
            'https://www.my-proxy.com/free-proxy-list-10.html',
            'https://www.proxy-list.download/api/v1/get?type=socks4',
            'https://raw.githubusercontent.com/clarketm/proxy',
            'https://raw.githubusercontent.com/jetkai/proxy-list/main/online-proxies/txt/proxies-socks4.txt',
            'https://raw.githubusercontent.com/clarketm/proxy-list/master/proxy-list-raw.txt',
            'https://www.freeproxychecker.com/result/socks5_proxies.txt',
            'https://www.proxy-list.download/api/v1/get?type=socks5',
            'https://raw.githubusercontent.com/jetkai/proxy-list/main/online-proxies/txt/proxies-http.txt',
            'https://raw.githubusercontent.com/roosterkid/openproxylist/main/SOCKS4_RAW.txt',
            'https://www.my-proxy.com/free-socks-4-proxy.html',
            'https://raw.githubusercontent.com/jetkai/proxy-list/main/online-proxies/txt/proxies-socks5.txt',
            'https://raw.githubusercontent.com/TheSpeedX/SOCKS-List/master/socks4.txt',
            'https://raw.githubusercontent.com/sunny9577/proxy-scraper/master/proxies.txt',
            'https://raw.githubusercontent.com/ShiftyTR/Proxy-List/master/socks4.txt',
            'https://www.my-proxy.com/free-socks-5-proxy.html',
            'https://raw.githubusercontent.com/ShiftyTR/Proxy-List/master/socks5.txt',
            'https://api.proxyscrape.com/?request=displayproxies&proxytype=http',
            'https://raw.githubusercontent.com/TheSpeedX/PROXY-List/master/socks4.txt',
            'http://www.socks24.org/feeds/posts/default',
            'https://proxy-spider.com/api/proxies.example.txt',
            'http://www.socks24.org/feeds/posts/default',
            'https://proxy50-50.blogspot.com/',
            'https://api.proxyscrape.com/?request=displayproxies&proxytype=socks4',
            'https://api.proxyscrape.com/v2/?request=displayproxies&protocol=socks4',
            'https://github.com/roosterkid/openproxylist/blob/main/SOCKS5_RAW.txt',
            'https://multiproxy.org/txt_all/proxy.txt',
            'http://k2ysarchive.xyz/proxy/http.txt',
            'http://k2ysarchive.xyz/proxy/socks4.txt',
            'https://raw.githubusercontent.com/TheSpeedX/SOCKS-List/master/socks5.txt',
            'http://worm.rip/socks5.txt',
            'http://worm.rip/socks4.txt',
            'https://raw.githubusercontent.com/hookzof/socks5_list/master/proxy.txt',
            'https://raw.githubusercontent.com/TheSpeedX/PROXY-List/master/socks5.txt',
            'http://k2ysarchive.xyz/proxy/socks5.txt',
            'https://api.proxyscrape.com/?request=displayproxies&proxytype=socks5',
            'http://www.proxyserverlist24.top/feeds/posts/default',
            'https://api.proxyscrape.com/v2/?request=displayproxies&protocol=socks5',
            'https://api.proxyscrape.com/v2/?request=displayproxies&protocol=socks5',
            'http://alexa.lr2b.com/proxylist.txt',
            'https://api.openproxylist.xyz/socks5.txt',
            'https://api.openproxylist.xyz/http.txt',
            'https://api.openproxylist.xyz/socks4.txt',
            'https://proxyspace.pro/https.txt',
            'https://proxyspace.pro/http.txt'
        ];

        let proxies = [];

        for (let url of urls) {
            try {
                const response = await axios.get(url);
                const data = response.data;
                const lines = data.split('\n');

                for (let line of lines) {
                    // if its ONLY IP:PORT, nothing else plz 🙏
                    if (/^(\d{1,3}\.){3}\d{1,3}:\d{2,5}$/.test(line)) {
                        proxies.push(line);
                    }
                }
                console.log(url.info);
            } catch (error) {
                console.log(`Failed to scrape proxies from ${url}`.error);
            }
        }

        proxies = [...new Set(proxies)];

        fs.writeFileSync('./proxies.txt', proxies.join('\n'));
        console.log(`\nScraped and saved ${proxies.length} proxies`.green);

        prompt('\nPress any key to return to menu');

        return;
    }
};