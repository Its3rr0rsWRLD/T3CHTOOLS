const fs = require('fs');

process.on('warning', () => {});


function sortFiles() {
    let files = fs.readdirSync('tools').filter(file => file.endsWith('.js'));

    // Returns the files, names, and description from the tools module export
    return files
        .map(file => {
            let tool = require(`./${file}`);
            return {
                name: tool.name,
                description: tool.description,
                number: tool.number,
                file: file
            };
        })
        .sort((a, b) => a.number - b.number);
}

function cookies() {
    if (fs.existsSync('cookies.json')) {
        return JSON.parse(fs.readFileSync('cookies.json', 'utf8'));
    } else {
        return [];
    }
}

module.exports = sortFiles();