class Game {
  constructor() {
    this.canvas = document.getElementById("game");
    this.context = this.canvas.getContext("2d");
    this.sprites = [];

    this.spriteImage = new Image();
    this.spriteImage.src = "./flower.png";

    const game = this;
    this.spriteImage.onload = function (event) {
      game.lastRefreshTime = Date.now();
      game.spawn();
      game.refersh();
    };
  }
  spawn() {
    const sprite = new Sprite({
      context: this.context,
      x: Math.random() * this.canvas.width,
      y: Math.random() * this.canvas.height,
      width: this.spriteImage.width,
      height: this.spriteImage.height,
      image: this.spriteImage,
    });
    this.sprites.pop();
    this.sprites.push(sprite);
    this.sinceLastSpawn = 0;
  }
  refersh() {
    const now = Date.now();
    const dt = (now - this.lastRefreshTime) / 1000;
    this.update(dt);
    this.render();

    this.lastRefreshTime = now;

    const game = this;
    requestAnimationFrame(function () {
      game.refersh();
    });
  }
  update(dt) {
    this.sinceLastSpawn += dt;
    if (this.sinceLastSpawn > 1) this.spawn();
  }
  render() {
    for (let sprite of this.sprites) {
      sprite.render();
    }
  }
}

class Sprite {
  constructor(options) {
    this.context = options.context;
    this.width = options.width;
    this.height = options.height;
    this.image = options.image;
    this.x = options.x;
    this.y = options.y;
  }

  render() {
    this.context.drawImage(this.image, this.x, this.y);
  }
}
