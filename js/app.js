'use strict'

const WALL = 'WALL'
const FLOOR = 'FLOOR'
const BALL = 'BALL'
const GAMER = 'GAMER'
const GLUE = 'GLUE'

const GAMER_IMG = '<img src="img/gamer.png">'
const BALL_IMG = '<img src="img/ball.png">'

// Model:
var gBoard
var gGamerPos
var gAddBallInterval
var gAddGlueInterval
var gCollectedBall
var gCountBall
var gNeighborBall
var gIsGlue
const gEatBallAudio = new Audio('sound/eatball.wav');

function onInitGame() {
    gGamerPos = { i: 2, j: 9 }
    gBoard = buildBoard()
    renderBoard(gBoard)
    gCollectedBall = 0
    gCountBall = 2
    hideElement('.game-over')
    gIsGlue = false
    gAddBallInterval = setInterval(addBall, 3000)
    gAddGlueInterval = setInterval(addGlue, 5000)
}

function buildBoard() {
    const board = []
    // DONE: Create the Matrix 10 * 12 
    // DONE: Put FLOOR everywhere and WALL at edges
    for (var i = 0; i < 10; i++) {
        board[i] = []
        for (var j = 0; j < 12; j++) {
            board[i][j] = { type: FLOOR, gameElement: null }
            if (i === 0 || i === 9 || j === 0 || j === 11) {
                board[i][j].type = WALL
            }
        }
    }
    // DONE: Place the gamer and two balls
    board[gGamerPos.i][gGamerPos.j].gameElement = GAMER
    board[5][5].gameElement = BALL
    board[7][2].gameElement = BALL
    board[0][6].type = board[9][6].type = FLOOR
    board[5][0].type = board[5][11].type = FLOOR

    console.log(board)
    return board
}

// Render the board to an HTML table
function renderBoard(board) {

    const elBoard = document.querySelector('.board')
    var strHTML = ''
    for (var i = 0; i < board.length; i++) {
        strHTML += '<tr>\n'
        for (var j = 0; j < board[0].length; j++) {
            const currCell = board[i][j]

            var cellClass = getClassName({ i: i, j: j })
            // console.log('cellClass:', cellClass)

            if (currCell.type === FLOOR) cellClass += ' floor'
            else if (currCell.type === WALL) cellClass += ' wall'

            strHTML += `\t<td class="cell ${cellClass}"  onclick="moveTo(${i},${j})" >\n`

            if (currCell.gameElement === GAMER) {
                strHTML += GAMER_IMG
            } else if (currCell.gameElement === BALL) {
                strHTML += BALL_IMG
            }

            strHTML += '\t</td>\n'
        }
        strHTML += '</tr>\n'
    }

    elBoard.innerHTML = strHTML
}

// Move the player to a specific location
function moveTo(i, j) {
    console.log(i, j)
    if(gIsGlue) return
    if(isSpecialMove(i, j)){
        specialMove(i, j)
        return
    }
    const targetCell = gBoard[i][j]
    if (targetCell.type === WALL) return
    // Calculate distance to make sure we are moving to a neighbor cell
    const iAbsDiff = Math.abs(i - gGamerPos.i)
    const jAbsDiff = Math.abs(j - gGamerPos.j)

    // If the clicked Cell is one of the four allowed
    if ((iAbsDiff === 1 && jAbsDiff === 0) || (jAbsDiff === 1 && iAbsDiff === 0)) {

        if (targetCell.gameElement === BALL) {
            gCollectedBall++
            gCountBall--
            gEatBallAudio.play()
            updateCollectBall()
            isGameOver()
        }
        if (targetCell.gameElement === GLUE){
            gIsGlue = true
            setTimeout(function(){
                gIsGlue = false
            }, 3000)
        }
         
        updateModelAndDom(i, j)
    } 
}

function isSpecialMove(i, j){
    if(gGamerPos.i === 0 && gGamerPos.j === 6 && i === - 1) return true
    if(gGamerPos.i === 9 && gGamerPos.j === 6 && i === 10) return true
    if(gGamerPos.i === 5 && gGamerPos.j === 0 && j === -1) return true
    if(gGamerPos.i === 5 && gGamerPos.j === 11 && j === 12) return true

    return false
}

