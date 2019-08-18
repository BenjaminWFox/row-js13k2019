import boatLeftSheet from './assets/images/sprites/boat-left-sprite.png'
import boatRightSheet from './assets/images/sprites/boat-right-sprite.png'
import makeSprite from './classes/sprite'

const wrapper = document.getElementById('wrapper')
const canvas = document.getElementById('canvas')
const button = document.getElementById('button')
const boatLeftImage = new Image()
const boatRightImage = new Image()

canvas.width = 135
canvas.height = 240
canvas.style.backgroundColor = '#0e52ce'
canvas.style.imageRendering = 'pixelated'
canvas.style.height = '100%'

boatLeftImage.src = boatLeftSheet
boatRightImage.src = boatRightSheet

const boatLeftSprite = makeSprite({
  context: canvas.getContext('2d'),
  width: 84,
  height: 14,
  image: boatLeftImage,
  numberOfFrames: 7,
  loop: true,
  ticksPerFrame: 5,
  scale: 2,
})

const boatRightSprite = makeSprite({
  context: canvas.getContext('2d'),
  width: 84,
  height: 14,
  image: boatLeftImage,
  numberOfFrames: 7,
  loop: true,
  ticksPerFrame: 30,
})

function gameLoop() {
  window.requestAnimationFrame(gameLoop)

  boatRightSprite.update()
  boatRightSprite.render()

  boatLeftSprite.update()
  boatLeftSprite.render()
}

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
  console.log('loaded')
}

wrapper.onclick = () => {
  if (!document.fullscreenElement) {
    toggleFullscreen()
  }
}

gameLoop()
