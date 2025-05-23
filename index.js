const prompt = require('prompt-sync')();
const process = require('process');
const colors = require('colors');
const fs = require('fs');
const inquirer = require('inquirer');
const version = require('./version.js');

process.on('warning', () => {});

const tools = require('./tools');
let config = JSON.parse(fs.readFileSync('./config.json'));
const color = (config.index && config.index.printColor) || 'blue';

for (let i = 0; i < tools.length; i++) {
    if (!tools[i].name || !tools[i].description) {
        tools.splice(i, 1);
    }
}

process.removeAllListeners('warning');

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function editConfig(configObj) {
    const keys = Object.keys(configObj);
    for (const key of keys) {
        const value = configObj[key];
        if (typeof value === 'object' && !Array.isArray(value)) {
            console.log(`\nEditing section: ${key}`.yellow);
            await editConfig(configObj[key]);
        } else {
            const response = await inquirer.prompt([{
                type: 'input',
                name: 'newValue',
                message: `Edit "${key}" [current: ${value}]`,
                default: value
            }]);
            configObj[key] = response.newValue;
        }
    }
    fs.writeFileSync('./config.json', JSON.stringify(config, null, 4));
    console.log('\nConfig updated successfully.'.green);
}

const promptUser = async () => {
    const choice = prompt('Enter your choice: '[color]);
    const tool = tools.find(t => t.number === parseInt(choice));
    if (tool) {
        let file = require(`./tools/${tool.file}`);
        await file.execute();
        await main();
    } else if (choice === '0') {
        process.exit(0);
    } else if (choice.toLowerCase() === 'c') {
        console.clear();
        await editConfig(config);
        console.log('\nPress any key to return to the menu...'.info);
        prompt();
        console.clear();
        main();
    } else {
        console.clear();
        main();
        console.log('Invalid choice'['red']);
        sleep(3000).then(() => {
            console.clear();
            main();
        });
    }
};

const main = () => {
    colors.setTheme({
        info: color,
        error: 'red',
        warn: 'yellow'
    });

    let startmsg = `Version ${version} | discord.gg/T83PmmeepV | Made by @Its3rr0rsWRLD`.info;

    console.log(`\n
 /$$$$$$$$ /$$$$$$   /$$$$$$  /$$   /$$ /$$$$$$$$ /$$$$$$   /$$$$$$  /$$        /$$$$$$ 
|__  $$__//$$__  $$ /$$__  $$| $$  | $$|__  $$__//$$__  $$ /$$__  $$| $$       /$$__  $$
   | $$  |__/  \\ $$| $$  \\__/| $$  | $$   | $$  | $$  \\ $$| $$  \\ $$| $$      | $$  \\__/
   | $$     /$$$$$/| $$      | $$$$$$$$   | $$  | $$  | $$| $$  | $$| $$      |  $$$$$$ 
   | $$    |___  $$| $$      | $$__  $$   | $$  | $$  | $$| $$  | $$| $$       \\____  $$
   | $$   /$$  \\ $$| $$    $$| $$  | $$   | $$  | $$  | $$| $$  | $$| $$       /$$  \\ $$
   | $$  |  $$$$$$/|  $$$$$$/| $$  | $$   | $$  |  $$$$$$/|  $$$$$$/| $$$$$$$$|  $$$$$$/
   |__/   \\______/  \\______/ |__/  |__/   |__/   \\______/  \\______/ |________/ \\______/ 

                ${startmsg}\n`.info);

    const maxNameLength = Math.max(...tools.map(tool => tool.name.length)) + 5;
    const maxDescLength = Math.max(...tools.map(tool => tool.description.length)) + 5;
    const totalWidth = maxNameLength + maxDescLength + 12;

    console.log('─'.repeat(totalWidth).info);
    tools.forEach((tool, i) => {
        tool.number = i + 1;
        const name = tool.name.padEnd(maxNameLength, ' ');
        const desc = tool.description.padEnd(maxDescLength, ' ');
        console.log(`| ${String(tool.number).padEnd(2)} ~ ${name}|| ${desc} |`.info);
    });
    console.log(`| 0 ~ ${'Exit'.padEnd(maxNameLength)} || Exit the program${' '.repeat(maxDescLength - 'Exit the program'.length)} |`.info);
    console.log('─'.repeat(totalWidth).info);
    console.log(`| C ~ ${'Config'.padEnd(maxNameLength)} || Edit the config file${' '.repeat(maxDescLength - 'Edit the config file'.length)} |`.info);
    console.log('─'.repeat(totalWidth).info);

    console.log('\n');
    promptUser();

    process.on('SIGINT', () => {
        console.log('Program closed forcefully, goodbye!'.error);
        process.exit(0);
    });
};

main();