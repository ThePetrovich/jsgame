var gameState = new engine_gameState();

let bulletSprite = new engine_gameSprite("bullet.png", 20, 20, 0, 0);
let engineSprite = new engine_gameSprite("fire.png", 20, 20, 0, 0);
let engineSprite1 = new engine_gameSprite("fire2.png", 10, 10, 0, 0);

let deathSound = new Audio("bruh.mp3");
let shootSound = new Audio("laser.mp3");
let explodeSound = new Audio("baba-booey.mp3");

function randN(min, max) {  
    return Math.floor(Math.random() * (max - min) + min); 
}

class bullet extends engine_gameObject {
    constructor(posX, posY, speedX, speedY, owner) {
        super(20, 20, gameState);

        console.log("bullet created");
        this.doUpdate = this.update;

        this.owner = owner;

        this.posX = posX;
        this.posY = posY;

        this.speedX = speedX;
        this.speedY = speedY;

        this.distanceToCenter = 0
        this.angleToCenter = 0;

        this.timeToLive = 500;
        this.gone = false;
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
    
    explode() {
        if (this.posX <= playAreaWidth && this.posX >= 0 && this.posY <= playAreaHeight && this.posY >= 0) {
            explodeSound.play();
        }
        
        for (let i = 0; i < 5; i++) {
            let fireeff = new particle(this.posX, this.posY, randN(-5,4), randN(-5,4), randN(1,5));
            fireeff.addSprite(engineSprite);

            let fireeff1 = new particle(this.posX, this.posY, randN(-5,4), randN(-5,4), randN(1,5));
            fireeff1.addSprite(bulletSprite);
        }
    }

    update() {
        this.posX += this.speedX;
        this.posY += this.speedY;

        this.distanceToCenter = Math.sqrt((this.posX - playAreaWidth/2)**2 + (this.posY - playAreaHeight/2)**2);
        this.angleToCenter = Math.atan2((playAreaWidth/2 - this.posY), (playAreaHeight/2 - this.posX));

        this.speedX += 1/this.distanceToCenter * 2 * Math.cos(this.angleToCenter);
        this.speedY += 1/this.distanceToCenter * 2 * Math.sin(this.angleToCenter);

        if (!this.timeToLive) {
            this.gone = true;
            this.explode();
        }
        else {
            this.timeToLive--;
        }

        if (!this.gone) {
            let deathFromStar = this.checkCollision(star);
            let deathFromP1 = this.checkCollision(spaceShipOne);
            let deathFromP2 = this.checkCollision(spaceShipTwo);

            if ((deathFromStar || deathFromP1 || deathFromP2) && this.timeToLive < 480) {
                this.gone = true;
                this.explode();

                if (deathFromP1) {
                    spaceShipTwo.score++;
                    spaceShipOne.respawn();
                }
                else if (deathFromP2) {
                    spaceShipOne.score++;
                    spaceShipTwo.respawn();
                }
                console.log('bullet hit something');
            }
            if (this.timeToLive % 3 == 0) {
                let fireeff = new particle(this.posX + 1, this.posY + 1, 0, 0, 10 + randN(1,8));
                fireeff.addSprite(engineSprite1);
            }
        }
    }
}

class particle extends engine_gameObject {
    constructor(posX, posY, speedX, speedY, ttl) {
        super(20, 20, gameState);
        this.doUpdate = this.update;

        this.posX = posX;
        this.posY = posY;

        this.speedX = speedX;
        this.speedY = speedY;

        this.timeToLive = ttl;
        this.gone = false;
    }

