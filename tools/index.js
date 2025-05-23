const fs = require('fs');
const path = require('path');
const configPath = path.join(__dirname, '../config.json');
let globalConfig = {};

if (fs.existsSync(configPath)) {
    globalConfig = JSON.parse(fs.readFileSync(configPath));
}

process.on('warning', () => {});

function sortFiles() {
    const files = fs.readdirSync('tools').filter(file => file.endsWith('.js'));

    let anyUpdated = false;
    const currentToolNames = new Set();
    let toolIndex = 1;

    const toolList = files.map(file => {
        let tool;
        try {
            tool = require(`./${file}`);
        } catch {
            return null;
        }

        if (!tool.name || !tool.description || typeof tool.execute !== 'function') return null;

        currentToolNames.add(tool.name);

        const defaultConfig = tool.config || {};
        const toolConfig = globalConfig[tool.name] || {};
        let updated = false;

        for (let key in defaultConfig) {
            if (!(key in toolConfig)) {
                toolConfig[key] = defaultConfig[key];
                updated = true;
            }
        }

        if (updated || !globalConfig[tool.name]) {
            anyUpdated = true;
            globalConfig[tool.name] = toolConfig;
        }

        tool.config = toolConfig;

        return {
            name: tool.name,
            description: tool.description,
            number: toolIndex++,
            file: file
        };
    }).filter(Boolean);

    for (let name in globalConfig) {
        if (!currentToolNames.has(name)) {
            delete globalConfig[name];
            anyUpdated = true;
        }
    }

    if (anyUpdated) {
        fs.writeFileSync(configPath, JSON.stringify(globalConfig, null, 4));
    }

    return toolList;
}

function cookies() {
    if (fs.existsSync('cookies.json')) {
        return JSON.parse(fs.readFileSync('cookies.json', 'utf8'));
    } else {
        return [];
    }
}

module.exports = sortFiles();