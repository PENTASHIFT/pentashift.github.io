"use strict";

/*
    Title: First-person Pong
    Description: It's pong but in first-person.
    Start-date: 03-10-2022
    End-date: 3-29-2022.
*/

const DIRECTION = {
    IDLE: 0,
    UP: 1,
    DOWN: 2,
};

var Paddle = {
    new: function() {
        return {
            width: 4,
            height: 16,
            halfHeight: 8,
            x: 0,       // set in Game.initialgamestate().
            y: 0,       // set in Game.initialgamestate().
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
            x: (this.minimap.width >> 1) - 2,
            y: this.minimap.height >> 1,
            
            // Velocity in pixels/frames.
            delX: initialSpeed,
            delY: 0,
        };
    },

    randomizeDel: function() {
        // After a score, ball's direction needs to be randomized for added
        //      challenge.

        // Reset ball location.
        this.ball.x = this.ball.y = this.minimap.width >> 1;
        this.ball.x = this.ball.x - 2;

        // Goes towards paddle who didn't score.
        this.ball.delX = (this.ball.delX < 0) ? -1 : 1;
        this.ball.delY = Math.floor(Math.random() * 3);

        this.ball.delY = Math.floor((Math.random() * 2) == 0) ?
            this.ball.delY : -this.ball.delY;
    },

    updateDel: function(paddle) {
        // Specific velocity/direction depending where the ball hits the paddle.
        switch(this.ball.y - paddle.y) {
            case 9:
            case 8:
            case 7:
                this.ball.delX = (this.ball.delX < 0) ? 1 : -1;
                this.ball.delY = 2
                break;

            case 6:
            case 5:
            case 4:
            case 3:
                this.ball.delX = (this.ball.delX < 0) ? 1 : -1;
                this.ball.delY = 1;
                break;

            case 2:
            case 1:
            case 0:
            case -1:
            case -2:
                this.ball.delX = (this.ball.delX < 0) ? 2 : -2;
                this.ball.delY = 0;
                break;

            case -3:
            case -4:
            case -5:
            case -6:
                this.ball.delX = (this.ball.delX < 0) ? 1 : -1;
                this.ball.delY = -2;
                break;

            case -7:
            case -8:
            case -9:
                this.ball.delX = (this.ball.delX < 0) ? 1 : -1;
                this.ball.delY = -3;
                break;

            default:
                // Sanity check?
                this.ball.delX = (this.ball.delX < 0) ? 2 : -2;
                this.ball.delY = 0;
                break;
        };
    },
};

