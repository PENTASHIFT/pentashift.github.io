"use strict";

var show_btn = document.getElementById("exp-show-more");
var is_showing = false;

if (show_btn.attachEvent)   // IE version(s) <9
    show_btn.attachEvent("onclick", show_more);
else
    show_btn.addEventListener("click", show_more, false);

var to_show = document.getElementsByClassName("exp-to-hide");

var hide_class_name = to_show[0].className;
var class_name = hide_class_name.substring(0, hide_class_name.lastIndexOf(" "));

function show_more(e)
{
    if (is_showing)
    {
        show_btn.textContent = "Show More";
        is_showing = false;
        
        for (let d of to_show)
            d.className = hide_class_name;
    }
    else
    {
        show_btn.textContent = "Show Less";
        is_showing = true;

        for (let d of to_show)
            d.className = class_name;
    }
}
