var gameState = new engine_gameState();

class spaceship extends engine_gameObject {
    constructor(width, height, gs, _keyset) {
        super(width, height, gs);
        this.doUpdate = this.update;

        this.speedX = 0;
        this.speedY = 0;

        this.distanceToCenter = 0
        this.angleToCenter = 0;

        this.keyset = _keyset;
    }
    update() {
        if (pKeys[this.keyset[0]]) {
            this.speedX += 0.02 * Math.cos((90 + this.sprites[0].rotation)*Math.PI/180);
            this.speedY += 0.02 * Math.sin((90 + this.sprites[0].rotation)*Math.PI/180);
        }
        if (pKeys[this.keyset[1]]) {
            this.speedX -= 0.02 * Math.cos((90 + this.sprites[0].rotation)*Math.PI/180);
            this.speedY -= 0.02 * Math.sin((90 + this.sprites[0].rotation)*Math.PI/180);
        }
        if (pKeys[this.keyset[2]]) this.sprites[0].rotation -= 2;
        if (pKeys[this.keyset[3]]) this.sprites[0].rotation += 2;

        this.posX += this.speedX;
        this.posY += this.speedY;

        this.distanceToCenter = Math.sqrt((this.posX - playAreaWidth/2)**2 + (this.posY - playAreaHeight/2)**2);
        this.angleToCenter = Math.atan2((playAreaWidth/2 - this.posY), (playAreaHeight/2 - this.posX));

        this.speedX += 1/this.distanceToCenter * 3 * Math.cos(this.angleToCenter);
        this.speedY += 1/this.distanceToCenter * 3 * Math.sin(this.angleToCenter);
    }
}

let testObject = new spaceship(200, 200, gameState, [0, 1, 2, 3]);
let testObject2 = new spaceship(200, 200, gameState, [4, 5, 6, 7]);
testObject2.posX = 200;
testObject2.posY = 200;
let testSprite1 = new engine_gameSprite("rocket.png", 20, 33, 100, 100);
let testSprite2 = new engine_gameSprite("rocket.png", 20, 33, 100, 100);

testObject.addSprite(testSprite1);
testObject2.addSprite(testSprite2);

gameState.run();