// VSCode TS config
// @ts-check

// Initialization
const FPS = 10;
const updateFPS = 60;

const boardSize = 19;
const tileSize = 28;
const canvasSize = boardSize * tileSize;

const color = {
    background: '#ededed',
    grid: '#bababa',
    primary: '#25a2cc',
    secondary: '#5ab4db',
    tertiary: '#8ac3db',
}

let CANVAS = undefined;
let nodeSelection = undefined;
let nodeSelectionDisplay = undefined;
let helpActivate = false;

const userMouse = {
    x: 0,
    y: 0,
    down: false,
};

const stats = {
    satisfyMin: 3,
    satisfyMax: 5,
    radius: 1,

    satisfyCap: undefined,
    radiusCap: boardSize,
}

stats.satisfyCap = stats.radius * stats.radius - 1;

// MATH

function getMouseTilePosition() {
    return { x: Math.floor(userMouse.x / tileSize), y: Math.floor(userMouse.y / tileSize) };
}

/**
 * @param {number} posX
 * @param {number} posY
 */
function checkIfTileOutOfBounds(posX, posY) {
    return posX < 0 || posX >= boardSize || posY < 0 || posY >= boardSize;
}

/**
 * @param {number} x
 * @param {number} y
 */
function getRange(x, y) {
    let checkListX = [];
    let checkListY = [];

    for (let i = -stats.radius; i <= stats.radius; i++) {
        checkListX.push(x + i);
        checkListY.push(y + i);
    }

    return { x: checkListX, y: checkListY };
}

/**
 * @param {number} x
 * @param {number} y
 */
function countNeighbors(x, y) {
    let count = 0;
    let checkList = getRange(x, y);

    for (let i = 0; i < checkList.x.length; i++) {
        for (let j = 0; j < checkList.y.length; j++) {
            if (checkIfTileOutOfBounds(checkList.x[i], checkList.y[j])) continue;
            if (checkList.x[i] === x && checkList.y[j] === y) continue;
            if (tileNodes[checkList.x[i]][checkList.y[j]] === 2) count++;
        }
    }

    return count;
}


/**
 * @param {number} posX
 * @param {number} posY
 */
function checkIfTileOccupied(posX, posY) {
    return tileNodes[posY][posX] != 0 ||
        posX < 0 || posX >= boardSize || posY < 0 || posY >= boardSize;
}

// DRAW FUNCTIONS
function clearCanvas() {
    CANVAS.clearCanvas();
    CANVAS.drawRect({
        fillStyle: color.background,
        x: 0, y: 0,
        width: canvasSize,
        height: canvasSize,
        fromCenter: false
    });

    CANVAS.drawRect({
        strokeStyle: color.grid,
        strokeWidth: 3,
        x: 0, y: 0,
        width: canvasSize,
        height: canvasSize,
        fromCenter: false
    });

    for (let i = 0; i < boardSize; i++) {
        for (let j = 0; j < boardSize; j++) {
            CANVAS.drawRect({
                strokeStyle: color.grid,
                strokeWidth: 1,
                x: i * tileSize, y: j * tileSize,
                width: tileSize,
                height: tileSize,
                fromCenter: false
            });
        }
    }
}

/**
 * @param {string} type
 * @param {number} tileX
 * @param {number} tileY
 */
function drawNode(type, tileX, tileY) {
    const posX = tileX * tileSize * 2 + tileSize;
    const posY = tileY * tileSize * 2 + tileSize;

    switch (type) {
        case "person":
            if (peopleNodes[tileY][tileX] == 1) {
                CANVAS.drawPolygon({
                    fillStyle: color.tertiary,
                    x: posX / 2, y: posY / 2,
                    radius: tileSize / 2 - 3,
                    sides: 360
                });
                CANVAS.drawArc({
                    strokeStyle: color.background,
                    strokeWidth: 2,
                    x: posX / 2, y: posY / 2,
                    radius: tileSize / 2 - 8,
                    start: -70 + 180, end: 70 + 180,
                });
            } else {
                CANVAS.drawPolygon({
                    fillStyle: color.secondary,
                    x: posX / 2, y: posY / 2,
                    radius: tileSize / 2 - 3,
                    sides: 360
                });
                CANVAS.drawArc({
                    strokeStyle: color.background,
                    strokeWidth: 2,
                    x: posX / 2, y: posY / 2 + tileSize / 4,
                    radius: tileSize / 2 - 8,
                    start: -70, end: 70,
                });
            }
            CANVAS.drawPolygon({
                fillStyle: color.background,
                x: posX / 2 - 5, y: posY / 2 - 4,
                radius: tileSize / 2 - 12,
                sides: 360
            });
            CANVAS.drawPolygon({
                fillStyle: color.background,
                x: posX / 2 + 5, y: posY / 2 - 4,
                radius: tileSize / 2 - 12,
                sides: 360
            });
            break;

        case "wall":
            CANVAS.drawRect({
                fillStyle: color.primary,
                x: posX / 2, y: posY / 2,
                width: tileSize,
                height: tileSize,
            });
            break;

        default:
            break;
    }
}

