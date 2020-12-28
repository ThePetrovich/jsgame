var mainCanvas = document.getElementById('cnv');
var mainContext = mainCanvas.getContext('2d');

mainContext.font = '32px Arial';

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
        renderContext.save();

        renderContext.translate(this.image.width/2 + this.offsetX,this.image.height/2 + this.offsetY);
        renderContext.rotate(this.rotation*Math.PI/180);
        renderContext.drawImage(this.image, -this.image.width/2, -this.image.height/2);

        renderContext.restore();
    }
}

class engine_gameObject {
    constructor(width, height, gs) {
        this.renderCanvas = document.createElement('canvas');
        this.sprites = [];
        
        this.posX = 0;
        this.posY = 0;

        this.width = width;
        this.height = height;

        this.renderCanvas.width = width;
        this.renderCanvas.height = height;
        this.renderContext = this.renderCanvas.getContext('2d');

        this.doUpdate = null;

        this.removePos = gs.regObject(this);

        this.gone = false;
    }

    addSprite(sprite) {
        this.sprites.push(sprite);
    }

    render() {
        this.renderContext.clearRect(0,0,this.width,this.height);
        if (this.doUpdate) this.doUpdate();
        for (let i = 0; i < this.sprites.length; i++) {
            this.sprites[i].draw(this.renderContext);
        }

        mainContext.drawImage(this.renderCanvas, this.posX - this.width/2, this.posY - this.height/2);
    }
}

class engine_UIObject {
    constructor(gs, posX, posY) {
        this.sprites = [];
        
        this.posX = posX;
        this.posY = posY;

        this.doUpdate = null;

        gs.regObjectUI(this);
    }

    addSprite(sprite) {
        this.sprites.push(sprite);
    }

    render() {
        if (this.doUpdate) this.doUpdate();

        for (let i = 0; i < this.sprites.length; i++) {
            this.sprites[i].draw(mainContext);
        }
    }
}

class engine_gameState {
    constructor() {
        this.objects = [];
        this.uiobjects = [];
        this.tickInterval = null;
        this.background = new Image(playAreaWidth, playAreaWidth);
        this.background.src = "background.png";
    }

    regObject(object) {
        this.objects.push(object);
        return this.objects.length - 1;
    }

    regObjectUI(object) {
        this.uiobjects.push(object);
        return this.uiobjects.length - 1;
    }

    untrackObject(pos) {
        this.objects.splice(pos, 1); 
    }

    untrackObjectUI(pos) {
        this.uiobjects.splice(pos, 1); 
    }

    run() {
        mainContext.drawImage(this.background, 0, 0);
        for (let i = 0; i < this.objects.length; i++) {
            if (!this.objects[i].gone) {
                this.objects[i].render();
            }
            else {
                //console.log("destroying object: ");
                //console.log(this.objects[i]);
                delete this.objects[i];
                this.untrackObject(i);
            }
            
        }

        for (let i = 0; i < this.uiobjects.length; i++) {
            this.uiobjects[i].render();
        }
        this.tickInterval = setTimeout(this.run.bind(this), 10);
    }
}