    update() {
        this.posX += this.speedX;
        this.posY += this.speedY;

        if (!this.timeToLive) {
            this.gone = true;
        }
        else {
            this.timeToLive--;
        }
    }
}

class spaceship extends engine_gameObject {
    constructor(width, height, gs, _keyset, posX, posY, speedX, speedY) {
        super(width, height, gs);
        this.doUpdate = this.update;

        this.posXstart = posX;
        this.posYstart = posY;
        this.speedXstart = speedX;
        this.speedYstart = speedY;

        this.speedX = this.speedXstart;
        this.speedY = this.speedYstart;
        this.posX = this.posXstart;
        this.posY = this.posYstart;

        this.distanceToCenter = 0
        this.angleToCenter = 0;

        this.keyset = _keyset;

        this.cooldown = 0;
        this.fireCooldown = 0;

        this.score = 0;
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

    respawn() {
        deathSound.play();
        for (let i = 0; i < 20; i++) {
            let fireeff = new particle(this.posX, this.posY, randN(-5,4), randN(-5,4), randN(4,20));
            fireeff.addSprite(engineSprite);

            let fireeff1 = new particle(this.posX, this.posY, randN(-5,4), randN(-5,4), randN(4,20));
            fireeff1.addSprite(bulletSprite);
        }
        this.speedX = this.speedXstart;
        this.speedY = this.speedYstart;
        this.posX = this.posXstart;
        this.posY = this.posYstart;
    }

    shoot() {
        shootSound.play();
        let bullet1 = new bullet(this.posX + 5, this.posY + 5, this.speedX + -3 * Math.cos((90 + this.sprites[0].rotation)*Math.PI/180), this.speedY + -3 * Math.sin((90 + this.sprites[0].rotation)*Math.PI/180));
        bullet1.addSprite(bulletSprite);
    }

    fireEngine() {
        let fireeff = new particle(this.posX + 7 + 15 * Math.cos((90 + this.sprites[0].rotation)*Math.PI/180), this.posY + 7 + 15 * Math.sin((90 + this.sprites[0].rotation)*Math.PI/180), this.speedX + 2 * Math.cos((randN(80,100) + this.sprites[0].rotation)*Math.PI/180), this.speedY + 2 * Math.sin((randN(80,100) + this.sprites[0].rotation)*Math.PI/180), 10 + randN(1,8));
        if (randN(1,10) < 7) {
            fireeff.addSprite(engineSprite)
        }
        else {
            fireeff.addSprite(bulletSprite)
        }
    }

    update() {
        if (pKeys[this.keyset[1]]) {
            if (!this.fireCooldown) {
                this.fireEngine();
                this.fireCooldown = 4;
            }
            this.speedX -= 0.005 * Math.cos((90 + this.sprites[0].rotation)*Math.PI/180);
            this.speedY -= 0.005 * Math.sin((90 + this.sprites[0].rotation)*Math.PI/180);
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

        this.speedX += 1/this.distanceToCenter * 1 * Math.cos(this.angleToCenter);
        this.speedY += 1/this.distanceToCenter * 1 * Math.sin(this.angleToCenter);

        if (this.checkCollision(star)) {
            this.respawn();
            console.log('a ship has crashed into the star in lego city!');
        }

        if (this.posX > playAreaWidth + 100 || this.posX < -100 || this.posY > playAreaHeight + 100 || this.posY < -100) {
            this.respawn();
        }

        if (this.cooldown) this.cooldown--;
        if (this.fireCooldown) this.fireCooldown--;
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

var spaceShipOne = new spaceship(70, 70, gameState, [0, 1, 2, 3], playAreaWidth/2, 200, 1, 0);
var spaceShipTwo = new spaceship(70, 70, gameState, [4, 5, 6, 7], playAreaWidth/2, playAreaHeight - 200, -1, 0);

var star = new engine_gameObject(500,500, gameState);

star.posX = playAreaWidth/2 - 50;
star.posY = playAreaHeight/2 - 100;

var score1 = new scoreCounter(gameState, 50, 50, spaceShipOne, 'Player 1 score: ');
var score2 = new scoreCounter(gameState, playAreaWidth/2, 50, spaceShipTwo, 'Player 2 score: ');

var rocketSprite1 = new engine_gameSprite("rocket.png", 30, 30, 20, 20);
var rocketSprite2 = new engine_gameSprite("rocket_green.png", 30, 30, 20, 20);

var starSprite = new engine_gameSprite("there-was-an-attempt.png", 300, 300, 135, 165);

spaceShipOne.addSprite(rocketSprite1);
spaceShipTwo.addSprite(rocketSprite2);
star.addSprite(starSprite);

gameState.run();