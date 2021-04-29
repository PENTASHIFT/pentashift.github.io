const sleep = m => new Promise (r => setTimeout(r, m));
/*
const description = [
                        "a data scientist",
                        "a giant nerd",
                        "a perl maven",
                        "a videogame modder",
                        "a hardware hacker",
                        "a golang enthusiast",
                        "a transhumanist",
                        "a technogaian",
                        "a webmaster",
                        "a chatbot developer",
                        "a vim user",
                        "a supporter of open source",
                    ];
*/
const description = [
                        "testing",
                        "Testing",
                        "tEsTiNg",
                        "TESTING",
                    ]
async function typing() {
    let terminal = document.getElementById("location");
    let terminalText = terminal.textContent;
    while (true) {
        let i;
        let pseudorn = Math.floor(Math.random() * description.length);
        for (i = 0; i < description[pseudorn].length; i++){
            await sleep(150);
            terminal.textContent = terminalText + description[pseudorn].slice(0, i);
        }
        for (i = 0; i < 8; i++) {
            if (i % 2) {
                terminal.textContent = terminalText + description[pseudorn] + " ▮";
            } else {
                terminal.textContent = terminalText + description[pseudorn];
            }
            await sleep(200);
        } for (i = description[pseudorn].length; i > 0; i--) {
            await sleep(100);
            terminal.textContent = terminalText + description[pseudorn].slice(0, i);
        }
    }
}

typing();
