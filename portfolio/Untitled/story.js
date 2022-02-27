// A glorified JSON file.

const storyData = {
        "?": {
            // NOTE(josh): Multi-line string does not work in actual JSON.
            "content": [
                `This is a non-linear story in the style of a Jupyter
                Notebook. As such, per every paragraph of story provided, you will
                be provided with an input box to control which direction you'd
                like to pursue within the story. The accepted inputs will be shown in `,
                `red`,
                ` for each individual paragraph, as so. After entering your
                desired input, press shift + enter to submit your decision. Try
                it now to begin!`,
                ` Please note this is currently just a proof of concept with no
                actual story. Story is coming soon.`
            ]
        },

        "0": {
            "content": [ `Foo!` ],
            "acceptedInput": {
                "foo": "1", 
                "bar": "1", 
            }
        },
        
        "1": {
            "content": [ `Bar!` ],
            "acceptedInput": {
                "bar": "2",
                "foo": "2",
            }
        },

        "2": {
            "content": [ `Baz!` ],
            "acceptedInput": {
                "baz": "0",
                "bar": "1",
            }
        }
};
