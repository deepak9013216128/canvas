class Game {
  constructor() {
    this.canvas = document.getElementById("game");
    this.context = this.canvas.getContext("2d");
    this.lastRefreshTime = Date.now();
    this.currentTime = 0;
    this.score = 0;
    this.spriteData;
    this.spriteImage;
    this.snake = [];
    this.growsegments = 0;
    this.gameoverdelay = 0.5;
    // Direction table: Up, Right, Down, Left
    this.directions = [
      [0, -1],
      [1, 0],
      [0, 1],
      [-1, 0],
    ];
    this.level = 1;
    this.apple = {};
    this.fps = 1;
    this.speed = 5; //Starting speed of snake, pixel travel per second
    this.font = "30px Verdana";
    this.txtoptions = {
      alignment: "center",
      font: "Verdana",
      fontSize: 12,
      lineHeight: 15,
      color: "#fff",
    };
    const game = this;
    const options = {
      assets: ["snake.json", "snake.png"],
      oncomplete: function () {
        const progress = document.getElementById("progress");
        progress.style.display = "none";
        game.load();
      },
      onprogress: function (value) {
        const bar = document.getElementById("progress-bar");
        bar.style.width = `${value * 100}%`;
      },
    };

    const preloader = new Preloader(options);
  }
  load() {
    const game = this;
    this.loadJSON("snake", function (data, game) {
      game.spriteData = JSON.parse(data);
      game.spriteImage = new Image();
      game.spriteImage.src = game.spriteData.meta.image;
      game.spriteImage.onload = function () {
        game.init();
      };
    });
  }

  loadJSON(json, callback) {
    const xobj = new XMLHttpRequest();
    xobj.overrideMimeType("application/json");
    xobj.open("GET", json + ".json", true);
    const game = this;
    xobj.onreadystatechange = function () {
      if (xobj.readyState == 4 && xobj.status == "200") {
        callback(xobj.responseText, game);
      }
    };
    xobj.send(null);
  }

  changeApplePosition() {
    while (true) {
      let x = Math.floor(Math.random() * this.config.cols);
      let y = Math.floor(Math.random() * this.config.rows);

      let overlap = false;
      for (const pos of this.snake) {
        if (pos.x == x && pos.y == y) {
          overlap = true;
          break;
        }
      }
      if (!overlap) {
        this.apple.x = x;
        this.apple.y = y;
        break;
      }
    }
  }

  init() {
    console.log(this);
    this.canvas.width = this.canvas.offsetWidth;
    this.canvas.height = this.canvas.offsetHeight;
    this.config = {};
    this.config.box = this.spriteData.frames[0].sourceSize; // {w: 40, h:40}
    this.config.rows = Math.floor(this.canvas.height / this.config.box.w);
    this.config.cols = Math.floor(this.canvas.width / this.config.box.h);

    //Starting position of snake
    this.config.snake = {
      x: Math.floor(this.config.cols / 2),
      y: Math.floor(this.config.rows / 2),
    };

    this.snakeDirection = 1;
    this.movedelay = 0;
    this.snake = [];
    for (let i = 0; i < 4; i++) {
      this.snake.push({
        x:
          Math.floor(this.config.cols / 2) -
          i * this.directions[this.snakeDirection][0],
        y:
          Math.floor(this.config.rows / 2) -
          i * this.directions[this.snakeDirection][1],
      });
    }
    this.changeApplePosition();

    const game = this;

    window.addEventListener("keydown", function (event) {
      game.onKeyDown(event);
    });

    this.refresh();
  }

  refresh() {
    const now = Date.now();
    const dt = (now - this.lastRefreshTime) / 1000.0;

    this.update(dt);
    this.render();

    this.lastRefreshTime = now;

    const game = this;
    requestAnimationFrame(function () {
      game.refresh();
    });
  }
  tryMove = function (dt) {
    this.movedelay += dt;
    var maxmovedelay = 1 / this.speed;
    if (this.movedelay > maxmovedelay) {
      return true;
    }
    return false;
  };
  nextMove() {
    var nextx = this.config.snake.x + this.directions[this.snakeDirection][0];
    var nexty = this.config.snake.y + this.directions[this.snakeDirection][1];
    return { x: nextx, y: nexty };
  }
  move() {
    // Get the next move and modify the position
    var nextmove = this.nextMove();
    this.config.snake.x = nextmove.x;
    this.config.snake.y = nextmove.y;

    // Get the position of the last segment
    var lastseg = this.snake[this.snake.length - 1];
    var growx = lastseg.x;
    var growy = lastseg.y;

    // Move segments to the position of the previous segment
    for (var i = this.snake.length - 1; i >= 1; i--) {
      this.snake[i].x = this.snake[i - 1].x;
      this.snake[i].y = this.snake[i - 1].y;
    }

    // // Grow a segment if needed
    if (this.growsegments > 0) {
      this.snake.push({ x: growx, y: growy });
      this.growsegments--;
    }

    // Move the first segment
    this.snake[0].x = this.config.snake.x;
    this.snake[0].y = this.config.snake.y;

    // Reset movedelay
    this.movedelay = 0;
  }
  updateGame(dt) {
    // Move the snake
    if (this.tryMove(dt)) {
      // Check snake collisions
      // Get the coordinates of the next move
      var nextmove = this.nextMove();
      var nx = nextmove.x;
      var ny = nextmove.y;

      if (
        nx >= 0 &&
        nx < this.config.cols &&
        ny >= 0 &&
        ny < this.config.rows
      ) {
        // if (this.config?.walls[nx][ny] == 1) {
        //   // Collision with a wall
        //   this.gameover = true;
        // }

        // Collisions with the snake itself
        for (var i = 0; i < this.snake.length; i++) {
          var sx = this.snake[i].x;
          var sy = this.snake[i].y;

          if (nx == sx && ny == sy) {
            // Found a snake part
            this.gameover = true;
            break;
          }
        }

        if (!this.gameover) {
          // The snake is allowed to move

          // Move the snake
          this.move();

          // Check collision with an apple
          if (nx == this.apple.x && ny == this.apple.y) {
            // Add a new apple
            this.changeApplePosition();

            // Grow the snake
            this.grow();

            // Add a point to the score
            this.score++;
          }
        }
      } else {
        // Out of bounds
        this.gameover = true;
      }

      if (this.gameover) {
        this.gameovertime = 0;
      }
    }
  }

  update(dt) {
    this.currentTime += dt;
    if (!this.gameover) {
      this.updateGame(dt);
    } else {
      this.gameovertime += dt;
    }
    if (this.currentTime > 1) this.currentTime = 0;
  }

  render() {
    this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.context.fillStyle = "#fff";

    this.drawBox();
    this.drawSnake();
    this.drawApple();
    this.context.font = this.font;
    this.context.fillStyle = "#999";
    let str = String(`Score: ${this.score}`);
    let txt = this.context.measureText(str);
    this.context.fillText(str, 310 - txt.width / 2, 25);
    if (this.gameover) this.drawGameOverText();
  }

  drawGameOverText() {
    this.context.beginPath();
    this.context.rect(
      this.canvas.width / 2 - 150,
      this.canvas.height / 2 - 100,
      300,
      200
    );
    this.context.stroke();
    this.context.beginPath();
    this.context.fillRect(
      this.canvas.width / 2 - 150,
      this.canvas.height / 2 - 100,
      300,
      200
    );
    this.context.beginPath();
    this.context.font = this.font;
    this.context.fillStyle = "red";
    let str = String(`Game Over`);
    let txt = this.context.measureText(str);
    this.context.fillText(
      str,
      this.canvas.width / 2 - txt.width / 2,
      this.canvas.height / 2
    );
    this.context.beginPath();
    this.context.font = "20px Verdana";
    this.context.fillStyle = "#000";
    str = String(`Your Score is ${this.score}`);
    txt = this.context.measureText(str);
    this.context.fillText(
      str,
      this.canvas.width / 2 - txt.width / 2,
      this.canvas.height / 2 + 30
    );
    this.context.beginPath();
    this.context.font = "20px Verdana";
    this.context.fillStyle = "#fff";
    str = String(`Press any key to start!`);
    txt = this.context.measureText(str);
    this.context.fillText(
      str,
      this.canvas.width / 2 - txt.width / 2,
      this.canvas.height / 2 + 50
    );
  }

  drawApple() {
    let frameData = this.spriteData?.frames?.find(
      (f) => f?.filename === "apple.png"
    );
    if (!frameData) return;
    // Draw the image of the snake part
    this.context.drawImage(
      this.spriteImage,
      frameData.frame.x,
      frameData.frame.y,
      frameData.frame.w,
      frameData.frame.h,
      this.apple.x * this.config.box.w,
      this.apple.y * this.config.box.h,
      frameData.frame.w,
      frameData.frame.h
    );
  }

  drawSnake() {
    // Loop over every snake segment
    for (var i = 0; i < this.snake.length; i++) {
      var segment = this.snake[i];
      var segx = segment.x;
      var segy = segment.y;
      var tilex = segx * this.config.box.w;
      var tiley = segy * this.config.box.h;

      let fileName;

      if (i == 0) {
        // Head; Determine the correct image
        var nseg = this.snake[i + 1]; // Next segment
        if (segy < nseg.y) {
          // Up
          fileName = "head_up.png";
        } else if (segx > nseg.x) {
          // Right
          fileName = "head_right.png";
        } else if (segy > nseg.y) {
          // Down
          fileName = "head_down.png";
        } else if (segx < nseg.x) {
          // Left
          fileName = "head_left.png";
        }
      } else if (i == this.snake.length - 1) {
        // Tail; Determine the correct image
        var pseg = this.snake[i - 1]; // Prev segment
        if (pseg.y < segy) {
          // Up
          fileName = "tail_down.png";
        } else if (pseg.x > segx) {
          // Right
          fileName = "tail_left.png";
        } else if (pseg.y > segy) {
          // Down
          fileName = "tail_up.png";
        } else if (pseg.x < segx) {
          // Left
          fileName = "tail_right.png";
        }
      } else {
        // Body; Determine the correct image
        var pseg = this.snake[i - 1]; // Previous segment
        var nseg = this.snake[i + 1]; // Next segment
        if (
          (pseg.x < segx && nseg.x > segx) ||
          (nseg.x < segx && pseg.x > segx)
        ) {
          // Horizontal Left-Right
          fileName = "body_horizontal.png";
        } else if (
          (pseg.x < segx && nseg.y > segy) ||
          (nseg.x < segx && pseg.y > segy)
        ) {
          // Angle Left-Down
          fileName = "body_bottomleft.png";
        } else if (
          (pseg.y < segy && nseg.y > segy) ||
          (nseg.y < segy && pseg.y > segy)
        ) {
          // Vertical Up-Down
          fileName = "body_vertical.png";
        } else if (
          (pseg.y < segy && nseg.x < segx) ||
          (nseg.y < segy && pseg.x < segx)
        ) {
          // Angle Top-Left
          fileName = "body_topleft.png";
        } else if (
          (pseg.x > segx && nseg.y < segy) ||
          (nseg.x > segx && pseg.y < segy)
        ) {
          // Angle Right-Up
          fileName = "body_topright.png";
        } else if (
          (pseg.y > segy && nseg.x > segx) ||
          (nseg.y > segy && pseg.x > segx)
        ) {
          // Angle Down-Right
          fileName = "body_bottomright.png";
        }
      }

      let frameData = this.spriteData?.frames?.find(
        (f) => f?.filename === fileName
      );
      if (!frameData) continue;
      // Draw the image of the snake part
      this.context.drawImage(
        this.spriteImage,
        frameData.frame.x,
        frameData.frame.y,
        frameData.frame.w,
        frameData.frame.h,
        tilex,
        tiley,
        frameData.frame.w,
        frameData.frame.h
      );
    }
  }

  drawBox() {
    const { rows, cols, box } = this.config;
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        this.context.beginPath();
        this.context.rect(col * box.w, row * box.h, box.w, box.h);
        this.context.stroke();
      }
    }
  }

  tryNewGame() {
    if (this.gameovertime > this.gameoverdelay) {
      this.init();
      this.gameover = false;
    }
  }

  grow = function () {
    this.growsegments++;
  };

  onKeyDown(e) {
    if (this.gameover) {
      this.tryNewGame();
    } else {
      if (e.keyCode == 37 || e.keyCode == 65) {
        // Left or A
        if (this.snakeDirection != 1) {
          this.snakeDirection = 3;
        }
      } else if (e.keyCode == 38 || e.keyCode == 87) {
        // Up or W
        if (this.snakeDirection != 2) {
          this.snakeDirection = 0;
        }
      } else if (e.keyCode == 39 || e.keyCode == 68) {
        // Right or D
        if (this.snakeDirection != 3) {
          this.snakeDirection = 1;
        }
      } else if (e.keyCode == 40 || e.keyCode == 83) {
        // Down or S
        if (this.snakeDirection != 0) {
          this.snakeDirection = 2;
        }
      }

      // Grow for demonstration purposes
      if (e.keyCode == 32) {
        this.grow();
      }
    }
  }
}
