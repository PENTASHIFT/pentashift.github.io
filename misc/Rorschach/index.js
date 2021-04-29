"use strict";

class SparseMat {
    constructor() {
       this.mat = { };
    }

    add(coord) {
        let point = this.access([coord]);
        if (point) {
            if (point < 5) {
                this.mat[coord] = point + 1;
            }
        } else {
            this.mat[coord] = 1;
        }
    }

    access(coord) {
        let point = this.mat[coord];
        if (point) {
            return point;
        }
        return 1;
    }
}

var canv = document.getElementById("canv");
canv.height = document.width;
canv.width = document.height;
var ctx = canv.getContext("2d");
ctx.fillStyle = "#000";
ctx.fillRect(0, 0, canv.width, canv.height);

const origin = [canv.width / 2, canv.height / 2]
const layers = [
                "rgb(25, 0, 0)",
                "rgb(75, 0, 0)",
                "rgb(125, 0, 0)",
                "rgb(175, 0, 0)",
                "rgb(200, 0, 0)"
               ]

ctx.fillStyle = "rgb(100, 0, 0)";
ctx.fillRect(origin[0], origin[1], 2, 2);
var points = new SparseMat();
points.add([origin[0], origin[1]]);

var x = origin[0];
var y = origin[1];
var accum = [0, 0]

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function generate() {
    var max = 5;
    var min = 1;
    for (var i = 0; i < 100000; i++) {
        let rand = Math.trunc(Math.random() * (max - min) + min);
        switch(rand) {
            case 1:
                accum[0] = accum[0] + 1;
                break;
            case 2:
                if (accum[0] == 0) {
                    break;
                }
                accum[0] = accum[0] - 1;
                break;
            case 3:
                accum[1] = accum[1] + 1;
                break;
            case 4:
                accum[1] = accum[1] - 1;
                break;
            default:
                break;
        }
        points.add([(origin[0] + accum[0]), (origin[1] + accum[1])]);
        let color = points.access([(origin[0] + accum[0]), (origin[1] + accum[1])]);
        ctx.fillStyle = layers[color - 1];
        ctx.fillRect((origin[0] + accum[0]), (origin[1] + accum[1]), 2, 2);
        ctx.fillRect((origin[0] - accum[0]), (origin[1] + accum[1]), 2, 2);
        await sleep(5);
    }
}

while (true) {
    generate();
}
