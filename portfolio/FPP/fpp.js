"use strict";

// TODO(josh): Proper commenting and hoisting a lot of nonsense into their own functions.

const DIRECTION = {
    IDLE: 0,
    UP: 1,
    DOWN: 2,
};

var Paddle = {
    new: function(side) {
        return {
            width: 4,
            height: 16,
            halfHeight: 8,
            x: side === "left" ? (this.pPosition) : 
                (this.minimap.width - this.pPosition),
            y: this.minimap.height >> 1,
            score: 0,
            move: DIRECTION.IDLE,
            speed: 2,
        };
    }
};

var Ball = {
    new: function(initialSpeed) {
        return {
            width: 4,
            height: 4,
            x: this.minimap.width >> 1,
            y: this.minimap.height >> 1,
            moveX: initialSpeed,
            moveY: 0,
        };
    }
};

var Game = {
    initialize: function() {
        this.canvas = document.getElementById("game");
        this.context = this.canvas.getContext("2d");
        this.canvas.focus();

        // Over-head traditional pong, minimap.
        this.minimap = document.getElementById("minimap");
        this.mmContext = this.minimap.getContext("2d");

        // Handle keypresses.
        this.keyHandler = this.keyHandler.bind(this);
        this.canvas.addEventListener("keydown", this.keyHandler);

        // When the user lets go of key, stop movement.
        this.canvas.addEventListener("keyup", () => {
            game.player.move = DIRECTION.IDLE;
        });

        // Canvas attributes.
        this.canvas.width = 640;
        this.canvas.height = 420;

        // Mini-map attributes.
        this.mmContext.fillStyle = "#ffffff";

        // All game logic will be in reference to these values:
        this.minimap.width = this.minimap.height = 160;

        // Game objects & their attributes.
        this.pPosition = 16;    // Paddle padding from the edge.
        this.player = Paddle.new.call(this, "right");
        this.opponent = Paddle.new.call(this, "left");
        this.ball = Ball.new.call(this, 1);

        // Key-codes
        this.moveUpKeyZero = 68;        // 'd' key
        this.moveUpKeyOne = 39;         // Right Arrow
        this.moveDownKeyZero = 65;      // 'a' key
        this.moveDownKeyOne = 37;       // Left Arrow
        this.menuKey = 27;              // ESC
        this.menuUpKeyZero = 87;        // 'w' key
        this.menuUpKeyOne = 38;         // Up Arrow
        this.menuDownKeyZero = 83;      // 's' key
        this.menuDownKeyOne = 40;       // Down Arrow

        // Game attributes.
        this.running = this.over = false;
        this.playerScore = this.opponentScore = 0;

        // Start-up game.
        this.initialGameState();
        this.running = true;
        this.loop();
    },

    clear: function() {
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.mmContext.clearRect(0, 0, this.minimap.width, this.minimap.height);
    },

    initialGameState: function() {
        // Decide whose serve it is.
        this.ball.moveX = (Math.floor(Math.random() * 2) == 0) ?
            this.ball.moveX : -this.ball.moveX;

        this.ball.moveY = 1;
    },

    keyHandler: function(key) {
        if (this.running) {
            switch(key.keyCode) {
                case this.moveUpKeyZero:
                case this.moveUpKeyOne:
                    game.player.move = DIRECTION.UP;
                    break;
                case this.moveDownKeyZero:
                case this.moveDownKeyOne:
                    game.player.move = DIRECTION.DOWN;
                    break;
                case this.menuKey:
                    // TODO(josh): Open menu here.
                    this.running = false;
                    break;
                default:
                    console.log(key.keyCode);   // NOTE(josh): For debugging.
                    break;
            }
        } else {
            // Menu handling.
            if (key.keyCode == this.menuKey)
                this.running = true;
        }
    },

    movePlayer: function(paddle) {
        if (paddle.move === DIRECTION.UP) {
            if (!(paddle.y >= (this.minimap.height - paddle.halfHeight)))
                paddle.y += paddle.speed;
        } else if (paddle.move === DIRECTION.DOWN) {
            if (!(paddle.y - paddle.halfHeight <= 0))
                paddle.y -= paddle.speed;
        }
    },

    updateState: function() {
        // Update player location.
        this.movePlayer(this.player);
        
        // Opponent "AI".
        if (this.ball.y > this.opponent.y)
            this.opponent.move = DIRECTION.UP;
        else if (this.ball.y < this.opponent.y)
            this.opponent.move = DIRECTION.DOWN;
        else
            this.opponent.move = DIRECTION.IDLE;

        this.movePlayer(this.opponent);

        // Ball physics.
        if (this.ball.x + 2 == this.player.x - 4 
            && Math.abs(this.ball.y - this.player.y) 
            <= this.player.halfHeight + 1) 
        {
            this.ball.moveX = -this.ball.moveX;
        } 
        else if (this.ball.x - 2 == this.opponent.x + 4 
                && Math.abs(this.ball.y - this.opponent.y) 
                <=  this.opponent.halfHeight + 1)
        {
            this.ball.moveX = -this.ball.moveX;
        }

        if (this.ball.moveX > 0) {
            if (this.ball.x + 2 < this.minimap.width)
                this.ball.x = this.ball.x + this.ball.moveX;
            else
                this.ball.moveX = -this.ball.moveX;
        } else if (this.ball.moveX < 0) {
            if (this.ball.x - 2 > 0)
                this.ball.x = this.ball.x + this.ball.moveX
            else
                this.ball.moveX = -this.ball.moveX;
        }

        if (this.ball.moveY > 0) {
            if (this.ball.y + 6 < this.minimap.height)
                this.ball.y = this.ball.y + this.ball.moveY;
            else
                this.ball.moveY = -this.ball.moveY;
        } else if (this.ball.moveY < 0) {
            if (this.ball.y - 6 > 0) 
                this.ball.y = this.ball.y + this.ball.moveY;
            else
                this.ball.moveY = -this.ball.moveY;
        }

    },

    cast: function() {
        // Raycasting fun.

        const playerDir = {
            x: -1,
            y: 0,
        };

        const camera = {
            x: 0,
            y: 0.9,
        };

        const rayDirX = -1;      // Camera will always be facing towards -x axis.
        const deltaDistX = 1;

        var wallEnd;
        var ballHeight;

        for (let i = 0; i < this.canvas.width; i++) {
            let cameraX = 2 * i / this.canvas.width - 1;
            let rayDirY = playerDir.y + camera.y * cameraX;

            var sideDistX, sideDistY;
            var deltaDistY = (rayDirY == 0) ? 1e30 : Math.abs(1 / rayDirY);
            var stepY, stepX = -1;

            let ball;           // Is the ball in this column
            let paddle;         // Is the paddle in this column
            let perpWallDist;

            var side;
            var hit = 0;

            var mapX = this.player.x >> 2;
            var mapY = this.player.y >> 2;

            sideDistX = 0;
            
            if (rayDirY < 0) {
                stepY = -1;
                sideDistY = 0;
            } else {
                stepY = 1;
                sideDistY = deltaDistY;
            }

            while (hit == 0) {
                if (sideDistX < sideDistY) {
                    sideDistX += deltaDistX;
                    mapX += stepX;
                    side = 0;
                } else {
                    sideDistY += deltaDistY;
                    mapY += stepY;
                    side = 1;
                }

                if (mapY >= (this.opponent.y >> 2) - 2 
                        && mapY <= (this.opponent.y >> 2) + 2
                        && mapX == (this.opponent.x >> 2))
                   paddle = true; 

                
                if (mapY >= (this.ball.y >> 2) - 1
                        && mapY <= (this.ball.y >> 2) + 1
                        && mapX == (this.ball.x >> 2)) 
                {
                    if (!ballHeight) {
                        let perpBallDist = (side == 0) ? (sideDistX - deltaDistX) :
                                        (sideDistY - deltaDistY);
                        ballHeight = Math.floor(this.canvas.height / perpBallDist);
                    }

                    ball = true;

                } 


                if (mapY >= 40 || mapY <= 0)
                    hit = 1;
                else if (mapX <= 0)
                    hit = -1;
            }


            perpWallDist = (side == 0) ? (sideDistX - deltaDistX) : 
                            (sideDistY - deltaDistY);
            let lineHeight = Math.floor(this.canvas.height / perpWallDist); 
            let wallStart = (this.canvas.height >> 1) - lineHeight;
            wallEnd = (this.canvas.height >> 1) + lineHeight;

            if (hit == 1) {
               let color;

                if (wallEnd > 255)
                    color = "#ee0000";
                else if (wallEnd <= 255 && wallEnd > 225)
                    color = "#bb0000";
                else
                    color = "#880000";
                
                this.drawLine(this.context, i, wallStart, i, wallEnd, color);
            }

            let floor = wallEnd;

            if (floor <= 225) {
                let delta = (225 - floor)
                this.drawLine(this.context, i, floor, i, floor + delta, "#000088");
                floor += (delta + 1);
            }

            if (floor <= 255) {
                let delta = (255 - floor);
                this.drawLine(this.context, i, floor, i, floor + delta, "#0000bb");
                floor += (delta + 1);
            }

            this.drawLine(this.context, i, floor, i, this.canvas.height, "#0000ee");

            if (paddle) {
                this.drawLine(this.context, i, (this.canvas.height >> 1) - 4, 
                        i, (this.canvas.height >> 1) + 4, "#008800");
            }

            if (ball) {
                let color;

                let ballStart = (this.canvas.height >> 1) - ballHeight;
                let ballEnd = (this.canvas.height >> 1) + ballHeight;
                if (ballEnd > 255)
                    color = "#ee00ee";
                else if (ballEnd <= 255 && ballEnd > 225)
                    color = "#bb00bb";
                else
                    color = "#880088";

                this.drawLine(this.context, i, ballStart, i, ballEnd, color);
            }
        }
    },

    drawLine: function(context, x1, y1, x2, y2, color) {
        // Raycasting helper function.
        context.beginPath();
        context.strokeStyle = color;
        // Lines are actually drawn on the pixel grid by default.
        // Therefore, I must add 0.5 to each x value.
        context.moveTo(x1 + 0.5, y1);
        context.lineTo(x2 + 0.5, y2);
        context.stroke();
        context.closePath();
    },

    draw: function() {
        this.clear();
        
        // TODO(josh): This should be conditional depending if it's turned on.
        // Draw minimap.
        this.mmContext.fillStyle = "#ffffff";

        this.mmContext.fillRect(
            this.player.x,
            this.minimap.height - this.player.y - this.player.halfHeight,
            this.player.width,
            this.player.height,
        );

        this.mmContext.fillRect(
            this.opponent.x,
            this.minimap.height - this.opponent.y - this.opponent.halfHeight,
            this.opponent.width,
            this.opponent.height,
        );

        this.mmContext.fillRect(
            this.ball.x,
            this.minimap.height - this.ball.y - (this.ball.height >> 1),
            this.ball.width,
            this.ball.height,
        );

        // Draw dashed line in middle of mini-map.
        var halfWidth = this.minimap.width >> 1;
        for (let x = 2; (x + 6) < this.minimap.height; x += 10)
            this.drawLine(this.mmContext, halfWidth, x, 
                            halfWidth, (x + 6), "#ffffff");

        // Actual 3D portion.
        this.cast();

    },

    loop: function() {
        if (game.running) {
            game.updateState();
            game.draw();
        }
        requestAnimationFrame(game.loop);
    },
};

var game = Game;
game.initialize();