function specialMove(i, j){
    if(gGamerPos.i === 0 && gGamerPos.j === 6 && i === - 1) updateModelAndDom(9, j)
    if(gGamerPos.i === 9 && gGamerPos.j === 6 && i === 10) updateModelAndDom(0, j)
    if(gGamerPos.i === 5 && gGamerPos.j === 0 && j === -1) updateModelAndDom(i, 11)
    if(gGamerPos.i === 5 && gGamerPos.j === 11 && j === 12) updateModelAndDom(i, 0)
}

function updateModelAndDom(i, j){
    const targetCell = gBoard[i][j]
// DONE: Move the gamer
    // REMOVING FROM
    // update Model
    gBoard[gGamerPos.i][gGamerPos.j].gameElement = null
    // update DOM
    renderCell(gGamerPos, '')

    // ADD TO
    // update Model
    targetCell.gameElement = GAMER
    gGamerPos = { i, j }
    // update DOM
    renderCell(gGamerPos, GAMER_IMG)

}

// Convert a location object {i, j} to a selector and render a value in that element
function renderCell(location, value) {
    const cellSelector = '.' + getClassName(location) // cell-i-j
    const elCell = document.querySelector(cellSelector)
    elCell.innerHTML = value
    
}

// Move the player by keyboard arrows
function onHandleKey(event) {
    const i = gGamerPos.i
    const j = gGamerPos.j
    console.log('event.key:', event.key)

    switch (event.key) {
        case 'ArrowLeft':
            moveTo(i, j - 1)
            break
        case 'ArrowRight':
            moveTo(i, j + 1)
            break
        case 'ArrowUp':
            moveTo(i - 1, j)
            break
        case 'ArrowDown':
            moveTo(i + 1, j)
            break
    }
}

// Returns the class name for a specific cell
function getClassName(location) {
    const cellClass = 'cell-' + location.i + '-' + location.j
    return cellClass
}

function addBall(){
    const emptyCells = getAllEmptyCell()
    const randomIdx = getRandomInt(0, emptyCells.length)
    const randomCell = emptyCells[randomIdx]
    renderCell(randomCell, BALL_IMG)
    gBoard[randomCell.i][randomCell.j].gameElement = BALL
    gCountBall++
    gNeighborBall = getNeighBall(gGamerPos.i, gGamerPos.j)
    console.log('gNeighborBall:', gNeighborBall)
}

function addGlue(){
    const emptyCells = getAllEmptyCell()
    const randomIdx = getRandomInt(0, emptyCells.length)
    const randomCell = emptyCells[randomIdx]
    renderCell(randomCell, 'glue')
    gBoard[randomCell.i][randomCell.j].gameElement = GLUE
    setTimeout(function(){
        if(gBoard[randomCell.i][randomCell.j].gameElement === GLUE){
            renderCell(randomCell, '')
            gBoard[randomCell.i][randomCell.j].gameElement = null
        }
    }, 3000)
}

function getAllEmptyCell(){
    const emptyCells = []
    for (var i = 0; i < 10; i++) {
        for (var j = 0; j < 12; j++) {
            const cell = gBoard[i][j]
            if (i === 0 || i === 9 || j === 0 || j === 11) continue
            if(cell.type === FLOOR && cell.gameElement === null) emptyCells.push({i, j})
        }
    }

    return emptyCells
}

function updateCollectBall(){
    const elSpan = document.querySelector('.collect-ball')
    elSpan.innerText = gCollectedBall
}

function getNeighBall(rowIdx, colIdx){
    var count = 0
    for(var i = rowIdx - 1; i <= rowIdx + 1; i++){
        if(i < 0 || i >= gBoard.length) continue
        for(var j = colIdx - 1; j <= colIdx + 1; j++){
            if(j < 0 || j >= gBoard[i].length) continue
            if(i === rowIdx && j === colIdx) continue
            if(gBoard[i][j].gameElement === BALL) count++
        }
    }

    return count
}

function isGameOver(){
    if(gCountBall === 0){
        clearInterval(gAddBallInterval)
        clearInterval(gAddGlueInterval)
        showElement('.game-over')
    }
}

function hideElement(selector) {
    const el = document.querySelector(selector)
    console.log('el:', el)
    el.classList.add('hidden')
}

function showElement(selector) {
    const el = document.querySelector(selector)
    console.log(el);
    el.classList.remove('hidden')
}

function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}
