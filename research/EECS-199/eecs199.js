"use strict";

var leftContainer = document.getElementById("left");
var userText = document.getElementById("user-input");
var userInput = document.getElementById("user-submit");
var chatHistory = document.getElementById("chat-history");

var rightContainer = document.getElementById("right");
var apiHistory = document.getElementById("api-history");

var apikey = "";

var data = {
    "model": "gpt-3.5-turbo",
    "messages": [{"role": "user", "content": ""}]
};

window.onload = (event) =>
{
    promptAPIKey();
    userText.focus();
};

function appendToContainer(txt, color, historyDom)
{
    let node = document.createElement("p");
    node.style.color = color;
    node.textContent = txt;
    historyDom.appendChild(node);

    leftContainer.scrollTop = leftContainer.scrollHeight;
    rightContainer.scrollTop = rightContainer.scrollHeight;
}

function reqListener()
{
    console.log(this.responseText);

    let rText = JSON.parse(this.responseText);
    
    if (rText.error)
    {
        appendToContainer("Incorrect API key!", "#FF7F7F", chatHistory);
        appendToContainer(this.responseText, "#FF7F7F", apiHistory);

        apikey = "";
        promptAPIKey();
    }
    else
    {
        appendToContainer(rText.choices[0].message.content, "#90EE90", chatHistory);
        appendToContainer(this.responseText, "#90EE90", apiHistory);
    }
}

function promptAPIKey()
{
    appendToContainer("Please enter your GPT API key now.", "#90EE90",
    chatHistory);
}

function getAPIKey()
{
    apikey = userText.value;

    appendToContainer("Thank you!", "#90EE90", chatHistory);
    userText.value = "";
}

function handleInput()
{
    appendToContainer(userText.value, "white", chatHistory);
    data.messages[0].content = userText.value;

    appendToContainer(JSON.stringify(data), "white", apiHistory);
    userText.value = "";

    // Send to ChatGPT here.
    var req = new XMLHttpRequest();
    req.open("POST", "https://api.openai.com/v1/chat/completions", true);
    req.addEventListener("load", reqListener);
    req.setRequestHeader("Content-Type", "application/json");
    req.setRequestHeader("Authorization", "Bearer " + apikey);
    req.send(JSON.stringify(data));
}

userInput.addEventListener("submit", (event) => {
    event.preventDefault();
    if ("" == apikey)
    {
        // Prompt user for API key.
        getAPIKey();
    }
    else
    {
        // Process user's input.
        handleInput();
    }
});
