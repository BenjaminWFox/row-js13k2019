/* eslint-disable */

/**
 * IMPORT STATEMENTS
 */
import control from './classes/control'

import Boat from './classes/boat'

import River from './classes/river'
// import World from './classes/world'
import Home from './classes/home'
import Game from './classes/game'
import Tutorial from './classes/tutorial'
import Sound from './classes/sound'
import infoDisplay from './classes/info-display'
import CollisionManager from './classes/collision-manager'
import ObstacleManager from './classes/obstacle-manager'
// import drawDebug from './classes/debug'
import { setConstants } from './classes/constants'

/**
 * CONSTANTS
 */
let CANVAS_RATIO =  16 / 9
let MAX_HUMAN_POWER_VELOCITY =  0.75
let WATER_FRICTION =  0.005
let STROKE_POWER =  0.0075 
let STROKE_INCREASE =  0.001
let RIVER_SPEED =  -0.1
let BOAT_WIDTH =  24
let BOAT_HEIGHT =  14
// Set in `initializeGame()`
let CANVAS_MID_X =  undefined
let CANVAS_MID_Y =  undefined
let CANVAS_WIDTH =  undefined
let CANVAS_HEIGHT =  undefined
let SCREEN_WIDTH =  undefined
let SCREEN_HEIGHT =  undefined
let SCREEN_MID_X =  undefined
let SCREEN_MID_Y =  undefined
let SCALE_FACTOR =  undefined
let SCALED_WIDTH =  undefined
let SCALED_HEIGHT =  undefined

// STROKE_POWER: 0.005, // ORIGINAL...
// STROKE_POWER: 0.01, // FOR TESTING ...

/**
 * World/distance vars
 */
let distanceMoved, distanceFromStart, totalDistanceRowed, isRunning

/**
 * Put all variables that need resetting per-game here
 */
function resetVarsForNewGame() {
  console.log('-- resetVarsForNewGame --')
  isRunning = true
  distanceMoved = 0
  distanceFromStart = 0
  totalDistanceRowed = 0
}

resetVarsForNewGame()

const sCtx = new (window.AudioContext || window.webkitAudioContext)()

const sound = new Sound(sCtx)

// localStorage.removeItem('highscore')

let hs = localStorage.getItem('highscore')

console.log('HIGH SCORE', hs)

const updateHs = (score) => {
  console.log('HS/Score', hs, score)
  if (!hs || score > hs) {
    hs = score
  }
}

const setHs = (score) => {
  if (!hs || score >= hs) {
    console.log('DONE AM SETTING HS!', hs, score)
    hs = score
    console.log('Highscore AS SET', hs)
    localStorage.setItem('highscore', hs)
  }
}

// Get dom element refs
const body = document.querySelector('body')
const wrapper = document.getElementById('wrapper')
const canvas = document.getElementById('canvas')
const ctx = canvas.getContext('2d')
const gameStates = {
  initial: 'initial',
  title: 'title',
  tutorial: 'tutorial',
  game: 'game',
  gameOver: 'gameOver',
}
let gameState = gameStates.initial

ctx.font = '12px Courier'

// Prevent various zoome and scroll events
window.addEventListener('gesturestart', (e) => e.preventDefault())
window.addEventListener('gesturechange', (e) => e.preventDefault())
window.addEventListener('gestureend', (e) => e.preventDefault()); body.style.overflow = 'hidden'
window.addEventListener('mousewheel', (event) => event.preventDefault(), { passive: false })
document.addEventListener('touchmove', (ev) => ev.preventDefault(), { passive: false })
body.addEventListener('ontouchmove', (e) => e.preventDefault())

// let world,
let home, tutorial, game, controls, boat, river, obstacleManager, collisionManager, paused = false

// let tree
// let rock
// let waterfall

function initGameClasses() {
  // world = new World(ctx, sound.end.bind(sound))

  home = new Home(ctx, hs)

  console.log('Set game', sound)
  game = new Game(ctx, controls, goToTitle, sound)

  tutorial = new Tutorial(ctx, controls)

  boat = new Boat(
    ctx,
    SCALE_FACTOR,
    STROKE_POWER,
    MAX_HUMAN_POWER_VELOCITY,
    WATER_FRICTION,
    {
      x: (CANVAS_WIDTH / 2) - (BOAT_WIDTH / 2),
      y: CANVAS_HEIGHT / 2 / 1.25,
    },
  )

  collisionManager.init(boat)

  // waterfall = new Waterfall(ctx, CONSTANTS.RIVER_SPEED)

  obstacleManager = new ObstacleManager(ctx)
}

function titleLoop() {
  _world_calculatePositions(river, boat)
  river.renderBody(boat.velocity + 0.35)
  boat.justRow()
  river.renderBorder(boat.velocity + 0.35)
  home.renderMainScreen()
}

// function goToMenu() {
//   gameState = gameStates.title
// }

function tutorialLoop() {
  _world_calculatePositions(river, boat)
  river.renderBody(boat.velocity + 0.1)
  // I think there is lingering velocity after the tutorial ends?
  // TODO: check on above.
  boat.setFrames(controls.boatFrame())
  boat.runFrameUpdate()
  river.renderBorder(boat.velocity)
  tutorial.renderTutorial()
}

function goToGameOver() {
  sound.end()
  setHs(totalDistanceRowed)
  gameState = gameStates.gameOver
}

