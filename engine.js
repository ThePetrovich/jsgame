var mainCanvas = document.getElementById('cnv');
var mainContext = mainCanvas.getContext('2d');

const playAreaWidth = 900;
const playAreaHeight = 900;

var pKeys = [false, false, false, false, false, false, false, false];

window.addEventListener("keydown", function (event) {
        if (event.defaultPrevented) {
        return;
        }
    
        switch (event.key) {
        case "ArrowDown":
            pKeys[0] = true;
            break;
        case "ArrowUp":
            pKeys[1] = true;
            break;
        case "ArrowLeft":
            pKeys[2] = true;
            break;
        case "ArrowRight":
            pKeys[3] = true;
            break;
        case "s":
            pKeys[4] = true;
            break;
        case "w":
            pKeys[5] = true;
            break;
        case "a":
            pKeys[6] = true;
            break;
        case "d":
            pKeys[7] = true;
            break;
        default:
            return;
        }
    event.preventDefault();
  }, true);

window.addEventListener("keyup", function (event) {
    if (event.defaultPrevented) {
      return;
    }
  
    switch (event.key) {
    case "ArrowDown":
        pKeys[0] = false;
        break;
    case "ArrowUp":
        pKeys[1] = false;
        break;
    case "ArrowLeft":
        pKeys[2] = false;
        break;
    case "ArrowRight":
        pKeys[3] = false;
        break;
    case "s":
        pKeys[4] = false;
        break;
    case "w":
        pKeys[5] = false;
        break;
    case "a":
        pKeys[6] = false;
        break;
    case "d":
        pKeys[7] = false;
        break;
    default:
        return;
    }
    event.preventDefault();
  }, true);

class engine_gameSprite {
    constructor(imageSrc, width, height, offsetX, offsetY) {
        this.image = new Image(width, height);
        this.image.src = imageSrc;

        this.offsetX = offsetX;
        this.offsetY = offsetY;

        this.rotation = 0;

        //this.needToRedraw = 1;
    }

    draw(renderContext) {
        //if (this.needToRedraw) {
            renderContext.save();

            renderContext.translate(this.image.width/2 + this.offsetX,this.image.height/2 + this.offsetY);

            renderContext.rotate(this.rotation*Math.PI/180);

            renderContext.drawImage(this.image, -this.image.width/2, -this.image.height/2);

           // this.needToRedraw = 0;
           renderContext.restore();
       // }
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
        this.renderContext.clearRect(0,0,this.renderCanvas.width,this.renderCanvas.height);
        if (this.doUpdate) this.doUpdate();
        for (let i = 0; i < this.sprites.length; i++) {
            this.sprites[i].draw(this.renderContext);
        }

        mainContext.drawImage(this.renderCanvas, this.posX - this.renderCanvas.width/2, this.posY - this.renderCanvas.height/2);
    }
}

class engine_gameState {
    constructor() {
        this.objects = [];
        this.tickInterval = null;
        mainContext.rect(0,0,playAreaWidth,playAreaHeight);
    }

    regObject(object) {
        this.objects.push(object);
    }

    run() {
        mainContext.fill();
        for (let i = 0; i < this.objects.length; i++) {
            this.objects[i].render();
        }
        this.tickInterval = setTimeout(this.run.bind(this), 10);
    }
}
