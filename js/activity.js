"use strict";

var data = [];

const recent = document.querySelector(".recent-table");
const cells = document.querySelector(".cells");
const months = { 
                    "01": "January",
                    "02": "February",
                    "03": "March",
                    "04": "April",
                    "05": "May",
                    "06": "June",
                    "07": "July",
                    "08": "August",
                    "09": "September",
                    "10": "October",
                    "11": "November",
                    "12": "December"
                };


var req = fetch("https://www.painful.dev/logs.json", { method: "GET" }).then(
    function(response) { return response.json(); }
).then(
    function(json) {
        data = json;
        fillTable()
    }
);

function fillTable()
{
    var now = new Date();
    var yearStart = new Date(new Date().getFullYear(), 0, 1);
    var yearEnd = new Date(new Date().getFullYear(), 11, 31);

    for (; yearStart <= now; yearStart.setDate(yearStart.getDate() + 1))
    {
        const isoDate = yearStart.toISOString().substring(0, 10);
        var level = data[isoDate] ? data[isoDate].length : 0;
        level = level > 3 ? 3 : level;
        
        const tag = `<li data-level="${ level }"
                        title="${ isoDate }"
                        onclick="activity_click(this)">
                    </li>`

        cells.insertAdjacentHTML("beforeend", tag);
    }

    const keys = Object.keys(data);

    for (var i = 0; i < 3;)
    {
        for (var ii = 0; (ii + i) < 3 && ii < data[keys[i]].length; ii++)
        {
            const tags = `<tr class="recent-row">
                            <td>
                                <a class="recent-link" href="${ data[keys[i]][ii]["link"] }">
                                    <image src="${ data[keys[i]][ii]["img"] }
                                        width="36" height="59">
                                </a>
                            </td>
                            <td><i>
                                <a class="recent-link" href="${ data[keys[i]][ii]["link"] }">
                                    ${ data[keys[i]][ii]["title"] }
                                </a>
                            </i></td>
                            <td>
                                ${ months[keys[i].substr(5, 2)] } ${ keys[i].substr(8, 2) }
                            </td>
                          </tr>`

            recent.insertAdjacentHTML("beforeend", tags)
        }

        i += data[keys[i]].length;
    }
}

function activity_click(e)
{
    recent.innerHTML = "";  // Clear table.

    // Set highlighting.
    for (var cell of cells.childNodes)
    {
        cell.id = "cell-inactive";
    }

    e.id = "cell-active";

    // Find media consumed on specified date and insert it.
    var message = document.getElementById("activity-none");

    if (data[e.title])
    {
        message.style.display = "inline-block";
        message.innerText = `${ months[e.title.substr(5, 2)] } ${ e.title.substr(8, 2) }`;

        for (var i = 0; i < data[e.title].length && i < 3; i++)
        {
            const tags = `<tr class="recent-row">
                    <td class="recent-td">
                        <a class="recent-link" href="${ data[e.title][i]["link"] }">
                            <image src="${ data[e.title][i]["img"] }
                                width="36" height="59">
                        </a>
                    </td>
                    <td class="recent-td"><i>
                        <a class="recent-link" href="${ data[e.title][i]["link"] }">
                            ${ data[e.title][i]["title"] }
                        </a>
                    </i></td>
                  </tr>`
            recent.insertAdjacentHTML("beforeend", tags);
        }
    }
    else
    {
        message.style.display = "inline-block";
        message.innerText = `${ months[e.title.substr(5, 2)] } ${ e.title.substr(8, 2) }
                            No activity here.`;
    }
}