// DOM
function updateNodeSelCanvas() {
    nodeSelectionDisplay.clearCanvas();

    switch (nodeSelection.val()) {
        case "person":
            nodeSelectionDisplay.drawPolygon({
                fillStyle: color.secondary,
                x: tileSize / 2, y: tileSize / 2,
                radius: tileSize / 2,
                sides: 360
            });
            break;

        case "wall":
            nodeSelectionDisplay.drawRect({
                fillStyle: color.primary,
                x: tileSize / 2, y: tileSize / 2,
                width: tileSize,
                height: tileSize,
            });
            break;

        default:
            break;
    }
}

// NODES

// 0 = Empty, 1 = Wall, 2 = Person
let tileNodes = [];

// 0 = Empty, 1 = Positive, 2 = Negative
let peopleNodes = [];

// UPDATES
// Update frame
function tick() {
    // Uncomment to overheat! (don't do it)
    // console.log("tick");

    // UPDATING 

    // DRAWING
    clearCanvas();

    // Layer 1: Tiles

    // Layer 2: Nodes
    for (let i = 0; i < tileNodes.length; i++) {
        for (let j = 0; j < tileNodes[i].length; j++) {
            if (tileNodes[i][j] == 1) {
                drawNode("wall", j, i);
            } else if (tileNodes[i][j] == 2) {
                drawNode("person", j, i);
            }
        }
    }
}

function updatePeople() {
    for (let i = 0; i < tileNodes.length; i++) {
        for (let j = 0; j < tileNodes[i].length; j++) {
            if (tileNodes[i][j] < 2) {
                peopleNodes[i][j] = 0;
                continue;
            }

            if (tileNodes[i][j] == 2) {
                peopleNodes[i][j] = 2;
            }

            const count = countNeighbors(i, j);

            // Satisfy condition: min - max neighbors
            if (count >= stats.satisfyMin && count <= stats.satisfyMax) {
                peopleNodes[i][j] = 1;
            }
        }
    }
}

// Update values tick
setInterval(() => {
    // User mouse interaction
    if (userMouse.down) {
        const sel = nodeSelection.val();
        const pos = getMouseTilePosition();

        if (!checkIfTileOccupied(pos.x, pos.y)) {
            switch (sel) {
                case "person":
                    tileNodes[pos.y][pos.x] = 2;
                    break;

                case "wall":
                    tileNodes[pos.y][pos.x] = 1;
                    break;

                default:
                    break;
            }
        }

        if (sel == "blank") {
            tileNodes[pos.y][pos.x] = 0;
        }

        updatePeople();
        tick();
    }

    // DOM stuff

}, 1000 / updateFPS);

// ALGORITHMS
function findGoodSpot(x = 0, y = 0) {
    // Returns: [x, y]
    let bestSpot = undefined;
    let bestDistance = boardSize * 2 + 1;

    for (let i = 0; i < peopleNodes.length; i++) {
        for (let j = 0; j < peopleNodes[i].length; j++) {
            const count = countNeighbors(i, j);
            const distance = Math.abs(x - i) + Math.abs(y - j);
            if (count >= 3 && count <= 5 && !checkIfTileOccupied(i, j) && distance < bestDistance) {
                bestSpot = [j, i];
                bestDistance = distance;
            }
        }
    }

    return bestSpot;
}

