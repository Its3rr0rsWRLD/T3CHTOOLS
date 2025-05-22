const axios = require('axios');
const fs = require('fs');
const gm = require('gm').subClass({ imageMagick: true });

module.exports = {
    name: 'AdsScraper',
    description: 'Scrapes Roblox ads',
    number: 1,

    config: {
        orientation: 'vertical',
        max_runs: 1000,
        threads: 1,
        webhook: '',
        send_at: 25,
        use_proxies: false,
    },

    execute: async () => {
        let self = module.exports;
        let orientation = self.config.orientation;
        let numOrientation = '';

        console.log('\nWarning: If nothing is happening, you are either rate limited OR the JS memory limit has been reached.'.warn);

        if (orientation === 'vertical') {
            numOrientation = '2';
            if (!fs.existsSync('./assets/ads/vertical')) {
                fs.mkdirSync('./assets/ads/vertical', { recursive: true });
            }
        } else if (orientation === 'horizontal') {
            numOrientation = '1';
            if (!fs.existsSync('./assets/ads/horizontal')) {
                fs.mkdirSync('./assets/ads/horizontal', { recursive: true });
            }
        } else {
            throw new Error('Invalid orientation');
        }

        let proxies = [];
        if (self.config.use_proxies) {
            proxies = fs.readFileSync('./proxies.txt', 'utf8').split('\n').map(proxy => proxy.trim()).filter(proxy => proxy); // Read proxies from file
        }

        let queue = [];
        let runningRequests = 0;

        for (let i = 0; i < self.config.max_runs; i++) {
            if (runningRequests >= self.config.threads) {
                await Promise.race(queue);
            }

            runningRequests++;

            let axiosConfig = {};
            if (self.config.use_proxies) {
                axiosConfig.proxy = proxies[i % proxies.length];
            }

            const requestPromise = axios.get(`https://www.roblox.com/user-sponsorship/${numOrientation}`, axiosConfig).then(async (res) => {
                if (res.status !== 200 || !res.data) {
                    console.error('Rate limited');
                    return;
                }
                let data = res.data;
                let recentAds = [];

                let adUrl = data.toString().split('<img src="').pop().split('"')[0]
                let adAlt = data.toString().split('alt="').pop().split('"')[0]

                adAlt = adAlt.replace(/[^a-zA-Z0-9]/g, '_');
                adAlt = adAlt.replace(/\s/g, '_');
                adAlt = adAlt.replace(/\..+$/, '_');

                const response = await axios({
                    url: adUrl,
                    method: 'GET',
                    responseType: 'stream',
                    proxy: proxies[i % proxies.length],
                });

                if (fs.existsSync(`./assets/ads/${orientation}/${adAlt}.png`)) {
                    return;
                }

                // check if the image is a valid image
                gm(response.data).size((err, size) => {
                    if (err) {
                        return;
                    }
                });

                response.data.pipe(fs.createWriteStream(`./assets/ads/${orientation}/${adAlt}.png`));
                recentAds = [...recentAds, `${adAlt}.png`];

                console.clear();

                console.log(`Saved ${i} ads`);

                // Saving webhook shit for later
                // if (i % self.config.send_at === 0) {
                //     await axios.post(self.config.webhook, {
                //         content: 'New ads: ' + i,
                //         files: recentAds.map((ad) => {
                //             return {
                //                 attachment: fs.readFileSync(`./assets/ads/${orientation}/${ad}`),
                //                 name: ad
                //             }
                //         })
                //     }).then(() => {
                //         recentAds = [];
                //         console.log('Sent webhook');
                //     }).catch((err) => {
                //         console.error('Failed to send webhook', err);
                //     });
                // }
            }).catch((err) => {
                if (err.response && err.response.status === 403) {
                    console.error('Rate limited');
                    return;
                } else {
                    console.error('Failed to get ad'.error);
                }
            }).finally(() => {
                runningRequests--;
            });

            queue.push(requestPromise);
        }

        console.log('Waiting for all requests to finish...'.info);

        await Promise.all(queue);

        console.log('Finished!'.info);
    }
}