var Game = {
    initialize: function() {
        this.canvas = document.getElementById("game");
        this.context = this.canvas.getContext("2d");
        this.canvas.focus();

        this.opponentScoreId = document.getElementById("opp-score");
        this.playerScoreId = document.getElementById("player-score");

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
        this.pPosition = 16;                             // Paddle padding from the edge.
        this.player = Paddle.new();
        this.opponent = Paddle.new();
        this.ball = Ball.new.call(this, 2);

        // Key-codes
        this.playKey = 32;              // Space key
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
        this.over = true;
        this.running = false;
        this.maxScore = 10;

        // Start-up game.
        this.initialGameState();
        this.draw();
        this.overlay("FPP", 
            (this.canvas.width / 2 - 110),
            "Press space to begin!",
            (this.canvas.width / 2 - 105));
        //this.running = true;
        this.loop();
    },

    clear: function() {
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.mmContext.clearRect(0, 0, this.minimap.width, this.minimap.height);
    },

    overlay: function(header, xStart, msg, mxStart) {
        // Slightly transparent background.
        this.context.fillStyle = "rgba(0, 0, 0, 0.8)";
        this.context.fillRect(0, 0, this.canvas.width, 
            this.canvas.height);

        // Write message.
        this.context.fillStyle = "#ffffff";
        this.context.font = "Normal 100px Goldman";
        this.context.fillText(header, xStart, this.canvas.height / 4);

        this.context.font = "Normal 20px Goldman";
        this.context.fillText(msg, mxStart, 3 * this.canvas.height / 4);
        
    },

    initialGameState: function() {
        // Decide whose serve it is. Said serve will be horizontal.
        this.ball.delY = 0;
        this.ball.delX = (Math.floor(Math.random() * 2) == 0) ?
            this.ball.delX : -this.ball.delX;

        // Set paddles in their starting position.
        this.opponent.x = this.pPosition;
        this.player.y = this.opponent.y = this.minimap.height >> 1;
        this.player.x = this.minimap.width - this.pPosition;

    },

    keyHandler: function(key) {
        // Handle key presses.
        if (this.running) {
            switch(key.keyCode) {
                case this.moveUpKeyZero:
                case this.moveUpKeyOne:
                    this.player.move = DIRECTION.UP;
                    break;
                case this.moveDownKeyZero:
                case this.moveDownKeyOne:
                    this.player.move = DIRECTION.DOWN;
                    break;
                case this.menuKey:
                    // TODO(josh): Open menu here.
                    this.overlay("Paused", 
                        (this.canvas.width / 2 - 205),
                        "Press esc to continue.",
                        (this.canvas.width / 2 - 120));
                    this.running = false;
                    break;
                default:
                    break;
            }
        } else if (!this.over) {
            // Menu handling.
            if (key.keyCode == this.menuKey)
                this.running = true;
        } else {
            if (key.keyCode == this.playKey) {
                this.running = true;
                this.over = false;

                // Set scores.
                this.player.score = this.opponent.score = 0;
                this.updateScore();            
            }
        }
    },

    movePlayer: function(paddle) {
        if (paddle.move === DIRECTION.UP) {
            // Ensure player isn't going through walls.
            // Subtract (paddle / 2) due to paddle.y being the center.
            if (!(paddle.y >= (this.minimap.height - paddle.halfHeight)))
                paddle.y += paddle.speed;
        } else if (paddle.move === DIRECTION.DOWN) {
            // Same here.
            if (!(paddle.y - paddle.halfHeight <= 0))
                paddle.y -= paddle.speed;
        }
    },

    updateScore: function() {
        this.playerScoreId.textContent = (this.player.score == 10) ?
            "You: " + this.player.score
            : "You: 0" + this.player.score;

        this.opponentScoreId.textContent = 
            (this.opponent.score == 10) ?
            "Opponent: " + this.opponent.score 
            : "Opponent: 0" +  this.opponent.score;        

        if (this.player.score == 10) {
            this.initialGameState();
            this.overlay("Winner!", 
                (this.canvas.width / 2 - 203),
                "Press space to play again.",
                (this.canvas.width / 2 - 125));
            this.over = true;
            this.running = false;
            return;
        } else if (this.opponent.score == 10) {
            this.initialGameState();
            this.overlay("Loser!", 
                (this.canvas.width / 2 - 168),
                "Press space to play again.",
                (this.canvas.width / 2 - 125));
            this.over = true;
            this.running = false;
            return;
        }
    },

    updateState: function() {
        // Update player location.
        this.movePlayer(this.player);
        
        // Opponent "AI". Follow the ball around.
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
            // Ball/Player collision.
            Ball.updateDel.call(this, this.player);
        } 
        else if (this.ball.x - 2 == this.opponent.x + 4 
                && Math.abs(this.ball.y - this.opponent.y) 
                <=  this.opponent.halfHeight + 1)
        {
            // Ball/Opponent collision.
            Ball.updateDel.call(this, this.opponent);
        }

        if (this.ball.delX > 0) {
            if (this.ball.x + 2 < this.minimap.width)
                this.ball.x = this.ball.x + this.ball.delX;
            else {
                // Opponent scores.
                Ball.randomizeDel.call(this);

                this.opponent.score += 1;
                this.updateScore();
            }
        } else if (this.ball.delX < 0) {
            if (this.ball.x - 2 > 0)
                this.ball.x = this.ball.x + this.ball.delX
            else {
                // Player scores.
                Ball.randomizeDel.call(this);

                this.player.score += 1;
                this.updateScore();
            }
        }

        // Bounce the ball off the upper and lower walls.
        if (this.ball.delY > 0) {
            if (this.ball.y + 6 < this.minimap.height)
                this.ball.y = this.ball.y + this.ball.delY;
            else
                this.ball.delY = -this.ball.delY;
        } else if (this.ball.delY < 0) {
            if (this.ball.y - 6 > 0) 
                this.ball.y = this.ball.y + this.ball.delY;
            else
                this.ball.delY = -this.ball.delY;
        }

    },

    cast: function() {
        // Raycasting fun.

        // Camera will always be facing towards -x axis.
        const playerDir = {
            x: -1,
            y: 0,
        };

        // 90 deg FOV.
        const camera = {
            x: 0,
            y: 0.9,
        };

        const rayDirX = -1;      // Camera will always be facing towards -x axis.
        const deltaDistX = 1;

        // wallEnd is hoisted outside of the loop so that we can reuse the same
        // values to calculate the floor in the backmost walls.
        var wallEnd;
        
        // ballHeight only needs to be calculated once per frame due to it 
        // being of constant height, hence this variable being hoisted outside
        // of the loop.
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

            var side;           // x or y axis.
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

            // Loop until you hit a wall.
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
    
                // Did panel appear in this column?
                if (mapY >= (this.opponent.y >> 2) - 2 
                        && mapY <= (this.opponent.y >> 2) + 2
                        && mapX == (this.opponent.x >> 2))
                   paddle = true; 

                
                // Did ball appear in this column?
                if (mapY >= (this.ball.y >> 2) - 1
                        && mapY <= (this.ball.y >> 2) + 1
                        && mapX == (this.ball.x >> 2)) 
                {
                    if (!ballHeight) {
                        // This only really needs to be calculated once per
                        //      frame due to the ball being constant sized.
                        let perpBallDist = (side == 0) ? (sideDistX - deltaDistX) :
                                        (sideDistY - deltaDistY);
                        ballHeight = Math.floor(this.canvas.height / perpBallDist);
                    }

                    ball = true;

                } 


                // Stop searching if we hit the wall behind opponent.
                if (mapY >= 40 || mapY <= 0)
                    hit = 1;
                else if (mapX <= 0)
                    hit = -1;
            }


            // Calculate wall height.
            perpWallDist = (side == 0) ? (sideDistX - deltaDistX) : 
                            (sideDistY - deltaDistY);
            let lineHeight = Math.floor(this.canvas.height / perpWallDist); 
            let wallStart = (this.canvas.height >> 1) - lineHeight;
            wallEnd = (this.canvas.height >> 1) + lineHeight;

            if (hit == 1) {
               let color;

                // Shading for the wall depending on depth.
                if (wallEnd > 255)
                    color = "#ee0000";
                else if (wallEnd <= 255 && wallEnd > 225)
                    color = "#bb0000";
                else
                    color = "#880000";
                
                this.drawLine(this.context, i, wallStart, i, wallEnd, color);
            }

            let floor = wallEnd;

            // Shading for the floor depending on depth.
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

            // Paddle is in this column.
            if (paddle) {
                
                // Crude Painter's Algorithm
                if (ball && (this.ball.x < this.opponent.x)) {
                    // Draw ball first.
                    let ballStart = (this.canvas.height >> 1) - ballHeight;
                    let ballEnd = (this.canvas.height >> 1) + ballHeight;
                    this.drawLine(this.context, i, ballStart, i, ballEnd,
                            "#880088");

                    // Now paddle.
                    this.drawLine(this.context, i, (this.canvas.height >> 1) - 4, 
                        i, (this.canvas.height >> 1) + 4, "#008800");

                    continue;

                } else {
                    this.drawLine(this.context, i, (this.canvas.height >> 1) - 4, 
                        i, (this.canvas.height >> 1) + 4, "#008800");
                }
            }

            // Ball is in this column.
            if (ball) {
                let color;

                let ballStart = (this.canvas.height >> 1) - ballHeight;
                let ballEnd = (this.canvas.height >> 1) + ballHeight;

                // Shading for the ball depending on depth.
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
        // Draw a line 1 pixel wide.
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
        // Draw the entire frame.
        this.clear();
        
        // TODO(josh): Minimap should be conditional depending if it's turned on
        //              via a settings menu.

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

        // Actual "3D" portion.
        this.cast();

    },

    loop: function() {
        // Main game loop.

        if (game.running) {
            game.draw();
            game.updateState();
        }

        requestAnimationFrame(game.loop);
    },
};

var game = Game;

document.fonts.ready.then(() => {
    game.initialize();
});

