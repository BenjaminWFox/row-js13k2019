import boatLeftSheet from './assets/images/sprites/boat-left-sprite.png'
import boatRightSheet from './assets/images/sprites/boat-right-sprite.png'
import makeSprite from './classes/sprite'
import control from './classes/control'
import Boat from './classes/boat'

let MID_X
let MID_Y
let SCALE_FACTOR

function blockMove(event) {
  // Tell Safari not to move the window.
  event.preventDefault()
}

const body = document.querySelector('body')

body.addEventListener('ontouchmove', blockMove)
body.style.overflow = 'hidden'
body.style.backgroundColor = '#000000'

const wrapper = document.getElementById('wrapper')
const canvas = document.getElementById('canvas')
const button = document.getElementById('button')
const boatLeftImage = new Image()
const boatRightImage = new Image()

// canvas.width = 135
// canvas.height = 240
canvas.style.backgroundColor = '#0e52ce'
canvas.style.imageRendering = 'pixelated'

boatLeftImage.src = boatLeftSheet
boatRightImage.src = boatRightSheet

function toggleFullscreen() {
  if (!document.fullscreenElement) {
    wrapper.requestFullscreen().catch((err) => {
      console.log(`Error attempting to enable full-screen mode: ${err.message} (${err.name})`)
    })
  }
  else {
    document.exitFullscreen()
  }
}

window.onload = () => {
}

// wrapper.onclick = () => {
//   if (!document.fullscreenElement) {
//     toggleFullscreen()
//   }
// }

setTimeout(() => {
  console.log('loaded', window.navigator.standalone)
}, 250)

// Avoid iOS drag events
document.addEventListener('touchmove', (ev) => ev.preventDefault(), {
  passive: false,
})

let width
let height

const ratios = [1.0, 1.25, 2]
// let quality = 2

// // Sorry FF, you get gimped because large canvas2D elements are slow on OSX!
// if (/firefox/i.test(navigator.userAgent)) {
//   quality -= 1
// }

let pixelRatio
// // let targetPixelRatio

const setPixelRatio = (target) => {
  // targetPixelRatio = target
  pixelRatio = Math.min(window.devicePixelRatio, target)
}

setPixelRatio(ratios[2])

function fit() {
  width = window.innerWidth
  height = window.innerHeight

  const scaledWidth = Math.round(height / (16 / 9))
  const scaledHeight = height

  canvas.style.width = `${scaledWidth}px`
  body.style.height = `${scaledHeight}px`
  wrapper.style.height = `${scaledHeight}px`
  canvas.style.height = `${scaledHeight}px`

  console.log('Scale factor is', scaledHeight / canvas.height)
  console.log('Canvas has been fit. The width/height are:', canvas.width, canvas.height, canvas.style.width, canvas.style.height)

  MID_X = width / 2
  MID_Y = scaledHeight / 2
  SCALE_FACTOR = scaledHeight / canvas.height

  console.log('Canvas X values are min/mid/max:', 0, scaledWidth / 2, scaledWidth)
  console.log('Canvas Y values are min/mid/max:', 0, scaledHeight / 2, scaledHeight)
  // console.log('height/width:', height, '/', height * (16 / 9))
}

fit()

window.addEventListener('mousewheel', (event) => {
  event.preventDefault()
}, { passive: false })

window.addEventListener('load', () => {
  console.log('All loaded!')
})

const controls = control(MID_X)

window.addEventListener('load', () => {
  console.log('All loaded!')

  controls.init(body)
})

const boat = new Boat(canvas, boatLeftImage, boatRightImage, SCALE_FACTOR)

function gameLoop() {
  window.requestAnimationFrame(gameLoop)

  // boat.update()
  boat.setFrames(controls.boatFrame())
  boat.render(MID_X, MID_Y / 2)
  // console.log(controls.activeTouches())
  // boat.render(0, 0)
}

gameLoop()
