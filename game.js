var gameState = new engine_gameState();

let bulletSprite = new engine_gameSprite("bullet.png", 20, 20, 0, 0);

class bullet extends engine_gameObject {
    constructor(posX, posY, speedX, speedY) {
        super(20, 20, gameState);

        console.log("bullet created");
        this.doUpdate = this.update;

        this.posX = posX;
        this.posY = posY;

        this.speedX = speedX;
        this.speedY = speedY;

        this.distanceToCenter = 0
        this.angleToCenter = 0;
    }

    checkCollision(target) {
        if (target.posX + target.width/3 >= this.posX &&    // r1 right edge past r2 left
            target.posX <= this.posX + this.width/3 &&    // r1 left edge past r2 right
            target.posY + target.height/3 >= this.posY &&    // r1 top edge past r2 bottom
            target.posY <= this.posY + this.height/3) {    // r1 bottom edge past r2 top
              return true;
        }
        else return false;
    }

    update() {
        this.posX += this.speedX;
        this.posY += this.speedY;

        this.distanceToCenter = Math.sqrt((this.posX - playAreaWidth/2)**2 + (this.posY - playAreaHeight/2)**2);
        this.angleToCenter = Math.atan2((playAreaWidth/2 - this.posY), (playAreaHeight/2 - this.posX));

        this.speedX += 1/this.distanceToCenter * 3 * Math.cos(this.angleToCenter);
        this.speedY += 1/this.distanceToCenter * 3 * Math.sin(this.angleToCenter);
    }
}

class spaceship extends engine_gameObject {
    constructor(width, height, gs, _keyset) {
        super(width, height, gs);
        this.doUpdate = this.update;

        this.speedX = 0;
        this.speedY = 0;

        this.distanceToCenter = 0
        this.angleToCenter = 0;

        this.keyset = _keyset;

        this.bullets = [];
        this.enemy = null;

        this.cooldown = 0;

        this.score = 0;
    }

    shoot() {
        let bullet1 = new bullet(this.posX + 5, this.posY + 5, this.speedX + -7 * Math.cos((90 + this.sprites[0].rotation)*Math.PI/180), this.speedY + -7 * Math.sin((90 + this.sprites[0].rotation)*Math.PI/180));
        bullet1.addSprite(bulletSprite);
        this.bullets.push(bullet1);
    }

    update() {
        if (pKeys[this.keyset[1]]) {
            this.speedX -= 0.02 * Math.cos((90 + this.sprites[0].rotation)*Math.PI/180);
            this.speedY -= 0.02 * Math.sin((90 + this.sprites[0].rotation)*Math.PI/180);
        }
        if (pKeys[this.keyset[0]]) {
            if (!this.cooldown) {
                this.shoot();
                this.cooldown = 50;
            }
        }
        if (pKeys[this.keyset[2]]) this.sprites[0].rotation -= 2;
        if (pKeys[this.keyset[3]]) this.sprites[0].rotation += 2;

        this.posX += this.speedX;
        this.posY += this.speedY;

        this.distanceToCenter = Math.sqrt((this.posX - playAreaWidth/2)**2 + (this.posY - playAreaHeight/2)**2);
        this.angleToCenter = Math.atan2((playAreaWidth/2 - this.posY), (playAreaHeight/2 - this.posX));

        this.speedX += 1/this.distanceToCenter * 3 * Math.cos(this.angleToCenter);
        this.speedY += 1/this.distanceToCenter * 3 * Math.sin(this.angleToCenter);

        for (let i = 0; i < this.bullets.length; i++) {
            let bulletVibeCheck = false;
            if (this.bullets[i].checkCollision(this.enemy)) {
                console.log("bruh! someone hit something damn");

                bulletVibeCheck = true;

                this.score++;
            }

           // if (!bulletVibeCheck && (this.bullets[i].posX > playAreaWidth|| this.bullets[i].posX < 0 || this.bullets[i].posY > playAreaHeight || this.bullets[i].posY < 0)) {
           //     console.log("bruh! bullet out of bounds");

            //    bulletVibeCheck = true;
            //}

            if (bulletVibeCheck) {
                gameState.untrackObject(this.bullets[i].removePos);
                delete this.bullets[i];
                this.bullets.splice(i, 1);
            }
        }
        if (this.cooldown) this.cooldown--;
    }
}

class scoreCounter extends engine_UIObject {
    constructor(gs, posX, posY, scoreTrack, text) {
        super(gs, posX, posY);
        this.doUpdate = this.update;

        this.text = text;
        this.scoreTrack = scoreTrack;
    }

    update() {
        mainContext.fillStyle = "#ffffff";
        mainContext.fillText(this.text + String(this.scoreTrack.score), this.posX, this.posY);
        mainContext.fillStyle = "#000000";
    }
}

let spaceShipOne = new spaceship(70, 70, gameState, [0, 1, 2, 3]);
let spaceShipTwo = new spaceship(70, 70, gameState, [4, 5, 6, 7]);

let score1 = new scoreCounter(gameState, 50, 50, spaceShipOne, 'Player 1 score: ');
let score2 = new scoreCounter(gameState, playAreaWidth/2, 50, spaceShipTwo, 'Player 2 score: ');

spaceShipOne.enemy = spaceShipTwo;
spaceShipTwo.enemy = spaceShipOne;

spaceShipOne.posX = playAreaWidth/2;
spaceShipOne.posY = 200;
spaceShipOne.speedX = 2;

spaceShipTwo.posX = playAreaWidth/2;
spaceShipTwo.posY = playAreaHeight - 200;
spaceShipTwo.speedX = -2;

let rocketSprite1 = new engine_gameSprite("rocket.png", 30, 30, 20, 20);
let rocketSprite2 = new engine_gameSprite("rocket_green.png", 30, 30, 20, 20);

spaceShipOne.addSprite(rocketSprite1);
spaceShipTwo.addSprite(rocketSprite2);

gameState.run();