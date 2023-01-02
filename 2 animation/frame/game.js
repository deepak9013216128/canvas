// JavaScript Document
class Game {
  constructor() {
    this.canvas = document.getElementById("game");
    this.context = this.canvas.getContext("2d");
    this.context.font = "30px Verdana";
    this.sprites = [];
    this.states = {
      walk: {
        frames: [0, 1, 2, 3, 4, 5, 6, 7],
        loop: true,
        motion: { x: 120, y: 0 },
        fps: 8,
      },
    };
    Object.freeze(this.states);

    this.loadJSON();
  }

  loadJSON() {
    const game = this;
    fetch("bucket.json")
      .then((res) => res.json())
      .then((data) => {
        game.spriteData = data;
        game.spriteImage = new Image();
        game.spriteImage.src = game.spriteData.meta.image;
        game.spriteImage.onload = function () {
          game.init();
          game.refresh();
        };
      });
  }

  init() {
    this.score = 0;
    this.lastRefreshTime = Date.now();
    this.spawn();
    this.refresh();

    const game = this;
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

  update(dt) {
    for (let sprite of this.sprites) {
      if (sprite == null) continue;
      sprite.update(dt);
    }
  }

  spawn() {
    const frameData = this.spriteData.frames[0];
    const sprite = new Sprite({
      context: this.context,
      x: this.canvas.width / 2,
      y: this.canvas.height / 2,
      width: frameData.sourceSize.w,
      height: frameData.sourceSize.h,
      anchor: { x: 0.5, y: 0.5 },
      image: this.spriteImage,
      json: this.spriteData,
      states: this.states,
      state: "walk",
    });
    this.bucket = sprite;
    this.sprites.push(sprite);
    this.sinceLastSpawn = 0;
  }

  render() {
    this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);

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
    this.json = options.json;
    this.index = options.index;
    this.frameData = options.frameData;
    this.x = options.x;
    this.y = options.y;
    this.anchor = options.anchor == null ? { x: 0.5, y: 0.5 } : options.anchor;
    this.states = options.states;
    this.state = options.states[options.state];
    this.scale = options.scale == null ? 1.0 : options.scale;
    this.opacity = options.opacity == null ? 1.0 : options.opacity;
    this.currentTime = 0;
    this.kill = false;
    this.state.duration = this.state.frames.length * (1.0 / this.state.fps);
  }

  get offset() {
    const scale = this.scale;
    const w = this.frameData.sourceSize.w;
    const h = this.frameData.sourceSize.h;
    const x = this.frameData.spriteSourceSize.x;
    const y = this.frameData.spriteSourceSize.y;

    return {
      x: (w - x) * scale * this.anchor.x,
      y: (h - y) * scale * this.anchor.y,
    };
  }

  update(dt) {
    this.currentTime += dt;
    if (this.currentTime > this.state.duration) {
      if (this.state.loop) {
        this.currentTime -= this.state.duration;
      }
    }
    this.x += this.state.motion.x * dt;
    this.y += this.state.motion.y * dt;
    if (this.x > window.innerWidth) this.x = -100;

    const index = Math.floor(
      (this.currentTime / this.state.duration) * this.state.frames.length
    );
    this.frameData = this.json.frames[this.state.frames[index]];
  }

  render() {
    // Draw the animation
    const alpha = this.context.globalAlpha;

    this.context.globalAlpha = this.opacity;
    const frame = this.frameData.frame;
    const offset = this.offset;

    this.context.drawImage(
      this.image,
      frame.x,
      frame.y,
      frame.w,
      frame.h,
      this.x - offset.x,
      this.y - offset.y,
      frame.w * this.scale,
      frame.h * this.scale
    );

    this.context.globalAlpha = alpha;
  }
}
