import control from './classes/control'
import Boat from './classes/boat'
import River from './classes/river'
import World from './classes/world'
import Home from './classes/home'
import Tutorial from './classes/tutorial'
import infoDisplay from './classes/info-display'
import CONSTANTS, { setConstants } from './classes/constants'

// Get dom element refs
const body = document.querySelector('body')
const wrapper = document.getElementById('wrapper')
const canvas = document.getElementById('canvas')
const ctx = canvas.getContext('2d')
const world = new World(ctx)
const gameStates = {
  initial: 'initial',
  title: 'title',
  tutorial: 'tutorial',
  game: 'game',
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
body.style.backgroundColor = '#000000'

let home
let tutorial
let controls
let boat
let river
let paused = false

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
  // controls.init(body)

  home = new Home(ctx, controls)

  tutorial = new Tutorial(ctx, controls)

  boat = new Boat(
    ctx,
    CONSTANTS.SCALE_FACTOR,
    CONSTANTS.STROKE_POWER,
    CONSTANTS.MAX_HUMAN_POWER_VELOCITY,
    CONSTANTS.WATER_FRICTION,
    { x: CONSTANTS.CANVAS_MID_X, y: CONSTANTS.SCREEN_MID_Y / 1.25 },
  )

  river = new River(CONSTANTS.RIVER_SPEED)

  infoDisplay.init(wrapper, canvas, CONSTANTS.SCALED_WIDTH)

  mainFn()
}

function titleLoop() {
  world.calculatePositions(river, boat)
  boat.justRow()
  home.renderMainScreen()
}

function tutorialLoop() {
  world.calculatePositions(river, boat)
  boat.setFrames(controls.boatFrame())
  boat.runFrameUpdate()
  tutorial.renderThumb()
}

function gameLoop() {
  // world.drawDistanceGrid()

  world.calculatePositions(river, boat)

  // ctx.beginPath()
  // ctx.moveTo((Math.round(135 / 2)), 0)
  // ctx.lineTo((Math.round(135 / 2)), 240)
  // ctx.stroke()

  boat.setFrames(controls.boatFrame())

  boat.runFrameUpdate()

  // tutorial.renderThumb()
}

function pause(duration, cb) {
  paused = true
  setTimeout(() => {
    console.log('UNPAUSE')
    paused = false
    cb()
  }, duration)
}

function setupTutorial() {
  tutorial.runTutorialSteps()
  gameState = gameStates.tutorial
}

function setupTitle() {
  controls.registerButton(body, home.playBtn)
  controls.registerButton(body, home.tutorialBtn, () => {
    setupTutorial()
  })
  gameState = gameStates.title
}

function mainLoop() {
  if (!paused) {
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    switch (gameState) {
      case gameStates.initial:
        home.renderInitialLoad()
        console.log('PAUSE')
        pause(500, () => {
          console.log('unpause cb')
          if (tutorial.hasBeenSeen) {
            setupTitle()
          }
          else {
            console.log('SET TUTORIAL')
            setupTutorial()
          }
        })
        break
      case gameStates.title:
        titleLoop()
        break
      case gameStates.tutorial:
        if (tutorial.running) {
          tutorialLoop()
        }
        else {
          gameState = gameStates.title
        }
        break
      case gameStates.game:
        gameLoop()
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
