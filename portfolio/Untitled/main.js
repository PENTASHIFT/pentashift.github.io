'use strict';

const elm = React.createElement;

const initialInputId = "?";
const inputStyleError = "border: 1px solid red";
const inputStyleSuccess = "border: 1px solid #252018";

// TODO(josh): This is all kind of hacky and puts requirements on the data to be
//              in a specific format. Try to fix this later.
class Content extends React.Component {
    parse(content) {
        var parsedContent = [];
        for (let i = 0; i < content.length; i++) {
            // Set every other element to be a bdi element that is red to
            //  differentiate it as an accepted term to enter.
            if ((i % 2) != 0) {
                parsedContent.push(elm(
                    "bdi",
                    { 
                        style: { "color": "red" }, 
                        key: i
                    },
                    content[i]
                ));
            } else {
                parsedContent.push(elm(
                    "span",
                    { key: i}, 
                    content[i]
                ));
            }
        }

        return parsedContent;
    }

    render() {
        return elm(
            "p",
            { className: "result" },
            this.parse(this.props.cont)
        );
    }
}

class Input extends React.Component {
    render() {
        return elm(
            "div",
            null,

            elm(
                "div",
                { className: "contentDiv" },

                elm (
                    "p",
                    { className: "cell" },
                    "Out [" + this.props.storyId + "]" + ":"
                ),

                elm(
                    Content,
                    { cont: this.props.content },
                    null,
                )
            ),

            elm(
                "div",
                { className: "inputDiv" },

                elm(
                    "p",    // Cell Number/Story ID.
                    { className: "cell" },
                    "In [" + this.props.storyId + "]" + ":"
                ),

                elm(
                    "input",
                    { 
                        type: "text",
                        onKeyDown: this.props.onKeyDown,
                        id: this.props.id,
                    },
                    null
                )
            )
        );
    }
}

class StoryBoard extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            inputList: [],
            prevInputList: [],
        };

        this.storyData = storyData;     // From story.js
        this.newInput = this.newInput.bind(this);
        this.undo = this.undo.bind(this);
    }

    verifyInput(sId, value) {
        if (!value)
            return false;

        const acceptedInput = this.storyData[sId]["acceptedInput"];

        if (!(value in acceptedInput))
            return false;

        return acceptedInput[value];    // Return story ID for next cell.
    }

    updateState(input, len, cont, sId) {
        this.setState({
            prevInputList: this.state.prevInputList.concat(
                                [this.state.inputList]
                            ),
            inputList: input.concat(
                elm(
                    Input,
                    {
                        id: len,
                        storyId: sId,
                        content: cont,
                        onKeyDown: this.newInput,
                    },
                    null,
                )
            ),
        },
            () => {
                document.getElementById(len).focus();
            }
        );
    }
    
    newInput(event) {
        // Sanity check.
        if (!event) 
            return;
        
        // SHIFT+ENTER check.
        if (!event.shiftKey || !(event.keyCode == 13)) 
            return;

        let input = this.state.inputList;
        let len = input.length;

        let target = event.target || event.srcElement;
        let element = document.getElementById(target.id);

        document.getElementById("undoBtn").style = "color: white";

        // Tutorial input.
        if (target.id == initialInputId) {
            if (len == 0) {
                this.updateState(
                    input, len, this.storyData["0"]["content"], "0"
                );
            }
            return;
        }

        let id = parseInt(target.id, 10);
        let storyId = input[id]["props"].storyId;
        let response = this.verifyInput(storyId, target.value.toLowerCase());
        
        // Error feedback to user.
        if (response) 
            element.style = inputStyleSuccess;
        else {
            element.style = inputStyleError;
            return;
        }

        /*  If SHIFT+ENTER was set off on a prior element,
            then start fresh from said element it was pressed on. */
        if (id < (len - 1)) {
            len = id + 1;
            input = this.state.inputList.slice(0, len);
        }
            
        this.updateState(
            input, len, this.storyData[response]["content"], response
        );
    }

    undo(event) {
        let len = this.state.prevInputList.length;
        
        if ((len - 1) <= 0) 
            document.getElementById(event.target.id).style = "color: gray";

        if (len == 0) 
            return;
        
        this.setState({
            inputList: this.state.prevInputList[len - 1],
            prevInputList: this.state.prevInputList.slice(0, len - 1),
        });
    }
    
    render() {
        return elm(
            "div",
            null,
            elm(
                "button",
                { onClick: this.undo, id: "undoBtn" },
                "⟲"
            ),
            elm(
                Input,
                { 
                    id: initialInputId,
                    storyId: initialInputId,
                    content: this.storyData[initialInputId]["content"],
                    onKeyDown: this.newInput,
                },
                null,
            ),
            this.state.inputList,
        );
    }
}

ReactDOM.render(elm(StoryBoard), document.getElementById("story-body"));
