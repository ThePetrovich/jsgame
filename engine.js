var mainCanvas = document.getElementById('cnv');
var mainContext = mainCanvas.getContext('2d');

class engine_gameSprite {
    constructor(imageSrc, width, height, offsetX, offsetY) {
        this.image = new Image(width, height);
        this.image.src = imageSrc;

        this.offsetX = offsetX;
        this.offsetY = offsetY;

        this.rotation = 0;
    }

    draw(renderContext) {
        renderContext.drawImage(this.image, this.offsetX, this.offsetY);
    }
}

class engine_gameObject {
    constructor(width, height, gs) {
        this.renderCanvas = document.createElement('canvas');
        this.sprites = [];
        
        this.posX = 0;
        this.posY = 0;

        this.renderCanvas.width = width;
        this.renderCanvas.height = height;
        this.renderContext = this.renderCanvas.getContext('2d');

        this.doUpdate = null;

        gs.regObject(this);
    }

    addSprite(sprite) {
        this.sprites.push(sprite);
    }

    render() {
        if (this.doUpdate) this.doUpdate();
        for (let i = 0; i < this.sprites.length; i++) {
            this.sprites[i].draw(this.renderContext);
        }

        mainContext.drawImage(this.renderCanvas, this.posX, this.posY);
    }
}

class engine_gameState {
    constructor() {
        this.objects = [];
        this.tickInterval = null;
    }

    regObject(object) {
        this.objects.push(object);
    }

    run() {
        for (let i = 0; i < this.objects.length; i++) {
            this.objects[i].render();
        }
        this.tickInterval = setTimeout(this.run.bind(this), 10);
    }
}
