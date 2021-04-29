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
    let cursor = document.getElementById("cursor");
    while (true) {
        let i;
        let pseudorn = Math.floor(Math.random() * description.length);
        for (i = 0; i < description[pseudorn].length; i++){
            await sleep(150);
            terminal.textContent = terminalText + description[pseudorn].slice(0, i);
        }
        terminal.textContent = terminalText + description[pseudorn] + " ";
        cursor.style.display = "inline-block";
        await sleep(4000);
        cursor.style.display = "none";

        for (i = description[pseudorn].length; i > 0; i--) {
            await sleep(100);
            terminal.textContent = terminalText + description[pseudorn].slice(0, i);
        }
    }
}

typing();
