const prompt = require('prompt-sync')();
const process = require('process');
const colors = require('colors');

process.on('warning', () => {});

const tools = require('./tools');

for (let i = 0; i < tools.length; i++) {
    if (!tools[i].number || tools[i].number === 'undefined') {
        // Remove cuz we dont need ts pmo 🥀💔
        tools.splice(i, 1);
    }
}

process.removeAllListeners('warning')

const sleep = (ms) => {
    return new Promise(resolve => setTimeout(resolve, ms));
}

const promptUser = async () => {
    const choice = prompt('Enter your choice: '.info);
    switch (parseInt(choice)) {
        case 1:
            let file = require(`./tools/${tools[0].file}`);
            await file.execute();
            await main();
        case 2:
            let file2 = require(`./tools/${tools[1].file}`);
            await file2.execute();
            await main();
        case 3:
            let file3 = require(`./tools/${tools[2].file}`);
            await file3.execute();
            await main();
        case 4:
            let file4 = require(`./tools/${tools[3].file}`);
            await file4.execute();
            await main();
        case 99:
            process.exit(0);
            break;
        default:
            console.clear();
            main();
            console.log('Invalid choice'.error);
            sleep(3000).then(() => {
                console.clear();
                main();
            });
            break;
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

    for (let i = 0; i < tools.length; i++) {
        if (!tools[i].number || tools[i].number === 'undefined') {
            tools[i].number = i + 1;
        } else {
            console.log(`${tools[i].number}   ~   ${tools[i].name} || ${tools[i].description}`.info);
        }
    }

    console.log('99  ~   Exit || Exit the program'.info);

    console.log('\n');

    promptUser();

    process.on('SIGINT', () => {
        console.log('Program forcefully closed.'.error);
        process.exit(0);
    });
};

main();