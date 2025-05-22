const fs = require('fs');
const path = require('path');
const configPath = path.join(__dirname, '../config.json');
let globalConfig = {};

if (fs.existsSync(configPath)) {
    globalConfig = JSON.parse(fs.readFileSync(configPath));
}

process.on('warning', () => {});

function sortFiles() {
    let files = fs.readdirSync('tools').filter(file => file.endsWith('.js'));

    let anyUpdated = false;
    const toolList = files.map(file => {
        let tool = require(`./${file}`);
        const defaultConfig = tool.config || {};
        const toolConfig = globalConfig[tool.name] || {};
        let updated = false;

        for (let key in defaultConfig) {
            if (!(key in toolConfig)) {
                toolConfig[key] = defaultConfig[key];
                updated = true;
            }
        }

        if (updated) {
            anyUpdated = true;
        }

        globalConfig[tool.name] = toolConfig;
        tool.config = toolConfig;

        return {
            name: tool.name,
            description: tool.description,
            number: tool.number,
            file: file
        };
    });

    if (Object.keys(globalConfig).length) {
        fs.writeFileSync(configPath, JSON.stringify(globalConfig, null, 4));
    }

    return toolList.sort((a, b) => a.number - b.number);
}

function cookies() {
    if (fs.existsSync('cookies.json')) {
        return JSON.parse(fs.readFileSync('cookies.json', 'utf8'));
    } else {
        return [];
    }
}

module.exports = sortFiles();