function calculateMovePath() {
    let backupTileNodes = tileNodes;
    let backupPeopleNodes = peopleNodes;

    // Returns: [[x1, y1, x2, y2], [x1, y1, x2, y2]...]
    let result = [];

    // [[[x1, y1, x2, y2], [x1, y1, x2, y2]...], [[x1, y1, x2, y2], [x1, y1, x2, y2]...]...]
    let moves = [];

    const unsatisfiedStart = (JSON.stringify(backupPeopleNodes).match(new RegExp("2", "g")) || []).length
    let unsatisfiedCount = [];

    let boardHistory = [];

    while (true) {
        boardHistory.push(JSON.stringify(peopleNodes));
        for (let i = 0; i < peopleNodes.length; i++) {
            for (let j = 0; j < peopleNodes[i].length; j++) {
                if (peopleNodes[j][i] == 2) {
                    const spot = findGoodSpot(j, i);
                    if (spot == undefined) {
                        continue;
                    }

                    tileNodes[j][i] = 0;
                    tileNodes[spot[0]][spot[1]] = 2;
                    updatePeople();

                    result.push([j, i, spot[0], spot[1]]);
                }
            }
        }
        moves.push(result);

        let currentBoard = JSON.stringify(peopleNodes);

        unsatisfiedCount.push((currentBoard.match(new RegExp("2", "g")) || []).length);

        if (boardHistory.includes(currentBoard)) {
            break;
        }
    }

    tileNodes = backupTileNodes;
    peopleNodes = backupPeopleNodes;

    if (Math.min(...unsatisfiedCount) > unsatisfiedStart) {
        return moves[unsatisfiedCount.indexOf(Math.min(...unsatisfiedCount))];
    }

    return [];
}

function activateMovePath() {
    const path = calculateMovePath();

    for (let i = 0; i < path.length; i++) {
        tileNodes[path[i][0]][path[i][1]] = 0;
        tileNodes[path[i][2]][path[i][3]] = 2;
        updatePeople();
    }

    tick();
}

$(document).ready(function () {
    console.log("Ready!");

    // Main code

    // Canvas 
    CANVAS = $("#canvas");

    CANVAS.mousemove(function (event) {
        userMouse.x = event.pageX - $(this).offset().left;
        userMouse.y = event.pageY - $(this).offset().top;
    });

    $("body").mouseup(function () {
        userMouse.down = false;
    })

    CANVAS.mousedown(function () {
        userMouse.down = true;
    });

    CANVAS.prop("width", canvasSize);
    CANVAS.prop("height", canvasSize);

    // Info panel
    $("#infoButton").click(function () {

    });

    // Node selections
    nodeSelection = $('#nodeSelection');
    nodeSelectionDisplay = $('#nodeSelectionDisplay');

    nodeSelectionDisplay.prop("width", tileSize);
    nodeSelectionDisplay.prop("height", tileSize);

    nodeSelection.change(function () {
        updateNodeSelCanvas();
    });

    nodeSelection.val("person");
    updateNodeSelCanvas();

    function clearBoard() {
        tileNodes = [];
        for (let i = 0; i < boardSize; i++) {
            let arr = [];
            for (let j = 0; j < boardSize; j++) {
                arr.push(0);
            }
            tileNodes.push(arr);
        }

        peopleNodes = [];
        for (let i = 0; i < boardSize; i++) {
            let arr = [];
            for (let j = 0; j < boardSize; j++) {
                arr.push(0);
            }
            peopleNodes.push(arr);
        }

        tick();
    }

    clearBoard();

    $("#clearButton").click(function () {
        clearBoard();
    });

    // Start
    $("#processButton").click(function () {
        activateMovePath();
    });

    $("#cover").hide();
    $("#information").hide();

    function navigateToggle() {
        $("#cover").toggle();
        $("#mainCanvas").toggle();
        $("#information").toggle();

        helpActivate = !helpActivate;

        $("#infoButtonImg").attr("src", helpActivate ? "assets/img/back.png" : "assets/img/info.png");
    }

    $("#infoButton").click(function () {
        navigateToggle();
    });

    $("#githubButton").click(function () {
        window.open("https://github.com/Megarion/neighbors");
    });

    tick();

    $("#loading").fadeOut("slow");

    console.log("Initialized!");

});