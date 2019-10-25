import GameContext from "./GameContext";
import Time from "./Time";
import Bullet from "./Bullet";
import spritesheet from "/assets/FinnSprite.png";
import HP from "./HP";

type coords = [number, number];
export enum CharacterDirection {
  Left = -1,
  None = 0,
  Right = 1
}

class Character {
  private gravity = 9.8;

  private lastFired = 0;
  private health = 100;
  private start = 0;
  private lastDirection = -1;
  private moving = false;
  private healthBar: HP = null;
  private fireRate = 10;
  private time;
  private damage = 10;
  private aim = { x: 0, y: 0 };
  private direction = { x: 0, y: 0 };
  private characterWidth: number = 70;
  private characterHeight: number = 100;
  private frameCounter = 10;
  private currentFrame = 10;
  private radius = 20;
  private speed = 3.5;
  private firing = false;
  private bullets: Bullet[] = [];
  private characterImage: HTMLImageElement = new Image();
  private position = {
    x: (GameContext.context.canvas.width - this.characterWidth) / 2,
    y: GameContext.context.canvas.height * 0.75 - this.characterHeight
  };

  constructor() {
    const { context } = GameContext;
    const { width, height } = context.canvas;
    this.characterImage.src = spritesheet;
    this.time = new Date().getTime();
    this.healthBar = new HP(this.position, this.health, this.radius);
  }

  //updates current mouse coordinates on screen
  public mouseMoveHandler = event => {
    this.aim.x = event.offsetX;
    this.aim.y = event.offsetY;
  };
  public keydownHandler = (key: string) => {
    switch (key) {
      case "d":
        this.direction.x = 1;
        this.moving = true;
        break;
      case "a":
        this.direction.x = -1;
        this.moving = true;
        break;
      case "w":
        this.direction.y = -1;
        this.moving = true;
        break;
      case "s":
        this.direction.y = 1;
        this.moving = true;
        break;
      case "f":
        this.firing = true;
        break;
    }
  };

  public updateDamage(multiplier) {
    this.damage *= 1 * multiplier;
  }

  public keyupHandler = (key: string) => {
    if (
      (key === "d" && this.direction.x === 1) ||
      (key === "a" && this.direction.x === -1)
    ) {
      this.moving = false;
      this.direction.x = 0;
    }
    if (key === "f") this.firing = false;
    if (
      (key === "w" && this.direction.y === -1) ||
      (key === "s" && this.direction.y === 1)
    ) {
      this.moving = false;
      this.direction.y = 0;
    }
  };

  // returns characters health
  public isDead = () => {
    if (this.health <= 0) return true;
    else return false;
  };

  //pops next bullet to be fired from local array
  public nextBullet = () => {
    return this.bullets.pop();
  };

  //checks if any bullets in array
  public anyBullets = () => {
    return this.bullets.length > 0;
  };

  //
  public fire = () => {
    //waits n seconds before firing a bullet (based on fire rate)
    if ((this.time - this.lastFired) / 1000 >= 1 / this.fireRate) {
      this.bullets.push(
        new Bullet(
          Date.now() + this.aim.y,
          {
            x: this.position.x,
            y: this.position.y
          },
          { x: this.aim.x, y: this.aim.y },
          10,
          10,
          this.damage
        )
      );
      this.lastFired = new Date().getTime(); //update last time a shot was fired
    }
  };

  public moveLogic = xPos => {
    this.position.x = this.position.x + this.speed * this.direction.x;

    this.position.y += this.direction.y * this.speed;
  };

  public update = () => {
    //updates the health bar
    this.healthBar.updateHealth(this.health);
    this.healthBar.update();
    this.time = new Date().getTime();
    const { context } = GameContext;

    const { width, height } = context.canvas;
    let { x, y } = this.position;
    if (this.firing) {
      //add bullets to array while firing = true
      this.fire();
    }
    // this.jumpLogic(width, height, yPos);
    this.moveLogic(x);

    if (this.moving) {
      if (this.frameCounter % 8 === 0)
        this.currentFrame = ((this.currentFrame + 1) % 7) + 8;
    } else {
      if (this.frameCounter % 15 === 0)
        this.currentFrame = (this.currentFrame + 1) % 9;
    }

    this.frameCounter += 1;
  };

  public updateHealth = damage => {
    this.health -= damage;
  };

  public getPosition = () => {
    return {
      x: this.position.x,
      y: this.position.y,
      radius: this.radius
    };
  };

  public render = () => {
    const { context } = GameContext;
    let { x, y } = this.position;
    const paddingY = 2;
    const paddingX = 12;
    const spriteHeight = 35;
    const spriteWidth = 20;

    context.save();

    context.beginPath();

    this.healthBar.render(); //render health bar
    context.drawImage(
      this.characterImage,
      this.currentFrame * (spriteWidth + paddingX),
      paddingY,
      spriteWidth,
      spriteHeight,
      x - 47.5,
      y - 30,
      this.characterWidth,
      this.characterHeight
    );

    context.fillStyle = "red";
    // context.arc(x, y, this.radius, 0, 2 * Math.PI);

    context.fill();
    context.closePath();
    context.restore();
  };
}

export default Character;

// public jumpLogic = (width, height, yPos) => {
//   if (yPos < height - 50 && !this.jumping) {
//     this.position[1] += this.gravity;
//   } else if (this.jumping) {
//     this.position[1] -= this.gravity;
//     if (this.position[1] <= height - 150) this.jumping = false;
//   }
// };
