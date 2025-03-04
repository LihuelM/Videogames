const canvas = document.querySelector('#game');
const game = canvas.getContext('2d');
const btnUp = document.querySelector('#up');
const btnLeft = document.querySelector('#left');
const btnRight = document.querySelector('#right');
const btnDown = document.querySelector('#down');
const spanLives = document.querySelector('#lives');
const spanTime = document.querySelector('#time');
const spanRecord = document.querySelector('#record');
const pResult = document.querySelector('#result');
const reset_button = document.querySelector('#reset_button');

let canvasSize;
let elementsSize;
let level = 0;
let lives = 3;

let timeStart;
let timePlayer;
let timeInterval;

const playerPosition = {
    x: undefined,
    y: undefined,
};
const giftPosition = {
    x: undefined,
    y: undefined,
};
let enemyPositions = [];

window.addEventListener('load', setCanvasSize);
window.addEventListener('resize', setCanvasSize);

function fixNumber(n) {
    return Number(n.toFixed(2));
}

function setCanvasSize() {
    if (window.innerHeight > window.innerWidth) {
        canvasSize = window.innerWidth * 0.7;
    } else {
        canvasSize = window.innerHeight * 0.7;
    }

    canvasSize = Number(canvasSize.toFixed(0));

    canvas.setAttribute('width', canvasSize);
    canvas.setAttribute('height', canvasSize);

    elementsSize = Number((canvasSize / 10).toFixed(0));

    playerPosition.x = undefined;
    playerPosition.y = undefined;
    startGame();
}

function startGame() {
    console.log({ canvasSize, elementsSize });
    console.log(window.innerWidth, window.innerHeight);

    game.font = `${elementsSize}px Verdana`;
    game.textAlign = 'end';

    const map = maps[level];
    if (!map) {
        gameWin();
        return;
    }

    if (!timeStart) {
        timeStart = Date.now();
        timeInterval = setInterval(showTime, 100);
        showRecord();
    }

    const mapRows = map.trim().split('\n');
    const mapRowCols = mapRows.map(row => row.trim().split(''));
    console.log({map, mapRows, mapRowCols});

    showLives();

    enemyPositions = [];
    game.clearRect(0, 0, canvasSize, canvasSize);

    mapRowCols.forEach((row, rowI) => {
        row.forEach((col, colI) => {
            const emoji = emojis[col];
            const posX = elementsSize * (colI + 1);
            const posY = elementsSize * (rowI + 1);

            if (col == 'O') {
                if (!playerPosition.x && !playerPosition.y) {
                    playerPosition.x = posX;
                    playerPosition.y = posY;
                    // console.log({playerPosition});
                }
            } else if (col == 'I') {
                giftPosition.x = posX;
                giftPosition.y = posY;
            } else if(col == 'X') {
                enemyPositions.push({
                    x: posX,
                    y: posY,
                })
            }

            game.fillText(emoji, posX, posY);
        });
    });

    movePlayer();
}

function movePlayer() {
    const giftCollisionX = playerPosition.x.toFixed(3) == giftPosition.x.toFixed(3);
    const giftCollisionY = playerPosition.y.toFixed(3) == giftPosition.y.toFixed(3);
    const giftCollision = giftCollisionX && giftCollisionY;

    if (giftCollision) {
    levelWin();
}

const enemyCollision = enemyPositions.find(enemy => {
    const enemyCollisionX = enemy.x.toFixed(3) == playerPosition.x.toFixed(3);
    const enemyCollisionY = enemy.y.toFixed(3) == playerPosition.y.toFixed(3);
    return enemyCollisionX && enemyCollisionY;
});

    if (enemyCollision) {
    // console.log('Chocaste contra un enemigo :(');
    showCollision();
    setTimeout(levelLost, 2000);
}

    game.fillText(emojis['PLAYER'], playerPosition.x.toFixed(3), playerPosition.y);
}

function levelWin() {
    console.log('subiste de nivel!');
    level ++;
    startGame();
}

