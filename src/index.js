import control from './classes/control'
import Boat from './classes/boat'
import River from './classes/river'
import World from './classes/world'
import Home from './classes/home'
import Game from './classes/game'
import Tutorial from './classes/tutorial'
import infoDisplay from './classes/info-display'
import Waterfall from './classes/waterfall'
import CollisionManager from './classes/collision-manager'
// import Tree from './classes/tree'
// import Rock from './classes/rock'
import drawDebug from './classes/debug'
import ObstacleManager from './classes/obstacle-manager'
import CONSTANTS, { setConstants } from './classes/constants'

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

let world
let home
let tutorial
let game
let controls
let boat
let river
let waterfall
let obstacleManager
let collisionManager
// let tree
// let rock
let paused = false

function initGameClasses() {
  world = new World(ctx)

  home = new Home(ctx, controls)

  game = new Game(ctx, controls, goToTitle)

  tutorial = new Tutorial(ctx, controls)

  boat = new Boat(
    ctx,
    CONSTANTS.SCALE_FACTOR,
    CONSTANTS.STROKE_POWER,
    CONSTANTS.MAX_HUMAN_POWER_VELOCITY,
    CONSTANTS.WATER_FRICTION,
    {
      x: (CONSTANTS.CANVAS_WIDTH / 2) - (CONSTANTS.BOAT_WIDTH / 2),
      y: CONSTANTS.CANVAS_HEIGHT / 2 / 1.25,
    },
  )

  collisionManager.init(boat)

  waterfall = new Waterfall(ctx, CONSTANTS.RIVER_SPEED)

  obstacleManager = new ObstacleManager(ctx)
}

function titleLoop() {
  world.calculatePositions(river, waterfall, boat)
  river.renderBody(boat.velocity + 0.35)
  boat.justRow()
  // tree.render(boat.velocity + 0.35)
  // rock.render(boat.velocity + 0.35)
  river.renderBorder(boat.velocity + 0.35)
  home.renderMainScreen()
}

// function goToMenu() {
//   gameState = gameStates.title
// }

function tutorialLoop() {
  world.calculatePositions(river, waterfall, boat)
  river.renderBody(boat.velocity + 0.1)
  // I think there is lingering velocity after the tutorial ends?
  // TODO: check on above.
  boat.setFrames(controls.boatFrame())
  boat.runFrameUpdate()
  river.renderBorder(boat.velocity)
  tutorial.renderTutorial()
}

function gameLoop() {
  if (!game.paused) {
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    world.calculatePositions(river, waterfall, boat)

    if (!world.running) {
      gameState = gameStates.gameOver
    }

    waterfall.render(boat.velocity)

    river.renderBody(boat.velocity)

    // drawDebug(ctx, world)

    obstacleManager.renderObstacles(boat.velocity)

    boat.setFrames(controls.boatFrame())

    boat.runFrameUpdate()

    // tree.render(boat.velocity)

    // rock.render(boat.velocity)

    collisionManager.broadPhaseCheck(boat, obstacleManager.obstacles)

    river.renderBorder(boat.velocity)

    game.render(world.totalDistanceRowed)
  }
  // tutorial.renderThumb()
}

function gameOverLoop() {
  if (waterfall.current !== 0 || river.current !== 0) {
    waterfall.current = 0
    river.current = 0
  }
  world.calculatePositions(river, waterfall, boat)
  waterfall.render(0)
  river.render(0)
  boat.fadeOut()

  game.render(world.distanceMoved)
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

  obstacleManager.spawnObstacle()

  game.goTo()

  gameState = gameStates.game
}

function goToTitle() {
  controls.registerButton(body, home.playBtn, () => {
    goToGame()
  })
  controls.registerButton(body, home.tutorialBtn, () => {
    leaveTitle()
    goToTutorial()
  })

  boat.checkOarAlignment()

  gameState = gameStates.title
}


const fitCanvasToScreen = () => {
  canvas.style.width = `${CONSTANTS.SCALED_WIDTH}px`
  body.style.height = `${CONSTANTS.SCALED_HEIGHT}px`
  wrapper.style.height = `${CONSTANTS.SCALED_HEIGHT}px`
  canvas.style.height = `${CONSTANTS.SCALED_HEIGHT}px`
}

const initializeGame = (mainFn) => {
  setConstants(canvas)

  console.log('CONSTANTS', CONSTANTS)

  fitCanvasToScreen()

  canvas.style.backgroundColor = '#0e52ce'
  canvas.style.imageRendering = 'pixelated'

  controls = control(CONSTANTS.SCREEN_MID_X)

  controls.init(body)

  collisionManager = new CollisionManager(ctx)

  initGameClasses()

  infoDisplay.init(wrapper, canvas, CONSTANTS.SCALED_WIDTH)

  river = new River(ctx, CONSTANTS.RIVER_SPEED)

  mainFn()
}

function mainLoop() {
  if (!paused) {
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

window.addEventListener('load', () => {
  console.log('All loaded!')

  initializeGame(mainLoop)
})