function gameLoop() {
  if (!game.paused) {
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    if (!isRunning || collisionManager.collisions >= 8) {
      goToGameOver()
    }

    _world_calculatePositions(river, boat, gameState)

    river.renderBody(boat.velocity)

    // drawDebug(ctx, world)

    obstacleManager.trySpawnObstacle(totalDistanceRowed, game.difficulty)

    obstacleManager.render(boat.velocity)

    boat.setFrames(controls.boatFrame())

    boat.runFrameUpdate()

    boat.updateStrokePower(game.difficulty)

    collisionManager.broadPhaseCheck(boat, obstacleManager.obstacles)

    river.renderBorder(boat.velocity)

    game.render(totalDistanceRowed)

    boat.renderLivesLeft(collisionManager.collisions)

    updateHs(totalDistanceRowed)
  }
}

function gameOverLoop() {
  if (river.current !== 0) {
    river.current = 0
  }

  _world_calculatePositions(river, boat)

  river.render(0)

  obstacleManager.render(-(RIVER_SPEED * 2))

  boat.fadeOut()

  game.render(totalDistanceRowed)
  game.renderGameOver()
}

function pause(duration, cb) {
  paused = true
  setTimeout(() => {
    console.log('UNPAUSE')
    paused = false
    cb()
  }, duration)
}

function goToTutorial() {
  controls.registerButton(body, tutorial.backBtn, () => {
    tutorial.leave()
    goToTitle()
  })

  tutorial.runTutorialSteps()

  gameState = gameStates.tutorial
}

function leaveTitle() {
  controls.clearButton(body, home.playBtn)
  controls.clearButton(body, home.tutorialBtn)
}

function goToGame() {
  leaveTitle()

  initGameClasses()

  controls.registerBoatControls()

  resetVarsForNewGame()
  river.reset()
  collisionManager.reset()

  obstacleManager.makeWaterfall()


  game.goTo()

  gameState = gameStates.game
}

function goToTitle() {
  controls.registerButton(body, home.playBtn, () => {
    sound.song()
    goToGame()
  })
  controls.registerButton(body, home.tutorialBtn, () => {
    leaveTitle()
    goToTutorial()
  })

  boat.checkOarAlignment()

  if (gameState === gameStates.game) {
    console.log('Set hs', totalDistanceRowed)
    setHs(totalDistanceRowed)
    home.updateHs(hs)
  }


  gameState = gameStates.title
}

const fitCanvasToScreen = () => {
  canvas.style.width = `${SCALED_WIDTH}px`
  body.style.height = `${SCALED_HEIGHT}px`
  wrapper.style.height = `${SCALED_HEIGHT}px`
  canvas.style.height = `${SCALED_HEIGHT}px`
}

const initializeGame = (mainFn) => {
  /**
   * SET UNSET CONSTANTS
   */
  setConstants(canvas)
  CANVAS_WIDTH = canvas.width
  CANVAS_HEIGHT = canvas.height
  SCREEN_WIDTH = window.innerWidth
  SCREEN_HEIGHT = window.innerHeight
  SCREEN_MID_X = SCREEN_WIDTH / 2
  SCREEN_MID_Y = SCREEN_HEIGHT / 2
  SCALED_WIDTH = Math.round(SCREEN_HEIGHT / CANVAS_RATIO)
  SCALED_HEIGHT = SCREEN_HEIGHT
  CANVAS_MID_X = Math.round(SCALED_WIDTH / 2)
  CANVAS_MID_Y = SCALED_HEIGHT / 2
  SCALE_FACTOR = SCALED_HEIGHT / canvas.height


  // console.log('CONSTANTS', CONSTANTS)

  fitCanvasToScreen()

  canvas.style.backgroundColor = '#0e52ce'
  canvas.style.imageRendering = 'pixelated'

  controls = control(SCREEN_MID_X)

  controls.init(body, sound.oar.bind(sound))

  collisionManager = new CollisionManager(ctx, sound.bump.bind(sound))

  initGameClasses()

  infoDisplay.init(wrapper, canvas, SCALED_WIDTH)

  river = new River(ctx)

  mainFn()
}

function mainLoop() {
  if (!paused) {
    console.log('MAIN LOOP - GAME STATE', gameState)
    switch (gameState) {
      case gameStates.initial:
        ctx.clearRect(0, 0, canvas.width, canvas.height)
        home.renderInitialLoad()
        console.log('PAUSE')
        pause(500, () => {
          console.log('unpause cb')
          if (tutorial.hasBeenSeen) {
            goToTitle()
          }
          else {
            console.log('SET TUTORIAL')
            leaveTitle()
            goToTutorial()
          }
        })
        break
      case gameStates.title:
        ctx.clearRect(0, 0, canvas.width, canvas.height)
        titleLoop()
        break
      case gameStates.tutorial:
        ctx.clearRect(0, 0, canvas.width, canvas.height)
        if (tutorial.running) {
          tutorialLoop()
        }
        else {
          goToTitle()
        }
        break
      case gameStates.game:
        if (!collisionManager.hasCollision) {
          gameLoop()
        }
        break
      case gameStates.gameOver:
        ctx.clearRect(0, 0, canvas.width, canvas.height)
        gameOverLoop()
        break
      default:
    }
  }
  window.requestAnimationFrame(mainLoop)
}

/**
 * WORLD methods ...
 */
function _world_calculatePositions(river, boat, state) {
  const { current } = river
  const { velocity } = boat

  const distMod = ((current * 2) + velocity)

  if (isRunning) {
    distanceMoved = distanceMoved - distMod
    distanceFromStart = distanceMoved
    totalDistanceRowed = distMod > 0
      ? totalDistanceRowed + distMod
      : totalDistanceRowed
  }

  if (state === 'game' && boat.y - distanceFromStart < 0) {
    isRunning = false
  }
}

/**
 * CONTROL methods ...
 */

/**
 * BOAT methods ...
 */

/**
 * Set the event listener that will load the game
 */
window.addEventListener('load', () => {
  console.log('-- window _ load --')

  initializeGame(mainLoop)
})
/* eslint-enable */
