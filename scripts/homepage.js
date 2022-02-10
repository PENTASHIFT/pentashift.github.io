const sleep = m => new Promise(r => setTimeout(r, m));

const description = [
    "an aspiring Data Scientist.",
    "a huge nerd.",
    "not too shabby at web development.",
    "looking for work!",
    "an open source contributor.",
    "a chatbot developer.",
    "a vim user.",
    "a pixel artist.",
    "a C programmer.",
    "a game developer.",
    "a writer.",
    "a college student.",
    "pretty good with Python.",
    "a perl enthusiast", 
];

async function typing() {
    let desc = document.getElementById("description");
    let cursor = document.getElementById("cursor");
    while (true) {
        let i;
        let pseudorn = Math.floor(Math.random() * description.length);
        for (i = 0; i <= description[pseudorn].length; i++) {
            await sleep(75);
            desc.textContent = description[pseudorn].slice(0, i);
        }

        cursor.style.color = "#a30000";
        await sleep(4000);
        cursor.style.color = "#eeeeee";

        for (i = description[pseudorn].length; i > 0; i--) {
            await sleep(50);
            desc.textContent = description[pseudorn].slice(0, i);
        }
    }
}

typing();
