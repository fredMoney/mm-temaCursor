const game_canvas = document.getElementById("game_canvas");
const ctx = game_canvas.getContext("2d", {willReadFrequently: true});
const W = game_canvas.clientWidth;
const H = game_canvas.clientHeight;
const initial_red_value = 64;

class Reticle {
    drawReticle(ctx, xm, ym) {
        const R = 8;
        const f = R * 2;
        const thickness = f / 4;
        const image_data = ctx.getImageData(0, 0, W, H);
        const pixels = image_data.data;
        var index;

        for (let y = 0 ; y < H ; y++) {
            for (let x = 0 ; x < W ; x++) {
                index = (y * W + x) * 4;
                if(Math.sqrt(Math.pow(x-xm, 2) + Math.pow(y-ym, 2)) <= R) {
                    pixels[index+1] -= red_value;
                    pixels[index+2] -= red_value;
                }
                if(Math.sqrt(Math.pow(x-xm, 2) + Math.pow(y-ym, 2)) <= R + f + thickness &&
                    Math.sqrt(Math.pow(x-xm, 2) + Math.pow(y-ym, 2)) >= R + f) {
                    pixels[index+1] -= red_value;
                    pixels[index+2] -= red_value;
                }
            }
        }

        ctx.putImageData(image_data, 0, 0);

        // ctx.fillStyle = "#f00";
        // ctx.strokeStyle = "#f00";
        // ctx.lineWidth = 2;

        // ctx.beginPath();
        // ctx.arc(x, y, R, 0, Math.PI*2);
        // ctx.fill();
        // ctx.closePath();

        // ctx.beginPath();
        // ctx.arc(x, y, R+10, 0, Math.PI*2);
        // ctx.stroke();
        // ctx.closePath();
    }
}

class Target {
    constructor() {
        this.x = 0;
        this.y = 0;
        this.size = 0;
    }

    drawTarget(ctx) {
        ctx.fillStyle = "#0f0";
        ctx.strokeStyle = "#000";
        ctx.fillRect(this.x - this.size/2, this.y - this.size/2, this.size, this.size);
        ctx.strokeRect(this.x - this.size/2, this.y - this.size/2, this.size, this.size);
        if(this.size < 64) {
            this.size += 1;
        }
    }

    spawnTarget(ctx) {
        if(this.x === 0 && this.y === 0) {
            this.x = 100 + Math.random()*600;
            this.y = 80 + Math.random()*440;
            console.log("Target spawned");
        }
        this.drawTarget(ctx);
    }

    isSelected(x, y) {
        if(x >= this.x - this.size/2 && x <= this.x - this.size/2 + this.size &&
            y >= this.y - this.size/2 && y <= this.y - this.size/2 + this.size) {
            return true;
        } else return false;
    }
}

var score = 0;
var xm = 0;
var ym = 0;
var mouse_click_state = false;
var right_click_state = false;
var red_value = initial_red_value;
var index_path = 0;
var index_redare = 0;

const reticle = new Reticle();
const targets = [];
const cursor_path = [];

function functMouseMove(e) {
    const obj = game_canvas.getBoundingClientRect();
    xm = e.clientX - obj.x;
    ym = e.clientY - obj.y;
}

function functMouseDown(e) {
    if (e.buttons == 1) {
        mouse_click_state = true;
    }
    if(e.buttons == 2) {
        right_click_state = true;
    }
    red_value = 255;
    console.log("Mouse clicked");
}

function functMouseUp(e) {
    mouse_click_state = false;
    right_click_state = false;
    red_value = initial_red_value;
}

function init() {
    game_canvas.addEventListener("mousemove", functMouseMove);
    game_canvas.addEventListener("mousedown", functMouseDown);
    game_canvas.addEventListener("mouseup", functMouseUp);
    window.oncontextmenu = function() {return false;} // dezactiveaza meniul contextual
    window.requestAnimationFrame(draw);
}

function draw() {

    if(right_click_state) {
        if(index_redare === 0) {
            ctx.clearRect(0, 0, W, H);
        }
        ctx.fillStyle = "#f00";
        if(index_redare < index_path) {
            ctx.beginPath();
            ctx.arc(cursor_path[index_redare].x, cursor_path[index_redare++].y, 1, 0, 2*Math.PI);
            ctx.fill();
            ctx.closePath();
        }
    } else {
        index_redare = 0;
        ctx.fillStyle = '#fff';
        ctx.fillRect(0, 0, W, H);

        cursor_path.push({x: xm, y: ym});
        // console.log(cursor_path[index_path]);
        index_path++;

        var target_index = -1; // -1 -> nu s-a gasit tinta

        // popularea array-ului de tinte
        if(targets.length < 5) {
            targets.push(new Target())
        }

        // desenarea tintelor din array
        targets.forEach(target => {
            target.spawnTarget(ctx);
        });
        
        // desen reticul
        reticle.drawReticle(ctx, xm, ym);

        // check daca se apasa pe tinta
        targets.forEach(target => {
            if(target.isSelected(xm, ym) && mouse_click_state === true) {
                score++;
                target_index = targets.indexOf(target);
            }
        });
        if(target_index != -1) {
            targets.splice(target_index, 1);
            console.log("Target destroyed");
        }
        
        // display scor
        ctx.fillStyle = "#000";
        ctx.font = "24px arial";
        ctx.fillText(`scor: ${score}`, 10, 20);
    }

    window.requestAnimationFrame(draw);
}

window.onload = init;