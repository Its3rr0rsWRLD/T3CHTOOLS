const readline = require('readline');
const process = require('process');
const colors = require('colors');

process.on('warning', () => {});

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

const tools = require('./tools');

for (let i = 0; i < tools.length; i++) {
    if (!tools[i].number || tools[i].number === 'undefined') {
        // remove the whole line
        tools.splice(i, 1);
    }
}


process.removeAllListeners('warning')

const promptUser = () => {
    rl.question('Enter your choice: '.info, (choice) => {
        switch (parseInt(choice)) {
            case 1:
                let file = require(`./tools/${tools[0].file}`);
                file.execute();
                main();
                break;
            case 2:
                let file2 = require(`./tools/${tools[1].file}`);
                file2.execute();
                main();
                break;
            case 3:
                let file3 = require(`./tools/${tools[2].file}`);
                file3.execute();
                main();
                break;
            default:
                promptUser();
                main();
        }
    });
};

const main = () => {
    colors.setTheme({
        info: 'blue',
        error: 'red',
        warn: 'yellow'
    });

    let startmsg = 'Version 1.0.0 | discord.gg/5kHkA6gDp5 | Made by @Its3rr0rsWRLD'.info;

    console.log("\n\n        ,----,                                             ,----,                             ,--,              \n      ,/   .`| .--,-``-.                       ,--,      ,/   .`|  ,----..       ,----..   ,---.'|              \n    ,`   .'  :/   /     '.    ,----..        ,--.'|    ,`   .'  : /   /   \\     /   /   \\  |   | :   .--.--.    \n  ;    ;     / ../        ;  /   /   \\    ,--,  | :  ;    ;     //   .     :   /   .     : :   : |  /  /    '.  \n.'___,/    ,'\\ ``\\  .`-    '|   :     :,---.'|  : '.'___,/    ,'.   /   ;.  \\ .   /   ;.  \\|   ' : |  :  /`. /  \n|    :     |  \\___\\/   \\   :.   |  ;. /|   | : _' ||    :     |.   ;   /  ` ;.   ;   /  ` ;;   ; ' ;  |  |--`   \n;    |.';  ;       \\   :   |.   ; /--` :   : |.'  |;    |.';  ;;   |  ; \\ ; |;   |  ; \\ ; |'   | |_|  :  ;_     \n`----'  |  |       /  /   / ;   | ;    |   ' '  ; :`----'  |  ||   :  | ; | '|   :  | ; | '|   | :.'\\  \\    `.  \n    '   :  ;       \\  \\   \\ |   : |    '   |  .'. |    '   :  ;.   |  ' ' ' :.   |  ' ' ' :'   :    ;`----.   \\ \n    |   |  '   ___ /   :   |.   | '___ |   | :  | '    |   |  ''   ;  \\; /  |'   ;  \\; /  ||   |  ./ __ \\  \\  | \n    '   :  |  /   /\\   /   :'   ; : .'|'   : |  : ;    '   :  | \\   \\  ',  /  \\   \\  ',  / ;   : ;  /  /`--'  / \n    ;   |.'  / ,,/  ',-    .'   | '/  :|   | '  ,/     ;   |.'   ;   :    /    ;   :    /  |   ,/  '--'.     /  \n    '---'    \\ ''\\        ; |   :    / ;   : ;--'      '---'      \\   \\ .'      \\   \\ .'   '---'     `--'---'   \n              \\   \\     .'   \\   \\ .'  |   ,/                      `---`         `---`                          \n                                                                                                                  \n               " + startmsg + "\n".blue);

    for (let i = 0; i < tools.length; i++) {
        if (!tools[i].number || tools[i].number === 'undefined') {
            tools[i].number = i + 1;
        } else {
            console.log(`${tools[i].number}   ~   ${tools[i].name} || ${tools[i].description}`.info);
        }
    }

    console.log('\n');

    promptUser();
};

main();