const prompt = require('prompt-sync')();
const process = require('process');
const colors = require('colors');

process.on('warning', () => {});

const tools = require('./tools');

for (let i = 0; i < tools.length; i++) {
    if (!tools[i].name || !tools[i].description) {
        tools.splice(i, 1);
    }
}

process.removeAllListeners('warning');

const sleep = (ms) => {
    return new Promise(resolve => setTimeout(resolve, ms));
};

const promptUser = async () => {
    const choice = prompt('Enter your choice: '.info);
    const tool = tools.find(t => t.number === parseInt(choice));
    if (tool) {
        let file = require(`./tools/${tool.file}`);
        await file.execute();
        await main();
    } else if (parseInt(choice) === 0) {
        process.exit(0);
    } else {
        console.clear();
        main();
        console.log('Invalid choice'.error);
        sleep(3000).then(() => {
            console.clear();
            main();
        });
    }
};

const main = () => {
    colors.setTheme({
        info: 'blue',
        error: 'red',
        warn: 'yellow'
    });

    let startmsg = 'Version 1.0.1 | discord.gg/5kHkA6gDp5 | Made by @Its3rr0rsWRLD'.info;

    console.log("\n\n        ,----,                                             ,----,                             ,--,              \n      ,/   .`| .--,-``-.                       ,--,      ,/   .`|  ,----..       ,----..   ,---.'|              \n    ,`   .'  :/   /     '.    ,----..        ,--.'|    ,`   .'  : /   /   \\     /   /   \\  |   | :   .--.--.    \n  ;    ;     / ../        ;  /   /   \\    ,--,  | :  ;    ;     //   .     :   /   .     : :   : |  /  /    '.  \n.'___,/    ,'\\ ``\\  .`-    '|   :     :,---.'|  : '.'___,/    ,'.   /   ;.  \\ .   /   ;.  \\|   ' : |  :  /`. /  \n|    :     |  \\___\\/   \\   :.   |  ;. /|   | : _' ||    :     |.   ;   /  ` ;.   ;   /  ` ;;   ; ' ;  |  |--`   \n;    |.';  ;       \\   :   |.   ; /--` :   : |.'  |;    |.';  ;;   |  ; \\ ; |;   |  ; \\ ; |'   | |_|  :  ;_     \n`----'  |  |       /  /   / ;   | ;    |   ' '  ; :`----'  |  ||   :  | ; | '|   :  | ; | '|   | :.'\\  \\    `.  \n    '   :  ;       \\  \\   \\ |   : |    '   |  .'. |    '   :  ;.   |  ' ' ' :.   |  ' ' ' :'   :    ;`----.   \\ \n    |   |  '   ___ /   :   |.   | '___ |   | :  | '    |   |  ''   ;  \\; /  |'   ;  \\; /  ||   |  ./ __ \\  \\  | \n    '   :  |  /   /\\   /   :'   ; : .'|'   : |  : ;    '   :  | \\   \\  ',  /  \\   \\  ',  / ;   : ;  /  /`--'  / \n    ;   |.'  / ,,/  ',-    .'   | '/  :|   | '  ,/     ;   |.'   ;   :    /    ;   :    /  |   ,/  '--'.     /  \n    '---'    \\ ''\\        ; |   :    / ;   : ;--'      '---'      \\   \\ .'      \\   \\ .'   '---'     `--'---'   \n              \\   \\     .'   \\   \\ .'  |   ,/                      `---`         `---`                          \n                                                                                                                  \n               " + startmsg + "\n".blue);

    tools.forEach((tool, i) => {
        tool.number = i + 1;
        const name = tool.name.padEnd(24, ' ');
        const desc = tool.description;
        console.log(`${String(tool.number).padEnd(4)}~   ${name}|| ${desc}`.info);
    });

    const exitLabel = 'Exit'.padEnd(24, ' ');
    console.log(`0   ~   ${exitLabel}|| Exit the program`.info);

    console.log('\n');
    promptUser();

    process.on('SIGINT', () => {
        console.log('Program closed forcefully, goodbye!'.error);
        process.exit(0);
    });
};

main();