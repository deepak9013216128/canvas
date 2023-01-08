class Game {
  constructor() {
    this.canvas = document.getElementById("game");
    this.context = this.canvas.getContext("2d");
    this.debug = true;
    this.init();
    this.refresh();
  }

  init() {
    // create an engine
    this.engine = Matter.Engine.create();

    const bodies = [];
    for (let i = 0; i < 8; i++) {
      const body = Matter.Bodies.circle(100 * i, 100, 50, 50);
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

    if (this.debug) this.debugPhysics(bodies);
  }
}
