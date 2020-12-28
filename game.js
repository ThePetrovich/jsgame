var gameState = new engine_gameState();

let testObject = new engine_gameObject(400, 400, gameState);
let testSprite1 = new engine_gameSprite("https://vignette.wikia.nocookie.net/spritechronicles/images/e/e4/Wiki_mario_icon.jpg", 200, 200, 0, 0);

testObject.addSprite(testSprite1);

gameState.run();