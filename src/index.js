/* eslint-disable */

/**
 * IMPORT STATEMENTS
 */
// import control from './classes/control'
// import World from './classes/world'
// import Boat from './classes/boat'
// import River from './classes/river'
// import Tutorial from './classes/tutorial'

import boatLeftSheet from './assets/images/sprites/boat-shadow-sprite-left.png'
import boatRightSheet from './assets/images/sprites/boat-shadow-sprite-right.png'
import borderSrc from './assets/images/sprites/river-border-horizontal-stone.png'
import bodySrc from './assets/images/sprites/river-body.png'
import thumbPath from './assets/images/sprites/thumb.png'
import random from './classes/utility'
import makeSprite from './classes/sprite'
import { setCookie, getCookie } from './classes/cookie'
import Button from './classes/button'

import Home from './classes/home'
import Game from './classes/game'
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
let BOAT_SPRITE_WIDTH = 84
let BOAT_SPRITE_HEIGHT = 15
let TUTORIAL_SCREEN_DURATION = 5000
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
let home, tutorial, control, game, controls, boat, river, obstacleManager, collisionManager, paused = false

boat = {}

// let tree
// let rock
// let waterfall

function initGameClasses() {
  // world = new World(ctx, sound.end.bind(sound))

  home = new Home(ctx, hs)

  // console.log('Set game', sound)
  game = new Game(ctx, controls, goToTitle, sound)

  tutorial.init(ctx, controls)

  boat.init(
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

  // waterfall = new Waterfall(ctx, RIVER_SPEED)

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

  controls = control()
  controls.init(body, sound.oar.bind(sound))

  collisionManager = new CollisionManager(ctx, sound.bump.bind(sound))

  initGameClasses()

  infoDisplay.init(wrapper, canvas, SCALED_WIDTH)

  river.init()

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

/* #region CONTROL */
control = function() {
  let mtl
  let oarSound

  const getMainTouchEl = () => mtl

  const setMainTouchEl = (el) => {
    mtl = el
  } 

  const setOarSound = (sound) => {
    oarSound = sound
  }

  const createMockTouchObject = (id, startX, startY) => ({
    identifier: id,
    pageX: startX,
    pageY: startY,
  })

  const buttonRegistry = {}

  const activeTouches = {
    left: null,
    right: null,
  }

  const prevTouch = {
    left: {
      x: 0,
      y: 0,
    },
    right: {
      x: 0,
      y: 0,
    },
  }

  const touchDiff = {
    left: {
      x: 0,
      y: 0,
    },
    right: {
      x: 0,
      y: 0,
    },
  }

  const boatFrame = {
    left: 0,
    right: 0,
  }

  const setFrameForX = (x, side) => {
    // The in-to-out & out-to-in will be different (pos vs neg)
    // depending on the side
    const diff = side === 'left' ? x * -1 : x

    switch (boatFrame[side]) {
      case 1:
        if (Math.abs(x) !== diff) {
          boatFrame[side] = 2
        }
        break
      case 5:
        if (Math.abs(x) === diff) {
          boatFrame[side] = 6
        }
        break
      default:
    }
  }

  const setFrameForY = (y, side) => {
    switch (boatFrame[side]) {
      case 0:
        if (Math.abs(y) === y) {
          boatFrame[side] = 1
        }
        break
      case 2:
        if (Math.abs(y) !== y) {
          boatFrame[side] = 3
        }
        break
      case 3:
        if (Math.abs(y) !== y) {
          boatFrame[side] = 4
          oarSound()
        }
        break
      case 4:
        if (Math.abs(y) !== y) {
          boatFrame[[side]] = 5
        }
        break
      case 5:
        if (Math.abs(y) === y) {
          boatFrame[side] = 6
        }
        break
      case 6:
        if (Math.abs(y) === y) {
          boatFrame[side] = 0
        }
        break
      default:
    }
  }

  const setRightFrame = (x, y) => {
    if (x) {
      setFrameForX(x, 'right')
    }
    if (y) {
      setFrameForY(y, 'right')
    }
  }

  const setLeftFrame = (x, y) => {
    if (x) {
      setFrameForX(x, 'left')
    }
    if (y) {
      setFrameForY(y, 'left')
    }
  }

  const resetAllForSide = (side) => {
    activeTouches[side] = null
    prevTouch[side].x = 0
    prevTouch[side].y = 0
    touchDiff[side].x = 0
    touchDiff[side].y = 0
    boatFrame[side] = 0
  }

  const handleNewTouch = (touchObject) => {
    if (!activeTouches.left && touchObject.pageX < SCREEN_MID_X) {
      activeTouches.left = touchObject
      prevTouch.left = { x: touchObject.pageX, y: touchObject.pageY }
    }

    if (!activeTouches.right && touchObject.pageX > SCREEN_MID_X) {
      activeTouches.right = touchObject
      prevTouch.right = { x: touchObject.pageX, y: touchObject.pageY }
    }
  }

  const handleRemovedTouch = (touchObject) => {
    if (activeTouches.left && activeTouches.left.identifier === touchObject.identifier) {
      resetAllForSide('left')
    }

    if (activeTouches.right && activeTouches.right.identifier === touchObject.identifier) {
      resetAllForSide('right')
    }
  }

  const handleMovedTouch = (touchObject) => {
    if (activeTouches.left && activeTouches.left.identifier === touchObject.identifier) {
      touchDiff.left.y += prevTouch.left.y - touchObject.pageY
      prevTouch.left.y = touchObject.pageY
      touchDiff.left.x += prevTouch.left.x - touchObject.pageX
      prevTouch.left.x = touchObject.pageX

      if (touchDiff.left.x >= 40 || touchDiff.left.x <= -40) {
        setLeftFrame(touchDiff.left.x, undefined)
        touchDiff.left.x = 0
      }

      if (touchDiff.left.y >= 20 || touchDiff.left.y <= -20) {
        setLeftFrame(undefined, touchDiff.left.y)
        touchDiff.left.y = 0
      }
    }

    if (activeTouches.right && activeTouches.right.identifier === touchObject.identifier) {
      touchDiff.right.y += prevTouch.right.y - touchObject.pageY
      prevTouch.right.y = touchObject.pageY
      touchDiff.right.x += prevTouch.right.x - touchObject.pageX
      prevTouch.right.x = touchObject.pageX

      if (touchDiff.right.x >= 20 || touchDiff.right.x <= -20) {
        setRightFrame(touchDiff.right.x, undefined)
        touchDiff.right.x = 0
      }
      if (touchDiff.right.y >= 20 || touchDiff.right.y <= -20) {
        setRightFrame(undefined, touchDiff.right.y)
        touchDiff.right.y = 0
      }
    }
  }

  const handleTouchStart = (event) => {
    // console.log('Touch started', event)
    switch (event.changedTouches.length) {
      case 1:
        handleNewTouch(event.changedTouches[0])
        break
      case 2:
        handleNewTouch(event.changedTouches[0])
        handleNewTouch(event.changedTouches[1])
        break
      default:
    }
  }

  const handleTouchMove = (event) => {
    // console.log('Touch moved', event)
    switch (event.changedTouches.length) {
      case 1:
        handleMovedTouch(event.changedTouches[0])
        break
      case 2:
        handleMovedTouch(event.changedTouches[0])
        handleMovedTouch(event.changedTouches[1])
        break
      default:
    }
  }

  const handleTouchEnd = (event) => {
    // console.log('Touch ended', event)
    switch (event.changedTouches.length) {
      case 1:
        handleRemovedTouch(event.changedTouches[0])
        break
      case 2:
        handleRemovedTouch(event.changedTouches[0])
        handleRemovedTouch(event.changedTouches[1])
        break
      default:
    }
  }

  const handleTouchCancel = (event) => {
    console.log('Touch cancelled', event)
    activeTouches.left = null
    activeTouches.right = null
  }

  const registerButton = (element, button, actionOverride = null) => {
    buttonRegistry[button.name] = (event) => {
      if (event.changedTouches.length === 1) {
        const { pageX, pageY } = event.changedTouches[0]

        if (
          pageX > button.xMin
          && pageX < button.xMax
          && pageY > button.yMin
          && pageY < button.yMax
        ) {
          if (actionOverride) {
            actionOverride()
          }
          else {
            button.action(event)
          }
        }
      }
    }

    element.addEventListener('touchend', buttonRegistry[button.name])
  }

  const clearButton = (element, button) => {
    element.removeEventListener('touchend', buttonRegistry[button.name])

    delete buttonRegistry[button.name]
  }

  return {
    init: (el, sound) => {
      setMainTouchEl(el)
      setOarSound(sound)
    },
    getMainTouchEl,
    registerBoatControls: (element) => {
      const attachToEl = element || getMainTouchEl()

      attachToEl.addEventListener('touchstart', handleTouchStart)
      attachToEl.addEventListener('touchmove', handleTouchMove)
      attachToEl.addEventListener('touchend', handleTouchEnd)
      attachToEl.addEventListener('touchcancel', handleTouchCancel)
    },
    clearBoatControls: (element) => {
      const attachToEl = element || getMainTouchEl()

      attachToEl.removeEventListener('touchstart', handleTouchStart)
      attachToEl.removeEventListener('touchmove', handleTouchMove)
      attachToEl.removeEventListener('touchend', handleTouchEnd)
      attachToEl.removeEventListener('touchcancel', handleTouchCancel)
    },
    activeTouches: () => activeTouches,
    boatFrame: () => boatFrame,
    createMockTouchObject,
    handleNewTouch,
    handleMovedTouch,
    handleRemovedTouch,
    registerButton,
    clearButton,
  }
}
/* #endregion */

/* #region BOAT */
boat.init = (ctx, scaleFx, strokePower, maxVelocity, waterFriction, startCoords) => {
  boat.context = ctx
  boat.height = BOAT_SPRITE_HEIGHT
  boat.width = BOAT_SPRITE_WIDTH / 7
  boat.leftImage = new Image()
  boat.rightImage = new Image()
  boat.leftImage.src = boatLeftSheet
  boat.rightImage.src = boatRightSheet
  boat.startingX = startCoords.x
  boat.scaleFx = scaleFx
  boat.x = startCoords.x
  boat.y = startCoords.y
  boat.opacity = 1
  boat.leftSprite = makeSprite({
    context: ctx, width: BOAT_SPRITE_WIDTH, height: BOAT_SPRITE_HEIGHT, image: boat.leftImage, numberOfFrames: 7, loop: true, ticksPerFrame: 5, x: 0, y: 0,
  })
  boat.rightSprite = makeSprite({
    context: ctx, width: BOAT_SPRITE_WIDTH, height: BOAT_SPRITE_HEIGHT, image: boat.rightImage, numberOfFrames: 7, loop: true, ticksPerFrame: 5, x: 12, y: 0,
  })
  boat.resetVelocity()
  boat.drift = 0
  boat.sameSideStrokes = 0
  boat.lastSameSideStroke = 0
  boat.maxVelocity = maxVelocity
  boat.strokePower = strokePower
  boat.waterFriction = waterFriction
  boat.lastStrokeUpdate = undefined
  boat.isStuck = false
}

boat.renderLivesLeft = (collisions) => {
  const atY = 32
  const loops = 8 - collisions > 0 ? 8 - collisions : 0
  let evens = 0
  let odds = 0

  boat.context.save()
  boat.context.globalAlpha = 0.7
  for (let i = 0; i < loops; i += 1) {
    if (i % 2 === 0) {
      boat.context.drawImage(
        boat.leftImage, 0, 0, 12, 14, 16 + (evens * 24) + (evens * 2), atY, 12, 14,
      )
      evens += 1
    }
    else {
      boat.context.drawImage(
        boat.rightImage, 0, 0, 12, 14, 28 + (odds * 24) + (odds * 2), atY, 12, 14,
      )
      odds += 1
    }
  }
  boat.context.restore()
}

boat.setStuck = () => {
  console.log('Stuck set...')
  boat.isStuck = true
}

boat.setUnstuck = () => {
  if (boat.isStuck) {
    console.log('UNStuck set...')
    boat.isStuck = false
  }
}

boat.updateStrokePower = (difficulty) => {
  boat.strokePower = STROKE_POWER + (STROKE_INCREASE * difficulty)
}

boat.getBoatBodyDimensions = () => ({
  minY: boat.y,
  maxX: boat.x + 17,
  maxY: boat.y + boat.height,
  minX: boat.x + 8,
})

boat.resetVelocity = () => {
  boat.velocity = 0
}

boat.setFrames = (frameObj) => {
  if (
    boat.leftSprite.currentFrame() !== frameObj.left
      && boat.rightSprite.currentFrame() !== frameObj.right
  ) {
    boat.sameSideStrokes = 0
  }
  if (boat.leftSprite.currentFrame() !== frameObj.left) {
    boat.addVelocity(frameObj.left)
    boat.addDrift(frameObj.left, 1)
  }
  boat.leftSprite.goToFrame(frameObj.left)

  if (boat.rightSprite.currentFrame() !== frameObj.right) {
    boat.addVelocity(frameObj.right)
    boat.addDrift(frameObj.right, -1)
  }
  boat.rightSprite.goToFrame(frameObj.right)
}

boat.checkOarAlignment = () => {
  // console.log('Checking oar alignment...')
  if (boat.x === boat.startingX) {
    console.log('Resetting oars...')
    boat.leftSprite.goToFrame(0).resetTickCount()
    boat.rightSprite.goToFrame(0).resetTickCount()
    boat.rightSprite.update()
    boat.leftSprite.update()
    boat.oarsOffset = false
  }
}

boat.justRow = () => {
  if (boat.x !== boat.startingX) {
    if (boat.drift !== 0) {
      boat.drift = 0
    }
    boat.oarsOffset = true

    // console.log('Just rowing...', boat.x, boat.startingX)

    if (boat.x - boat.startingX > 1) {
      // console.log('Going right')
      boat.x -= 0.25
      boat.rightSprite.update()
    }
    else if (boat.x - boat.startingX < -1) {
      // console.log('Going left')
      boat.x += 0.25
      boat.leftSprite.update()
    }
    else {
      boat.x = boat.startingX
      // console.log('Resetting X', boat.x, boat.startingX)
    }
  }
  else {
    if (boat.oarsOffset) {
      // console.log('Fixing offset oars!')
      boat.x = boat.startingX
      boat.leftSprite.goToFrame(0).resetTickCount()
      boat.rightSprite.goToFrame(0).resetTickCount()
      boat.oarsOffset = false
    }

    boat.rightSprite.update()
    boat.leftSprite.update()
  }

  boat.render()
}

boat.isOarInWater = (frame) => frame > 2 && frame < 6

boat.isSameSideRowing = () => Math.abs(boat.sameSideStrokes) > 3

boat.addVelocity = (frame) => {
  if (frame) {
    if (
      boat.isOarInWater(frame)
        && boat.velocity <= boat.maxVelocity
        && !boat.isSameSideRowing()
    ) {
      boat.setUnstuck()
      boat.velocity += boat.strokePower
      boat.lastStrokeUpdate = Date.now()
    }
  }
}

boat.bounceLeft = () => {
  boat.drift = -0.066
}

boat.bounceRight = () => {
  boat.drift = 0.066
}

boat.addDrift = (frame, direction) => {
  if (boat.isSameSideRowing()) {
    boat.lastSameSideStroke = Date.now()
  }
  else {
    boat.sameSideStrokes += direction
  }

  if (frame) {
    if (boat.isOarInWater(frame)) {
      boat.drift += boat.strokePower * direction
    }
  }
}

boat.applyWaterFriction = () => {
  const now = Date.now()

  if (now - boat.lastSameSideStroke > 500 && boat.drift !== 0) {
    if (boat.drift > 0) {
      boat.drift -= boat.waterFriction
      if (boat.drift < 0) {
        boat.drift = 0
      }
    }
    if (boat.drift < 0) {
      boat.drift += boat.waterFriction
      if (boat.drift > 0) {
        boat.drift = 0
      }
    }
  }

  if (boat.isStuck) {
    boat.velocity = -(RIVER_SPEED * 2)
    // console.log('Is stuck...', boat.velocity)
  }
  else if (now - boat.lastStrokeUpdate > 500 && boat.velocity > 0) {
    // console.log('Friction unstuck...')
    boat.setUnstuck()
    boat.velocity -= boat.waterFriction
    if (boat.velocity < 0) {
      boat.resetVelocity()
    }
  }
}

boat.runFrameUpdate = () => {
  boat.render()
  boat.applyWaterFriction()
}

boat.checkForOutOfBounds = (x) => {
  if (x >= CANVAS_WIDTH - boat.width - 20) {
    boat.x = CANVAS_WIDTH - boat.width - 20
    boat.drift = 0
  }
  if (x <= 0 + 10) {
    boat.x = 10
    boat.drift = 0
  }
}

boat.render = () => {
  boat.x += boat.drift * 4

  boat.checkForOutOfBounds(boat.x)

  const roundX = Math.round(boat.x) // Math.round(boat.x / boat.scaleFx)
  const roundY = Math.round(boat.y) // Math.round(boat.y / boat.scaleFx)
  const renderXOffset = 12

  boat.context.save()
  boat.leftSprite.render(roundX, roundY)
  boat.rightSprite.render(roundX + renderXOffset, roundY)

  boat.context.restore()
}

boat.fadeOut = () => {
  if (boat.velocity !== 0) {
    boat.resetVelocity()
  }
  if (boat.opacity > 0) {
    boat.context.save()
    boat.opacity -= 0.05
    boat.context.globalAlpha = boat.opacity

    // console.log('OP', boat.opacity)
    boat.render()
    boat.context.restore()
  }
}
/* #endregion */

/* #region RIVER */
river = {}
river.init = () => {
  river.bodyDimention = 27
  river.bodiesInRow = Math.ceil(CANVAS_WIDTH / river.bodyDimention)
  river.rowsInBodyColumn = Math.ceil(CANVAS_HEIGHT / river.bodyDimention) + 2
  river.borderXDimension = 25
  river.borderYDimension = 240
  river.bordersInColumn = 3
  river.bordersLeft = []
  river.bordersRight = []
  river.borderImage = new Image()
  river.borderImage.src = borderSrc
  river.bodyImage = new Image()
  river.bodyImage.src = bodySrc
  river.current = RIVER_SPEED
  river.bodyColumns = []
  river.maxBodyTileY = 0
  river.minBodyTileY = 0
  river.makeBorderLeft()
  river.makeBorderRight()
  river.makeBodySprites()
}

river.reset = () => {
  river.current = RIVER_SPEED
}

river.getRenderAdjustAmount = (velocity) => (river.current * 2) + velocity

/**
   * BORDER methods
   */
river.getBorderBasePositions = () => ({
  left: {
    x: 0,
    y: -river.borderXDimension,
  },
  right: {
    x: -river.borderYDimension,
    y: CANVAS_WIDTH - river.borderXDimension,
  },
})

river.getLeftBorderYPos = (yPos, index) => (yPos + ((index - 1) * river.borderYDimension))

river.getRightBorderYPos = (yPos, index) => (yPos + ((index - 1) * river.borderYDimension))

river.makeBorderLeft = () => {
  const startPos = river.getBorderBasePositions()

  river.makeBorderSprites(startPos.left.x, startPos.left.y, 90, river.bordersLeft)
}

river.makeBorderRight = () => {
  const startPos = river.getBorderBasePositions()

  river.makeBorderSprites(startPos.right.x, startPos.right.y, -90, river.bordersRight)
}

river.makeBorderSprites = (xPos, yPos, rotation, arr) => {
  for (let i = 0; i < river.bordersInColumn; i += 1) {
    const sprite = river.makeBorderSprite(xPos, yPos, rotation, i)

    // console.log('Made sprite, sprite y', sprite.y)
    // console.log('Made sprite, sprite X', sprite.x)
    arr.push(sprite)
  }
}

river.makeBorderSprite = (xPos, yPos, rotation, i) => {
  let x
  let y

  if (Math.abs(rotation) === rotation) {
    y = yPos
    x = river.getLeftBorderYPos(xPos, i)
    // console.log('LEFT sprite', x, y, xPos, i)
  }
  else {
    y = yPos
    x = river.getRightBorderYPos(xPos, i)
    // console.log('LEFT sprite', x, y, xPos, i)
  }

  return makeSprite(
    {
      context: ctx,
      width: river.borderYDimension,
      height: river.borderXDimension,
      image: river.borderImage,
      numberOfFrames: 0,
      x, // this is actually the Y value ... rotation ...
      y, // this is actually the X value ... rotation ...
      rotation,
    },
  )
}

river.addBordersAbove = () => {
  const startPos = river.getBorderBasePositions()

  river.bordersLeft.unshift(river.makeBorderSprite(startPos.left.x, startPos.left.y, 90, 0))
  river.bordersRight.push(river.makeBorderSprite(startPos.right.x, startPos.right.y, -90, 2))

  if (river.bordersLeft.length > 4) {
    river.bordersLeft.splice(river.bordersLeft.length - 1, 1)
  }
  if (river.bordersRight.length > 4) {
    river.bordersRight.splice(0, 1)
  }

  console.log('Added above ... ', river.bordersLeft.length, river.bordersRight.length)
}

river.addBordersBelow = () => {
  const startPos = river.getBorderBasePositions()

  river.bordersLeft.push(river.makeBorderSprite(startPos.left.x, startPos.left.y, 90, 2))
  river.bordersRight.unshift(river.makeBorderSprite(startPos.right.x, startPos.right.y, -90, 0))

  if (river.bordersLeft.length > 4) {
    river.bordersLeft.splice(0, 1)
  }
  if (river.bordersRight.length > 4) {
    river.bordersRight.splice(river.bordersRight.length - 1, 1)
  }

  console.log('Added below ... ', river.bordersLeft.length, river.bordersRight.length)
}

/**
   * BODY methods
   */
river.getBodySpriteYPos = (index) => ((index * river.bodyDimention) - river.bodyDimention)

river.makeBodySprites = () => {
  for (let i = 0; i < river.rowsInBodyColumn; i += 1) {
    if (i === 0) {
      river.minBodyTileY = river.getBodySpriteYPos(i)
    }
    if (i === river.rowsInBodyColumn - 1) {
      river.maxBodyTileY = river.getBodySpriteYPos(i)
    }

    river.bodyColumns.push(river.makeSpriteRow(i))
  }

  console.log('BODY COLUMNS', river.bodyColumns)
}

river.makeSpriteRow = (index) => {
  const spriteRow = []

  for (let n = 0; n < river.bodiesInRow; n += 1) {
    const x = n * river.bodyDimention
    const y = river.getBodySpriteYPos(index)
    const sprite = makeSprite(
      {
        context: ctx,
        width: 135,
        height: river.bodyDimention,
        image: river.bodyImage,
        numberOfFrames: 5,
        x,
        y,
      },
    )

    sprite.goToFrame(random(0, 4))
    spriteRow.push(sprite)
  }

  return spriteRow
}

river.unshiftRowToColumns = () => {
  // Add new row at start. Remove row at end.
  river.bodyColumns.unshift(river.makeSpriteRow(0))
  if (river.bodyColumns.length > river.rowsInBodyColumn + 2) {
    river.bodyColumns.splice(river.bodyColumns.length - 1, 1)
  }
}

river.pushRowToColumns = () => {
  // Add new row at end, remove row at start.
  river.bodyColumns.push(river.makeSpriteRow(river.rowsInBodyColumn - 1))
  if (river.bodyColumns.length > river.rowsInBodyColumn + 2) {
    river.bodyColumns.shift()
  }
}

/**
    * GENERAL methods
    */
river.render = (velocity) => {
  river.renderBody(velocity)
  river.renderBorder(velocity)
}

river.renderBody = (velocity) => {
  console.log('BODY COLUMNS', river.bodyColumns[river.bodyColumns.length - 1])
  const maxY = river.bodyColumns[river.bodyColumns.length - 1][0].y
  const minY = river.bodyColumns[0][0].y

  if (maxY < river.maxBodyTileY - river.bodyDimention) {
    river.pushRowToColumns(maxY, river.minBodyTileY + river.bodyDimention)
  }
  else if (minY > river.minBodyTileY + river.bodyDimention) {
    river.unshiftRowToColumns(river.maxBodyTileY - river.bodyDimention)
  }

  for (let i = 0; i < river.bodyColumns.length; i += 1) {
    for (let n = 0; n < river.bodiesInRow; n += 1) {
      const sprite = river.bodyColumns[i][n]

      sprite.y -= river.getRenderAdjustAmount(velocity) + 0.15

      river.bodyColumns[i][n].render()
    }
  }
}

river.renderBorder = (velocity) => {
  if (river.bordersLeft[0].x >= 0) {
    river.addBordersAbove()
  }
  if (river.bordersLeft[river.bordersLeft.length - 1].x <= 0) {
    river.addBordersBelow()
  }

  for (let i = 0; i < river.bordersLeft.length; i += 1) {
    // Unshift LEFT at GREATER THAN 0
    // Push LEFT at LESS THAN 0
    const sprite = river.bordersLeft[i]

    sprite.x -= river.getRenderAdjustAmount(velocity)
    sprite.render()
  }
  for (let i = 0; i < river.bordersRight.length; i += 1) {
    // Unshift RIGHT at LESS THAN -720
    // Push RIGHT at GREATER THAN 240
    const sprite = river.bordersRight[i]

    sprite.x += river.getRenderAdjustAmount(velocity)
    sprite.render()
  }
}
/* #endregion */

/* #region TUTORIAL */
tutorial = {}

tutorial.init = (ctx, controls) => {
  tutorial.ctx = ctx
  tutorial.controls = controls
  tutorial.thumbImage = new Image()
  tutorial.thumbImage.src = thumbPath
  tutorial.thumbWidth = 17
  tutorial.thumbHeight = 35
  tutorial.running = false
  tutorial.thumbSpeed = undefined
  tutorial.cTS = 0
  tutorial.cookieName = 'tutorial'
  tutorial.hasBeenSeen = getCookie(tutorial.cookieName)
  let step1
  let step2
  let step3
  let step4

  tutorial.steps = [step1, step2, step3, step4]
  tutorial.setSlowThumbspeed()

  tutorial.backBtn = new Button(
    '< Back',
    tutorial.ctx.measureText('< Back').width,
    tutorial.ctx.measureText('L').width,
    CANVAS_WIDTH / 2,
    CANVAS_HEIGHT / 5,
    () => {
      console.log('BACK BUTTON PRESSED!')
    },
    { fontSize: 20 },
  )
}

tutorial.leave = () => {
  tutorial.stopTutorial()
  tutorial.controls.clearButton(tutorial.controls.getMainTouchEl(), tutorial.backBtn)
}

tutorial.setSlowThumbspeed = () => {
  tutorial.thumbSpeed = 2
}

tutorial.setFastThumbspeed = () => {
  tutorial.thumbSpeed = 6
}

tutorial.initRightThumb = () => {
  tutorial.rightThumb = makeSprite({
    context: tutorial.ctx,
    width: tutorial.thumbWidth,
    height: tutorial.thumbHeight,
    image: tutorial.thumbImage,
    numberOfFrames: 1,
    loop: false,
    ticksPerFrame: 0,
    x: 0,
    y: 0,
  })

  tutorial.rTX = CANVAS_WIDTH - tutorial.thumbWidth - (CANVAS_WIDTH / 3)
  tutorial.rTY = CANVAS_HEIGHT - tutorial.thumbHeight - 10
  tutorial.currentRightThumbStep = 0
  tutorial.rightThumbPath = {
    0: tutorial.rTY,
    1: tutorial.rTY - 50,
    2: tutorial.rTX + 30,
    3: tutorial.rTY,
    4: tutorial.rTX,
  }
  tutorial.rtMockControl = tutorial.controls.createMockTouchObject(
    'rt',
    // This math is because the `rThumbX value is relative to the original, un-scaled canvas.
    // It has to be scaled, and adjusted to be correct relative to the MID-X that the controls use
    // which is the middle of the viewport
    (tutorial.rTX * SCALE_FACTOR)
      + ((SCREEN_WIDTH - SCALED_WIDTH) / 2),
    tutorial.rTY * SCALE_FACTOR,
  )
  tutorial.controls.handleNewTouch(tutorial.rtMockControl)
}

tutorial.initLeftThumb = () => {
  tutorial.leftThumb = makeSprite({
    context: tutorial.ctx,
    width: tutorial.thumbWidth,
    height: tutorial.thumbHeight,
    image: tutorial.thumbImage,
    numberOfFrames: 1,
    loop: false,
    ticksPerFrame: 0,
    x: 0,
    y: 0,
  })

  tutorial.lTX = 0 + (CANVAS_WIDTH / 3)
  tutorial.lTY = CANVAS_HEIGHT - tutorial.thumbHeight - 10

  tutorial.currentLeftThumbStep = 0
  tutorial.leftThumbPath = {
    0: tutorial.lTY,
    1: tutorial.lTY - 50,
    2: tutorial.lTX - 30,
    3: tutorial.lTY,
    4: tutorial.lTX,
  }
  tutorial.ltMockControl = tutorial.controls.createMockTouchObject(
    'lt',
    // See note above on what this math is doing
    (tutorial.lTX * SCALE_FACTOR)
      + ((SCREEN_WIDTH - SCALED_WIDTH) / 2),
    tutorial.lTY * SCALE_FACTOR,
  )
  tutorial.controls.handleNewTouch(tutorial.ltMockControl)
}

tutorial.removeThumbs = () => {
  tutorial.controls.handleRemovedTouch(tutorial.rtMockControl)
  tutorial.controls.handleRemovedTouch(tutorial.ltMockControl)
}

tutorial.circleRightThumb = () => {
  switch (tutorial.currentRightThumbStep) {
    case 0:
      if (tutorial.rTY > tutorial.rightThumbPath[1]) {
        tutorial.rTY -= tutorial.thumbSpeed
      }
      else {
        tutorial.currentRightThumbStep = 1
      }
      break
    case 1:
      if (tutorial.rTX < tutorial.rightThumbPath[2]) {
        tutorial.rTX += tutorial.thumbSpeed
      }
      else {
        tutorial.currentRightThumbStep = 2
      }
      break
    case 2:
      if (tutorial.rTY < tutorial.rightThumbPath[3]) {
        tutorial.rTY += tutorial.thumbSpeed
      }
      else {
        tutorial.currentRightThumbStep = 3
      }
      break
    case 3:
      if (tutorial.rTX > tutorial.rightThumbPath[4]) {
        tutorial.rTX -= tutorial.thumbSpeed
      }
      else {
        tutorial.currentRightThumbStep = 4
      }
      break
    case 4:
      tutorial.currentRightThumbStep = 0
      break
    default:
      break
  }
  tutorial.rtMockControl.pageX = tutorial.rTX * CANVAS_RATIO
  tutorial.rtMockControl.pageY = tutorial.rTY * CANVAS_RATIO
  tutorial.controls.handleMovedTouch(tutorial.rtMockControl)
}

tutorial.circleLeftThumb = () => {
  switch (tutorial.currentLeftThumbStep) {
    case 0:
      if (tutorial.lTY > tutorial.leftThumbPath[1]) {
        tutorial.lTY -= tutorial.thumbSpeed
      }
      else {
        tutorial.currentLeftThumbStep = 1
      }
      break
    case 1:
      if (tutorial.lTX > tutorial.leftThumbPath[2]) {
        tutorial.lTX -= tutorial.thumbSpeed
      }
      else {
        tutorial.currentLeftThumbStep = 2
      }
      break
    case 2:
      if (tutorial.lTY < tutorial.leftThumbPath[3]) {
        tutorial.lTY += tutorial.thumbSpeed
      }
      else {
        tutorial.currentLeftThumbStep = 3
      }
      break
    case 3:
      if (tutorial.lTX < tutorial.leftThumbPath[4]) {
        tutorial.lTX += tutorial.thumbSpeed
      }
      else {
        tutorial.currentLeftThumbStep = 4
      }
      break
    case 4:
      tutorial.currentLeftThumbStep = 0
      break
    default:
      break
  }
  tutorial.ltMockControl.pageX = tutorial.lTX * CANVAS_RATIO
  tutorial.ltMockControl.pageY = tutorial.lTY * CANVAS_RATIO
  tutorial.controls.handleMovedTouch(tutorial.ltMockControl)
}

tutorial.renderTutorial = () => {
  tutorial.backBtn.render(tutorial.ctx)

  if (!tutorial.isPaused) {
    if (tutorial.cTS === 1
        || tutorial.cTS === 3
        || tutorial.cTS === 4
    ) {
      tutorial.circleLeftThumb()
      tutorial.leftThumb.render(
        tutorial.lTX,
        tutorial.lTY,
      )
    }
    if (tutorial.cTS === 1
        || tutorial.cTS === 2
        || tutorial.cTS === 4
    ) {
      tutorial.circleRightThumb()
      tutorial.rightThumb.render(
        tutorial.rTX,
        tutorial.rTY,
      )
    }
  }
}

tutorial.runTutorialSteps = () => {
  tutorial.initRightThumb()
  tutorial.initLeftThumb()
  tutorial.hasBeenSeen = 1
  setCookie(tutorial.cookieName, 1)
  tutorial.running = true
  infoDisplay.show()
  // first show both thumbs rowing slowly
  tutorial.setTutorialStep(1)
  infoDisplay.setMessage('Circle thumbs to row!')
  // then show just right thumb
  tutorial.steps[0] = setTimeout(() => {
    tutorial.setTutorialStep(2)
    infoDisplay.setMessage('R thumb - R oar!')
  }, TUTORIAL_SCREEN_DURATION * 1)
  // then show just left thumb
  tutorial.steps[1] = setTimeout(() => {
    tutorial.setTutorialStep(3)
    infoDisplay.setMessage('L thumb - L oar!')
  }, TUTORIAL_SCREEN_DURATION * 2)
  // then show just left thumb
  tutorial.steps[2] = setTimeout(() => {
    tutorial.setTutorialStep(4)
    tutorial.setFastThumbspeed()
    infoDisplay.setMessage('Row fast to go go go!')
  }, TUTORIAL_SCREEN_DURATION * 3)
  tutorial.steps[3] = setTimeout(() => {
    tutorial.stopTutorial()
  }, TUTORIAL_SCREEN_DURATION * 4)
}

tutorial.stopTutorial = () => {
  tutorial.setTutorialStep(0)
  tutorial.steps.forEach((step, i) => {
    console.log('Step?', i, step)
    if (step) {
      clearTimeout(step)
    }
  })
  tutorial.setSlowThumbspeed()
  infoDisplay.setMessage('')
  tutorial.removeThumbs()
  infoDisplay.hide()
  tutorial.running = false
}

tutorial.setTutorialStep = (step) => {
  tutorial.cTS = step
}

/* #endregion */

/**
 * Set the event listener that will load the game
 */
window.addEventListener('load', () => {
  console.log('-- window _ load --')

  initializeGame(mainLoop)
})
/* eslint-enable */