function levelLost() {
    lives --;

    if (lives <= 0) {
        level = 0;
        lives = 3;
        timeStart = undefined;
    }

    playerPosition.x = undefined;
    playerPosition.y = undefined;
    startGame();
}

function showCollision() {
    game.clearRect(0, 0, canvasSize, canvasSize);
    game.font = '15px Quicksand';
    game.textAlign = 'center';
    game.fillStyle = "white"
    if(lives > 1) {
        game.fillText('PERDISTE UNA VIDA 😲 VUELVE A INTENTARLO! 💪🏽', canvasSize/2, canvasSize/2);
    }
    else {
        game.fillText('PERDISTE TODAS LAS VIDAS 😫 VUELVE AL INICIO 💔', canvasSize/2, canvasSize/2);
    } 
}

function gameWin() {
    // console.log('FELICITACIONES!! Terminaste el juego!')
    clearInterval(timeInterval);

    const recordTime = localStorage.getItem('record_time');
    const timePlayer = Date.now() - timeStart;

    if (recordTime) {
        if (recordTime >= timePlayer) {
            localStorage.setItem('record_time', timePlayer);
            pResult.innerHTML = 'NUEVO RECORD! FELICITACIONES!!';
        } else {
            pResult.innerHTML = 'Lo siento, no superaste el record... Vuelve a Intentarlo!';
        }
    } else {
        localStorage.setItem('record_time', timePlayer);
        pResult.innerHTML = 'Primera vez? Muy bien! Ahora supera tu propio tiempo!';
    }

    showGemeWin();
    console.log({recordTime, timePlayer});
}

function showGemeWin() {
    game.clearRect(0, 0, canvasSize, canvasSize);
    game.font = '15px Quicksand';
    game.textAlign = 'center';
    game.fillStyle = "white"
    game.fillText('🎉 Has llegado al último nivel!! 🎉 Has superado el record? 🥳', canvasSize/2, canvasSize/2);
    
}

function showLives() {
    const heartsArray = Array(lives).fill(emojis['HEART']); //[,,]

    spanLives.innerHTML = "";
    heartsArray.forEach(heart => spanLives.append(heart));
}

function showTime() {
    spanTime.innerHTML = Date.now() - timeStart;
}

function showRecord() {
    spanRecord.innerHTML = localStorage.getItem('record_time');
}

window.addEventListener('keydown', moveByKeys);
btnUp.addEventListener('click', moveUp);
btnLeft.addEventListener('click', moveLeft);
btnRight.addEventListener('click', moveRight);
btnDown.addEventListener('click', moveDown);

function moveByKeys(event) {
    if (event.key == 'ArrowUp') moveUp();
    else if (event.key === 'ArrowLeft') moveLeft();
    else if (event.key === 'ArrowRight') moveRight();
    else if (event.key === 'ArrowDown') moveDown();
}
function moveUp() {
    console.log('Me quiero mover arriba');

    if ((playerPosition.y - elementsSize) < elementsSize) {
        console.log('OUT');
    } else {
    playerPosition.y -= elementsSize;
    startGame();
    }
}
function moveLeft() {
    console.log('Me quiero mover hacia izquierda');

    if ((playerPosition.x - elementsSize) < elementsSize) {
        console.log('OUT');
    } else {
    playerPosition.x -= elementsSize;
    startGame();
    }
}
function moveRight() {
    console.log('Me quiero mover hacia derecha');

    if ((playerPosition.x + elementsSize) > canvasSize) {
    console.log('OUT');
    } else {
    playerPosition.x += elementsSize;
    startGame();
    }
}
function moveDown() {
    console.log('Me quiero mover hacia abajo');
    
    if ((playerPosition.y + elementsSize) > canvasSize) {
    console.log('OUT');
    } else {
    playerPosition.y += elementsSize;
    startGame();
    }
}

reset_button.addEventListener('click', resetGame);

function resetGame() {
    location.reload();
}
