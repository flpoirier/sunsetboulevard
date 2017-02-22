class Game {

  constructor(sun, stars, asteroids, dude) {

    this.sun = sun;
    this.stars = stars;
    this.asteroids = asteroids;
    this.dude = dude;

    this.canvas = document.getElementById("myCanvas");
    this.ctx = this.canvas.getContext("2d");
    this.canvasWidth = 1100;
    this.canvasHeight = 750;

    this.endMargin = 40;
    this.endPoint = this.canvasWidth - this.endMargin;

    this.bridgeX = this.canvasWidth / 2;
    this.bridgeY = this.canvasHeight + 400;
    this.bridgeRad = this.canvasWidth * 2/3;
    this.bridgeHeight = Math.floor(this.bridgeRad + this.asteroidRad);

    this.maxTime = 30;
    this.time = this.maxTime;
    this.minsAndSecs = "";

    this.gameOver = false;
    this.gameWon = false;
    this.gameLost = false;

    this.rightPressed = false;
    this.leftPressed = false;
    this.upPressed = false;
    this.downPressed = false;
    this.spacePressed = false;

    this.keyDownHandler = this.keyDownHandler.bind(this);
    this.keyUpHandler = this.keyUpHandler.bind(this);
    this.timeString = this.timeString.bind(this);
    this.timeTick = this.timeTick.bind(this);
    this.draw = this.draw.bind(this);
    this.play = this.play.bind(this);
  }

  // end of constants

  keyDownHandler(e) {
    if(e.keyCode == 39) {
      rightPressed = true;
    }
    else if(e.keyCode == 37) {
      leftPressed = true;
    }
    else if(e.keyCode == 38) {
      upPressed = true;
    }
    else if(e.keyCode == 40) {
      downPressed = true;
    }
    else if(e.keyCode == 32) {
      spacePressed = true;
    }
  }

  keyUpHandler(e) {
    if(e.keyCode == 39) {
      rightPressed = false;
    }
    else if(e.keyCode == 37) {
      leftPressed = false;
    }
    else if(e.keyCode == 38) {
      upPressed = false;
    }
    else if(e.keyCode == 40) {
      downPressed = false;
    }
    else if(e.keyCode == 32) {
      spacePressed = false;
    }
  }

  timeString() {
    let mins = Math.floor(this.time / 60);
    let secs = this.time - (mins * 60);
    if (mins === 0) {
      mins = "00";
    } else {
      mins = `0${mins}`;
    }
    if (secs === 0) {
      secs = "00";
    } else if (secs < 10) {
      secs = `0${secs}`;
    } else if (secs > 10) {
      secs = `${secs}`;
    }
    this.minsAndSecs = `${mins}:${secs}`;
  }

  timeTick() {
    if (this.time > 0) {
      this.time -= 1;
    }
    this.timeString();
  }

  draw() {

    this.ctx.fillStyle = `rgb(${this.sun.red},${this.sun.green},${this.sun.blue})`;
    this.ctx.fillRect(0,0,this.canvasWidth,this.canvasHeight);

    if (this.sun.blue < 150) {

      for (let starIdx = 0; starIdx < this.stars.starsOut; starIdx ++) {
        let star = this.stars.stars[starIdx];
        this.ctx.fillStyle = "white";
        this.ctx.beginPath();
        this.ctx.arc(star.starX, star.starY, star.starRad, 0, 2 * Math.PI);
        this.ctx.fill();
      }
    }

    let dist = 450;
    let tempRed = 255;
    let tempGreen = 255;
    let trans = 0.03;

    while (dist >= 0) {

      tempRed = this.sun.red - dist + Math.floor(300*this.sun.sunY/500);
      if (tempRed < this.sun.red) {
        tempRed = this.sun.red;
      }

      tempGreen = this.sun.green - dist + Math.floor(175*this.sun.sunY/500);
      if (tempGreen < this.sun.green) {
        tempGreen = this.sun.green;
      }

      if (!this.sun.skyColored(tempRed, tempGreen)) {
        this.ctx.fillStyle = `rgba(${tempRed},${tempGreen},${this.sun.blue}, ${trans})`;
        this.ctx.beginPath();
        this.ctx.arc(this.sun.sunX, this.sun.sunY, dist, 0, 2 * Math.PI);
        this.ctx.fill();
      }

      dist -= 3;
      if (trans < 1) {
        trans += 0.03;
      }
    }

    this.ctx.fillStyle = "white";
    this.ctx.beginPath();
    this.ctx.arc(this.sun.sunX, this.sun.sunY, this.sun.sunRad, 0, 2 * Math.PI);
    this.ctx.fill();

    this.ctx.strokeStyle = "#7b9095";
    this.ctx.lineWidth = 15;
    this.ctx.beginPath();
    this.ctx.arc(this.bridgeX, this.bridgeY, this.bridgeRad, Math.PI, 2 * Math.PI);
    this.ctx.stroke();

    let translatedDudeX = 0;
    if (this.dude.dudeX < this.bridgeX) {
      translatedDudeX = -(this.bridgeX - this.dude.dudeX);
    } else if (this.dude.dudeX > this.bridgeX) {
      translatedDudeX = this.dude.dudeX - this.bridgeX;
    }

    let dudeAngle = Math.PI - Math.acos(translatedDudeX / this.bridgeRad);
    let dudeXDraw = this.dude.dudeX;

    // change dudeX to account for jump

    this.dude.dudeY = this.bridgeY - Math.floor(this.bridgeRad * Math.sin(dudeAngle)) - this.dude.jumpHeight - this.dude.dudeRad;

    this.ctx.fillStyle = "purple";
    this.ctx.beginPath();
    this.ctx.arc(this.dude.dudeX, this.dude.dudeY, this.dude.dudeRad, 0, 2 * Math.PI);
    this.ctx.fill();

    this.asteroids.asteroids.forEach((asteroid) => {

      if (!asteroid.intersecting) {
        this.ctx.fillStyle = asteroid.color;
      } else {
        this.ctx.fillStyle = asteroid.intersectingColor;
      }
      this.ctx.beginPath();
      this.ctx.arc(asteroid.X, asteroid.Y, this.asteroids.asteroidRad, 0, 2 * Math.PI);
      this.ctx.fill();

      if (asteroid.Y >= (asteroid.collisionPoint - this.asteroids.asteroidSpeed)) {
        asteroid.falling = false;
        asteroid.Y = asteroid.collisionPoint;
        asteroid.rolling = true;
      }

      if (asteroid.falling) {

        asteroid.Y += this.asteroids.asteroidSpeed;

      } else if (asteroid.rolling) {

        asteroid.X += Math.floor(asteroid.dX / 2);

        let translatedAstX = 0;
        if (asteroid.X < this.bridgeX) {
          translatedAstX = -(this.bridgeX - asteroid.X);
        } else if (asteroid.X > this.bridgeX) {
          translatedAstX = asteroid.X - this.bridgeX;
        }

        let asteroidAngle = Math.PI - Math.acos(translatedAstX / this.bridgeRad);
        asteroid.Y = this.bridgeY - Math.floor(this.bridgeRad * Math.sin(asteroidAngle)) - this.asteroids.asteroidRad;

      }

    });

    this.ctx.fillStyle = "white";
    this.ctx.font = "30px sans-serif";
    this.ctx.fillText(`${this.minsAndSecs}`, 40, 60);

    if (this.gameWon) {
      this.ctx.fillStyle = "white";
      this.ctx.font = "60px sans-serif";
      this.ctx.fillText("You won!", (this.canvasWidth / 2) - 125, this.canvasHeight / 2);
    } else if (this.gameLost) {
      this.ctx.fillStyle = "white";
      this.ctx.font = "60px sans-serif";
      this.ctx.fillText("You lost!", (this.canvasWidth / 2) - 125, this.canvasHeight / 2);
    }

  }

  // end of draw function

  play() {

    this.timeString();
    this.stars.starConstructor();

    document.addEventListener("keydown", this.keyDownHandler, false);
    document.addEventListener("keyup", this.keyUpHandler, false);

    setInterval(this.sun.sundown, 30);
    setInterval(() => { this.stars.starshine(this.sun.blue); }, 30);
    setInterval(this.dude.walking, 30);
    setInterval(this.asteroids.collisionChecker, 30);
    setInterval(this.asteroids.asteroidConstructor, 1000);
    setInterval(this.asteroids.asteroidConstructor, 2500);
    setInterval(this.timeTick, 1000);
    setInterval(this.timeString, 1000);
    setInterval(this.draw, 30);

  }
}

module.exports = Game;
