var gameState = new engine_gameState();

var rocketSprite1 = new engine_gameSprite("rocket.png", 30, 30, 20, 20);
var rocketSprite2 = new engine_gameSprite("rocket_green.png", 30, 30, 20, 20);
var starSprite = new engine_gameSprite("there-was-an-attempt.png", 300, 300, 135, 165);
var legendarySprite = new engine_gameSprite("legend.png", 453, 453, 0, 0);
var ghSprite = new engine_gameSprite("gh.png", 100, 100, 0, 0);
var bulletSprite = new engine_gameSprite("bullet.png", 20, 20, 0, 0);
var engineSprite = new engine_gameSprite("fire.png", 20, 20, 0, 0);
var engineSprite1 = new engine_gameSprite("fire2.png", 10, 10, 0, 0);
var trailSprite = new engine_gameSprite("shiptrail.png", 20, 20, 0, 0);

let deathSound = new Audio("bruh.mp3");
let shootSound = new Audio("laser.mp3");
let explodeSound = new Audio("baba-booey.mp3");

function randN(min, max) {  
    return Math.floor(Math.random() * (max - min) + min); 
}

function util_bigExplosion(x, y) {
    for (let i = 0; i < 20; i++) {
        let fireeff = new particle(x, y, randN(-5,4), randN(-5,4), randN(4,20));
        fireeff.addSprite(engineSprite);

        let fireeff1 = new particle(x, y, randN(-5,4), randN(-5,4), randN(4,20));
        fireeff1.addSprite(bulletSprite);
    }
}

function util_smallExplosion(x, y) {
    for (let i = 0; i < 5; i++) {
        let fireeff = new particle(x, y, randN(-5,4), randN(-5,4), randN(1,5));
        fireeff.addSprite(engineSprite);

        let fireeff1 = new particle(x, y, randN(-5,4), randN(-5,4), randN(1,5));
        fireeff1.addSprite(bulletSprite);
    }
}

function util_checkCollision(obj1, obj2) {
    if (obj1.posX + obj1.width/3 >= obj2.posX &&    // r1 right edge past r2 left
        obj1.posX <= obj2.posX + obj2.width/3 &&    // r1 left edge past r2 right
        obj1.posY + obj1.height/3 >= obj2.posY &&    // r1 top edge past r2 bottom
        obj1.posY <= obj2.posY + obj2.height/3) {    // r1 bottom edge past r2 top
          return true;
    }
    else return false;
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

        this.trailCooldown = 0;
    }
    
    explode() {
        if (this.posX <= playAreaWidth && this.posX >= 0 && this.posY <= playAreaHeight && this.posY >= 0) {
            explodeSound.play();
            util_smallExplosion(this.posX, this.posY);
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
            let deathFromStar = util_checkCollision(star, this);
            let deathFromP1 = util_checkCollision(spaceShipOne, this);
            let deathFromP2 = util_checkCollision(spaceShipTwo, this);

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
            if (!this.trailCooldown) {
                let fireeff = new particle(this.posX + 1, this.posY + 1, 0, 0, Math.floor(25 * 1/Math.sqrt(this.speedX**2 + this.speedY**2)) + randN(5,8));
                fireeff.addSprite(engineSprite1);
                this.trailCooldown = Math.floor(8 * 1/Math.sqrt(this.speedX**2 + this.speedY**2));
            }

            if (this.trailCooldown) this.trailCooldown--;
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
        this.trailCooldown = 0;

        this.score = 0;
    }

    respawn() {
        deathSound.play();
        util_bigExplosion(this.posX, this.posY);
        this.speedX = this.speedXstart;
        this.speedY = this.speedYstart;
        this.posX = this.posXstart;
        this.posY = this.posYstart;
    }

    shoot() {
        shootSound.play();
        let bullet1 = new bullet(this.posX + 5, this.posY + 5, this.speedX + -2.5 * Math.cos((90 + this.sprites[0].rotation)*Math.PI/180), this.speedY + -2.5 * Math.sin((90 + this.sprites[0].rotation)*Math.PI/180));
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

    drawTrail() {
        let fireeff = new particle(this.posX + 7 + 15 * Math.cos((90 + this.sprites[0].rotation)*Math.PI/180), this.posY + 7 + 15 * Math.sin((90 + this.sprites[0].rotation)*Math.PI/180), 0, 0, 500);
        fireeff.addSprite(trailSprite);
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

        if (util_checkCollision(star, this)) {
            this.respawn();
            console.log('a ship has crashed into the star in lego city!');
        }

        if (this.posX > playAreaWidth + 100 || this.posX < -100 || this.posY > playAreaHeight + 100 || this.posY < -100) {
            this.respawn();
        }

       // if (!this.trailCooldown) {
       //     this.drawTrail();
       //     this.trailCooldown = Math.floor(25 * 1/Math.sqrt(this.speedX**2 + this.speedY**2));
       // }

        if (this.cooldown) this.cooldown--;
        if (this.fireCooldown) this.fireCooldown--;
        if (this.trailCooldown) this.trailCooldown--;
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

class perfmonintor extends engine_UIObject {
    constructor(gs, posX, posY) {
        super(gs, posX, posY);
        this.doUpdate = this.update;

        this.ticks = 0;
        this.score = 0;
        this.timer = setInterval( this.updateCounter.bind(this), 1000 );
    }

    updateCounter() {
        this.score = this.ticks; 
        this.ticks = 0;
    }

    update() {
        this.ticks++;
    }
}

var spaceShipOne = new spaceship(70, 70, gameState, [0, 1, 2, 3], playAreaWidth/2, 200, 1, 0);
var spaceShipTwo = new spaceship(70, 70, gameState, [4, 5, 6, 7], playAreaWidth/2, playAreaHeight - 200, -1, 0);
var star = new engine_gameObject(500,500, gameState);
var legendaryObj = new engine_gameObject(500,500, gameState); 

var score1 = new scoreCounter(gameState, 50, 50, spaceShipOne, 'Player 1 score: ');
var score2 = new scoreCounter(gameState, playAreaWidth/2, 50, spaceShipTwo, 'Player 2 score: ');
var perfmon = new perfmonintor(gameState, 0, 0);
var fps = new scoreCounter(gameState, 50, playAreaHeight - 50, perfmon, 'TPS: ');

var idkfaTick = 0;

function gameInit() {
    star.addSprite(starSprite);
    star.posX = playAreaWidth/2 - 50;
    star.posY = playAreaHeight/2 - 100;

    gameState.untrackObject(legendaryObj.removePos);
    legendaryObj.addSprite(legendarySprite);
    legendaryObj.posX = playAreaWidth/2 - 50;
    legendaryObj.posY = playAreaHeight/2 - 100;

    spaceShipOne.addSprite(rocketSprite1);
    spaceShipTwo.addSprite(rocketSprite2);

    gameState.run();
}

function easterEgg() {
    gameState.regObject(legendaryObj);
    if (idkfaTick % 20 == 0) {
        for (let i = 0; i < 360; i += 10) {
            let bullet1 = new bullet(300, 250, 5 * Math.cos((i)*Math.PI/180), 5 * Math.sin((i)*Math.PI/180));
            bullet1.addSprite(ghSprite);
        }   
    }

    idkfaTick++;
}

gameInit();