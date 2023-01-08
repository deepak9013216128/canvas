class Game {
  constructor() {
    this.canvas = document.getElementById("game");
    this.context = this.canvas.getContext("2d");
    this.debug = true;
    this.framesData = [];
    this.sprites = [];

    this.loadData();
  }

  loadData() {
    const game = this;
    fetch("flowers.json")
      .then((res) => res.json())
      .then((data) => {
        game.framesData = data;
        this.spriteImage = new Image();
        this.spriteImage.src = data?.meta?.image;
        this.spriteImage.onload = function () {
          game.init();
          game.refresh();
        };
      });
  }

  init() {
    // create an engine
    this.engine = Matter.Engine.create();

    const bodies = [];
    for (let i = 0; i < 8; i++) {
      const index = Math.floor(Math.random() * this.framesData.frames.length);
      const frameData = this.framesData.frames[index];
      let radius = (frameData.frame.w + frameData.frame.h) / 4;
      let sides, body;
      if (index === 1) sides = 5;
      else if (index === 3) sides = 4;
      else sides = 1;
      if (sides == 1) {
        body = Matter.Bodies.circle(100 + 70 * i, 100, radius);
      } else {
        radius += radius * (sides === 4 ? 0.2 : 0.1);
        body = Matter.Bodies.polygon(100 + 70 * i, 100, sides, radius);
      }
      this.sprites.push(new Sprite(this.spriteImage, frameData, body));
      bodies.push(body);
    }
    bodies.push(
      Matter.Bodies.rectangle(0, 0, 2 * this.canvas.width, 100, {
        isStatic: true,
      })
    );

    bodies.push(
      Matter.Bodies.rectangle(
        0,
        this.canvas.height,
        this.canvas.width * 2,
        100,
        {
          isStatic: true,
        }
      )
    );
    bodies.push(
      Matter.Bodies.rectangle(0, 0, 100, this.canvas.height * 2, {
        isStatic: true,
      })
    );
    bodies.push(
      Matter.Bodies.rectangle(
        this.canvas.width,
        0,
        100,
        this.canvas.height * 2,
        {
          isStatic: true,
        }
      )
    );
    bodies.push(
      Matter.Bodies.rectangle(
        this.canvas.width / 2,
        this.canvas.height / 2,
        this.canvas.width / 2,
        10,
        {
          angle: (2 * Math.PI) / 14,
          isStatic: true,
        }
      )
    );

    // add all of the bodies to the world
    Matter.World.add(this.engine.world, bodies);

    // run the engine
    Matter.Runner.run(this.engine);
  }
  refresh() {
    const game = this;
    window.requestAnimationFrame(function () {
      game.refresh();
    });
    this.render();
  }
  debugPhysics(bodies) {
    this.context.beginPath();

    for (let body of bodies) {
      const vertices = body.vertices;

      this.context.moveTo(vertices[0].x, vertices[0].y);

      for (let vertex of vertices) {
        this.context.lineTo(vertex.x, vertex.y);
      }

      this.context.lineTo(vertices[0].x, vertices[0].y);
    }

    this.context.lineWidth = 1;
    this.context.strokeStyle = "#999";
    this.context.stroke();
  }

  render() {
    let bodies = Matter.Composite.allBodies(this.engine.world);
    this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    for (let i = 0; i < this.sprites.length; i++) {
      this.sprites[i].render(this.context);
    }

    if (this.debug) this.debugPhysics(bodies);
  }
}

class Sprite {
  constructor(image, frameData, physicsBody) {
    this.image = image;
    this.frameData = frameData;
    this.physicsBody = physicsBody;
  }
  render(context) {
    if (context != null && this.physicsBody != null) {
      const frame = this.frameData.frame;
      context.translate(
        this.physicsBody.position.x,
        this.physicsBody.position.y
      );
      context.rotate(this.physicsBody.angle);
      context.drawImage(
        this.image,
        frame.x,
        frame.y,
        frame.w,
        frame.h,
        -frame.w / 2,
        -frame.h / 2,
        frame.w,
        frame.h
      );
      context.setTransform(1, 0, 0, 1, 0, 0);
    } else {
      console.warn("No context or physicsBody when calling Sprite.render");
    }
  }
}
