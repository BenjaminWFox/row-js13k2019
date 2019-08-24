import control from './classes/control'
import Boat from './classes/boat'

const CANVAS_RATIO = 16 / 9
let CANVAS_MID_X
// let CANVAS_MID_Y
let SCREEN_WIDTH
let SCREEN_HEIGHT
let SCREEN_MID_X
let SCREEN_MID_Y
let SCALE_FACTOR
let SCALED_WIDTH
let SCALED_HEIGHT

// Get dom element refs
const body = document.querySelector('body')
const wrapper = document.getElementById('wrapper')
const canvas = document.getElementById('canvas')

// Prevent various zoome and scroll events
window.addEventListener('gesturestart', (e) => e.preventDefault())
window.addEventListener('gesturechange', (e) => e.preventDefault())
window.addEventListener('gestureend', (e) => e.preventDefault()); body.style.overflow = 'hidden'
window.addEventListener('mousewheel', (event) => event.preventDefault(), { passive: false })
document.addEventListener('touchmove', (ev) => ev.preventDefault(), { passive: false })
body.addEventListener('ontouchmove', (e) => e.preventDefault())
body.style.backgroundColor = '#000000'

let controls
let boat

const setConstants = () => {
  SCREEN_WIDTH = window.innerWidth
  SCREEN_HEIGHT = window.innerHeight
  SCREEN_MID_X = SCREEN_WIDTH / 2
  SCREEN_MID_Y = SCREEN_HEIGHT / 2
  SCALED_WIDTH = Math.round(SCREEN_HEIGHT / CANVAS_RATIO)
  SCALED_HEIGHT = SCREEN_HEIGHT
  CANVAS_MID_X = Math.round(SCALED_WIDTH / 2)
  // CANVAS_MID_Y = SCALED_HEIGHT / 2
  SCALE_FACTOR = SCALED_HEIGHT / canvas.height
}

const fitCanvasToScreen = () => {
  canvas.style.width = `${SCALED_WIDTH}px`
  body.style.height = `${SCALED_HEIGHT}px`
  wrapper.style.height = `${SCALED_HEIGHT}px`
  canvas.style.height = `${SCALED_HEIGHT}px`
}

function gameLoop() {
  window.requestAnimationFrame(gameLoop)

  // Draw a midline for reference
  const ctx = canvas.getContext('2d')

  ctx.beginPath()
  ctx.moveTo((Math.round(135 / 2)), 0)
  ctx.lineTo((Math.round(135 / 2)), 240)
  ctx.stroke()

  boat.setFrames(controls.boatFrame())
  boat.render(CANVAS_MID_X, SCREEN_MID_Y / 2)
}

const initializeGame = () => {
  setConstants()

  fitCanvasToScreen()

  canvas.style.backgroundColor = '#0e52ce'
  canvas.style.imageRendering = 'pixelated'

  controls = control(SCREEN_MID_X)
  controls.init(body)

  boat = new Boat(canvas, SCALE_FACTOR)

  gameLoop()
}

window.addEventListener('load', () => {
  console.log('All loaded!')

  initializeGame()
})
