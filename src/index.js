/* eslint-disable */
/**
 * IMPORT STATEMENTS
 */
import boatLeftSheet from './assets/images/sprites/boat-shadow-sprite-left.png'
import boatRightSheet from './assets/images/sprites/boat-shadow-sprite-right.png'
import borderSrc from './assets/images/sprites/river-border-horizontal-stone.png'
import treeSrc from './assets/images/sprites/tree-sprite.png'
import rockSrc from './assets/images/sprites/rock-sprite.png'
import bodySrc from './assets/images/sprites/river-body.png'
import thumbPath from './assets/images/sprites/thumb.png'

/* #region UTILITY */
const random = (min, max) => Math.floor(Math.random() * (max - min + 1) + min)

function setCookie(name, value) {
  document.cookie = `${name}=${value}`
}

function getCookie(name) {
  const regex = new RegExp(`(?:(?:^|.*;\\s*)${name}\\s*\\=\\s*([^;]*).*$)|^.*$`)

  return document.cookie.replace(regex, '$1')
}
/* #endregion */

/* #region CONSTANTS */
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
let TUTORIAL_SCREEN_DURATION = 4000
let QUIT_TEXT = '<QUIT(Q)'
let PAUSE_TEXT = 'PAUSE(P)'
let BACK_TEXT = '<BACK(B)'
let TUT_TEXT = 'TUTORIAL(T)'
let PLAY_TEXT = 'PLAY(P)'
let LKB_TEXT = '(A S D F)'
let RKB_TEXT = '(; L K J)'
let USING_KEYBOARD = false

// let CANVAS_MID_X =  undefined
// let CANVAS_MID_Y =  undefined
// let SCREEN_MID_Y =  undefined
let CANVAS_WIDTH =  undefined
let CANVAS_HEIGHT =  undefined
let SCREEN_WIDTH =  undefined
let SCREEN_HEIGHT =  undefined
let SCREEN_MID_X =  undefined
let SCALE_FACTOR =  undefined
let SCALED_WIDTH =  undefined
let SCALED_HEIGHT =  undefined

let DEEP = 440 / 6
let OAR = 440 * 3
let OAR2 = 440 * 4
let A4 = 440
let C4 = A4 * (2 ** (2 / 12))
let D4 = A4 * (2 ** (4 / 12))
let E4 = A4 * (2 ** (6 / 12))
let F4 = A4 * (2 ** (7 / 12))
let G4 = A4 * (2 ** (9 / 12))
let C5 = A4 * (2 ** (14 / 12))
/* #endregion */

/**
 * World/distance vars
 */
let distanceMoved, distanceFromStart, totalDistanceRowed, isRunning

/**
 * Other var setup ...
 */
// let world,
let home, tutorial, control, game, controls, __boat, river,
    obstacleManager, collisionManager, paused = false,
    makeTree, makeRock, makeButton, makeSprite, sound, infoDisplay,
    handleKeyboardControl

__boat = {}
home = {}
collisionManager = {}
obstacleManager = {}
sound = {}
infoDisplay = {}

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

// localStorage.removeItem('highscore')

let hs = localStorage.getItem('highscore')

console.log('HIGH SCORE', hs)

const updateHs = (score) => {
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

/* #region DOM / EVENT */
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

/* #endregion */


function initGameClasses() {
  // world = new World(ctx, sound.end.bind(sound))

  home.init(hs)

  // console.log('Set game', sound)
  game.init(ctx, controls, goToTitle, sound)

  tutorial.init(ctx, controls)

  __boat.init(
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

  collisionManager.setup(__boat)

  // waterfall = new Waterfall(ctx, RIVER_SPEED)

  obstacleManager.init(ctx)
}

function titleLoop() {
  _world_calculatePositions(river, __boat)
  river.renderBody(__boat.velocity + 0.35)
  __boat.justRow()
  river.renderBorder(__boat.velocity + 0.35)
  home.renderMainScreen()
}

// function goToMenu() {
//   gameState = gameStates.title
// }

function tutorialLoop() {
  _world_calculatePositions(river, __boat)
  river.renderBody(__boat.velocity + 0.1)
  // I think there is lingering velocity after the tutorial ends?
  // TODO: check on above.
  __boat.setFrames(controls.boatFrame())
  __boat.runFrameUpdate()
  river.renderBorder(__boat.velocity)
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

    _world_calculatePositions(river, __boat, gameState)

    river.renderBody(__boat.velocity)

    // drawDebug(ctx, world)

    obstacleManager.trySpawnObstacle(totalDistanceRowed, game.difficulty)

    obstacleManager.render(__boat.velocity)

    __boat.setFrames(controls.boatFrame())

    __boat.runFrameUpdate()

    __boat.updateStrokePower(game.difficulty)

    collisionManager.broadPhaseCheck(__boat, obstacleManager.obstacles)

    river.renderBorder(__boat.velocity)

    game.render(totalDistanceRowed)

    __boat.renderLivesLeft(collisionManager.collisions)

    updateHs(totalDistanceRowed)
  }
}

function gameOverLoop() {
  if (river.current !== 0) {
    river.current = 0
  }

  _world_calculatePositions(river, __boat)

  river.render(0)

  obstacleManager.render(-(RIVER_SPEED * 2))

  __boat.fadeOut()

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

  __boat.checkOarAlignment()

  if (gameState === gameStates.game || gameState === gameStates.gameOver) {
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
  // SCREEN_MID_Y = SCREEN_HEIGHT / 2
  // CANVAS_MID_X = Math.round(SCALED_WIDTH / 2)
  // CANVAS_MID_Y = SCALED_HEIGHT / 2
  CANVAS_WIDTH = canvas.width
  CANVAS_HEIGHT = canvas.height
  SCREEN_WIDTH = window.innerWidth
  SCREEN_HEIGHT = window.innerHeight
  SCREEN_MID_X = SCREEN_WIDTH / 2
  SCALED_WIDTH = Math.round(SCREEN_HEIGHT / CANVAS_RATIO)
  SCALED_HEIGHT = SCREEN_HEIGHT
  SCALE_FACTOR = SCALED_HEIGHT / canvas.height


  // console.log('CONSTANTS', CONSTANTS)

  fitCanvasToScreen()

  canvas.style.backgroundColor = '#0e52ce'
  canvas.style.imageRendering = 'pixelated'

  controls = control()
  controls.init(body, sound.oar.bind(sound))

  collisionManager.init(ctx, sound.bump.bind(sound))

  initGameClasses()

  infoDisplay.setup(wrapper, canvas, SCALED_WIDTH)

  river.init()

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

/* #region WORLD */
function _world_calculatePositions(river, __boat, state) {
  const { current } = river
  const { velocity } = __boat

  const distMod = ((current * 2) + velocity)

  if (isRunning) {
    distanceMoved = distanceMoved - distMod
    distanceFromStart = distanceMoved
    totalDistanceRowed = distMod > 0
      ? totalDistanceRowed + distMod
      : totalDistanceRowed
  }

  if (state === 'game' && __boat.y - distanceFromStart < 0) {
    isRunning = false
  }
}
/* #endregion */

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
          if (gameState === gameStates.game) {
            oarSound()
          }
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
    // console.log('NEW TOUCH!')
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
    // console.log('REMOVED TOUCH!')
    if (activeTouches.left && activeTouches.left.identifier === touchObject.identifier) {
      resetAllForSide('left')
    }

    if (activeTouches.right && activeTouches.right.identifier === touchObject.identifier) {
      resetAllForSide('right')
    }
  }

  const handleMovedTouch = (touchObject) => {
    // console.log('MOVED TOUCH!')
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
    // console.log('Touch cancelled', event)
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

      resetAllForSide('left')
      resetAllForSide('right')

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
    setFrameForX,
    setFrameForY,
  }
}

handleKeyboardControl = (event) => {
  const {code} = event

  if (!USING_KEYBOARD) {
    USING_KEYBOARD = true
    STROKE_POWER *= 4
  }

  console.log('keydown', code)

  if (gameState === gameStates.game || gameState === gameStates.tutorial) {
    console.log('In game', code)
    switch(code) {
      case 'Semicolon':
          controls.setFrameForY(10, 'right')
          controls.setFrameForY(10, 'right')
          controls.setFrameForY(10, 'right')
          break
      case 'KeyL':
          controls.setFrameForX(-10, 'right')
          break
      case 'KeyK':
          controls.setFrameForY(-10, 'right')
          controls.setFrameForY(-10, 'right')
          controls.setFrameForY(-10, 'right')
          break
          case 'KeyJ':
            controls.setFrameForX(10, 'right')
          break
      case 'KeyA':
          controls.setFrameForY(10, 'left')
          controls.setFrameForY(10, 'left')
          controls.setFrameForY(10, 'left')
      break
      case 'KeyS':
          controls.setFrameForX(10, 'left')
      break
      case 'KeyD':
          controls.setFrameForY(-10, 'left')
          controls.setFrameForY(-10, 'left')
          controls.setFrameForY(-10, 'left')
      break
      case 'KeyF':
          controls.setFrameForX(-10, 'left')
      break
    }
  }
  if (gameState === gameStates.game) {
    switch(code) {
      case 'KeyQ':
        goToTitle()
        break  
      case 'KeyP':
        game.paused = !game.paused
        break  
      }
  }
  if (gameState === gameStates.title) {
    console.log('In title', code)
    switch(code) {
      case 'KeyP':
        sound.song()
        goToGame()
        break
      case 'KeyT':
        goToTutorial()
        break
    }
  }
  if (gameState === gameStates.tutorial) {
    switch(code) {
      case 'KeyB':
        tutorial.leave()

      break
    }
  }
  if (gameState === gameStates.gameOver) {
    switch(code) {
      case 'KeyQ':
        goToTitle()
      break
    }
  }
}
/* #endregion */

/* #region BOAT */
__boat.init = (ctx, scaleFx, strokePower, maxVelocity, waterFriction, startCoords) => {
  __boat.context = ctx
  __boat.height = BOAT_SPRITE_HEIGHT
  __boat.width = BOAT_SPRITE_WIDTH / 7
  __boat.leftImage = new Image()
  __boat.rightImage = new Image()
  __boat.leftImage.src = boatLeftSheet
  __boat.rightImage.src = boatRightSheet
  __boat.startingX = startCoords.x
  __boat.scaleFx = scaleFx
  __boat.x = startCoords.x
  __boat.y = startCoords.y
  __boat.opacity = 1
  __boat.leftSprite = makeSprite({
    context: ctx, width: BOAT_SPRITE_WIDTH, height: BOAT_SPRITE_HEIGHT, image: __boat.leftImage, numberOfFrames: 7, loop: true, ticksPerFrame: 5, x: 0, y: 0,
  })
  __boat.rightSprite = makeSprite({
    context: ctx, width: BOAT_SPRITE_WIDTH, height: BOAT_SPRITE_HEIGHT, image: __boat.rightImage, numberOfFrames: 7, loop: true, ticksPerFrame: 5, x: 12, y: 0,
  })
  __boat.resetVelocity()
  __boat.drift = 0
  __boat.sameSideStrokes = 0
  __boat.lastSameSideStroke = 0
  __boat.maxVelocity = maxVelocity
  __boat.strokePower = strokePower
  __boat.waterFriction = waterFriction
  __boat.lastStrokeUpdate = undefined
  __boat.isStuck = false
}

__boat.renderLivesLeft = (collisions) => {
  const atY = 32
  const loops = 8 - collisions > 0 ? 8 - collisions : 0
  let evens = 0
  let odds = 0

  __boat.context.save()
  __boat.context.globalAlpha = 0.7
  for (let i = 0; i < loops; i += 1) {
    if (i % 2 === 0) {
      __boat.context.drawImage(
        __boat.leftImage, 0, 0, 12, 14, 16 + (evens * 24) + (evens * 2), atY, 12, 14,
      )
      evens += 1
    }
    else {
      __boat.context.drawImage(
        __boat.rightImage, 0, 0, 12, 14, 28 + (odds * 24) + (odds * 2), atY, 12, 14,
      )
      odds += 1
    }
  }
  __boat.context.restore()
}

__boat.setStuck = () => {
  console.log('Stuck set...')
  __boat.isStuck = true
}

__boat.setUnstuck = () => {
  if (__boat.isStuck) {
    console.log('UNStuck set...')
    __boat.isStuck = false
  }
}

__boat.updateStrokePower = (difficulty) => {
  __boat.strokePower = STROKE_POWER + (STROKE_INCREASE * difficulty)
}

__boat.getBoatBodyDimensions = () => ({
  minY: __boat.y,
  maxX: __boat.x + 17,
  maxY: __boat.y + __boat.height,
  minX: __boat.x + 8,
})

__boat.resetVelocity = () => {
  __boat.velocity = 0
}

__boat.setFrames = (frameObj) => {
  if (
    __boat.leftSprite.currentFrame() !== frameObj.left
      && __boat.rightSprite.currentFrame() !== frameObj.right
  ) {
    __boat.sameSideStrokes = 0
  }
  if (__boat.leftSprite.currentFrame() !== frameObj.left) {
    __boat.addVelocity(frameObj.left)
    __boat.addDrift(frameObj.left, 1)
  }
  __boat.leftSprite.goToFrame(frameObj.left)

  if (__boat.rightSprite.currentFrame() !== frameObj.right) {
    __boat.addVelocity(frameObj.right)
    __boat.addDrift(frameObj.right, -1)
  }
  __boat.rightSprite.goToFrame(frameObj.right)
}

__boat.checkOarAlignment = () => {
  // console.log('Checking oar alignment...')
  if (__boat.x === __boat.startingX) {
    console.log('Resetting oars...')
    __boat.leftSprite.goToFrame(0).resetTickCount()
    __boat.rightSprite.goToFrame(0).resetTickCount()
    __boat.rightSprite.update()
    __boat.leftSprite.update()
    __boat.oarsOffset = false
  }
}

__boat.justRow = () => {
  if (__boat.x !== __boat.startingX) {
    if (__boat.drift !== 0) {
      __boat.drift = 0
    }
    __boat.oarsOffset = true

    // console.log('Just rowing...', __boat.x, __boat.startingX)

    if (__boat.x - __boat.startingX > 1) {
      // console.log('Going right')
      __boat.x -= 0.25
      __boat.rightSprite.update()
    }
    else if (__boat.x - __boat.startingX < -1) {
      // console.log('Going left')
      __boat.x += 0.25
      __boat.leftSprite.update()
    }
    else {
      __boat.x = __boat.startingX
      // console.log('Resetting X', __boat.x, __boat.startingX)
    }
  }
  else {
    if (__boat.oarsOffset) {
      // console.log('Fixing offset oars!')
      __boat.x = __boat.startingX
      __boat.leftSprite.goToFrame(0).resetTickCount()
      __boat.rightSprite.goToFrame(0).resetTickCount()
      __boat.oarsOffset = false
    }

    __boat.rightSprite.update()
    __boat.leftSprite.update()
  }

  __boat.render()
}

__boat.isOarInWater = (frame) => frame > 2 && frame < 6

__boat.isSameSideRowing = () => Math.abs(__boat.sameSideStrokes) > 3

__boat.addVelocity = (frame) => {
  if (frame) {
    if (
      __boat.isOarInWater(frame)
        && __boat.velocity <= __boat.maxVelocity
        && !__boat.isSameSideRowing()
    ) {
      __boat.setUnstuck()
      __boat.velocity += __boat.strokePower
      __boat.lastStrokeUpdate = Date.now()
    }
  }
}

__boat.bounceLeft = () => {
  __boat.drift = -0.066
}

__boat.bounceRight = () => {
  __boat.drift = 0.066
}

__boat.addDrift = (frame, direction) => {
  if (__boat.isSameSideRowing()) {
    __boat.lastSameSideStroke = Date.now()
  }
  else {
    __boat.sameSideStrokes += direction
  }

  if (frame) {
    if (__boat.isOarInWater(frame)) {
      __boat.drift += __boat.strokePower * direction
    }
  }
}

__boat.applyWaterFriction = () => {
  const now = Date.now()

  if (now - __boat.lastSameSideStroke > 500 && __boat.drift !== 0) {
    if (__boat.drift > 0) {
      __boat.drift -= __boat.waterFriction
      if (__boat.drift < 0) {
        __boat.drift = 0
      }
    }
    if (__boat.drift < 0) {
      __boat.drift += __boat.waterFriction
      if (__boat.drift > 0) {
        __boat.drift = 0
      }
    }
  }

  if (__boat.isStuck) {
    __boat.velocity = -(RIVER_SPEED * 2)
    // console.log('Is stuck...', __boat.velocity)
  }
  else if (now - __boat.lastStrokeUpdate > 500 && __boat.velocity > 0) {
    // console.log('Friction unstuck...')
    __boat.setUnstuck()
    __boat.velocity -= __boat.waterFriction
    if (__boat.velocity < 0) {
      __boat.resetVelocity()
    }
  }
}

__boat.runFrameUpdate = () => {
  __boat.render()
  __boat.applyWaterFriction()
}

__boat.checkForOutOfBounds = (x) => {
  if (x >= CANVAS_WIDTH - __boat.width - 20) {
    __boat.x = CANVAS_WIDTH - __boat.width - 20
    __boat.drift = 0
  }
  if (x <= 0 + 10) {
    __boat.x = 10
    __boat.drift = 0
  }
}

__boat.render = () => {
  __boat.x += __boat.drift * 4

  __boat.checkForOutOfBounds(__boat.x)

  const roundX = Math.round(__boat.x) // Math.round(__boat.x / __boat.scaleFx)
  const roundY = Math.round(__boat.y) // Math.round(__boat.y / __boat.scaleFx)
  const renderXOffset = 12

  __boat.context.save()
  __boat.leftSprite.render(roundX, roundY)
  __boat.rightSprite.render(roundX + renderXOffset, roundY)

  __boat.context.restore()
}

__boat.fadeOut = () => {
  if (__boat.velocity !== 0) {
    __boat.resetVelocity()
  }
  if (__boat.opacity > 0) {
    __boat.context.save()
    __boat.opacity -= 0.05
    __boat.context.globalAlpha = __boat.opacity

    // console.log('OP', __boat.opacity)
    __boat.render()
    __boat.context.restore()
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

  tutorial.backBtn = makeButton(
    BACK_TEXT,
    tutorial.ctx.measureText(BACK_TEXT).width,
    tutorial.ctx.measureText('L').width,
    CANVAS_WIDTH / 2,
    CANVAS_HEIGHT / 5,
    () => {
      console.log('BACK BUTTON PRESSED!')
    },
    { fontSize: 16 },
  )
  tutorial.kblBtn = makeButton(
    LKB_TEXT,
    tutorial.ctx.measureText(LKB_TEXT).width,
    tutorial.ctx.measureText('L').width,
    10,
    CANVAS_HEIGHT - 3,
    () => {},
    { fontSize: 10, alignment: 'left' },
  )
  tutorial.kbrBtn = makeButton(
    RKB_TEXT,
    tutorial.ctx.measureText(RKB_TEXT).width,
    tutorial.ctx.measureText('L').width,
    CANVAS_WIDTH - 10,
    CANVAS_HEIGHT - 3,
    () => {},
    { fontSize: 10, alignment: 'right' },
  )
}

tutorial.leave = () => {
  tutorial.stopTutorial()
  tutorial.controls.clearButton(tutorial.controls.getMainTouchEl(), tutorial.backBtn)
  tutorial.controls.clearBoatControls()
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
  tutorial.kblBtn.render(tutorial.ctx)
  tutorial.kbrBtn.render(tutorial.ctx)

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
    if (tutorial.cTS === 5) {
      // ...
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
    tutorial.setTutorialStep(5)
    tutorial.removeThumbs()
    tutorial.controls.registerBoatControls()
    infoDisplay.setMessage('Ok, you try!')
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

/* #region GAME */
game = {}

game.init = (ctx, controls, goToBackScreen, sound) => {
  game.ctx = ctx
  game.controls = controls
  game.sound = sound
  game.paused = false
  game.resetDifficulty()
  game.goToBackScreen = goToBackScreen
  game.quitBtn = makeButton(QUIT_TEXT, game.ctx.measureText(QUIT_TEXT).width, game.ctx.measureText('L').width, 2, 10, () => {
    game.leave()
    game.controls.clearBoatControls()
  }, { fontSize: 10, alignment: 'left' })
  game.pauseBtn = makeButton(
    PAUSE_TEXT,
    game.ctx.measureText(PAUSE_TEXT).width,
    game.ctx.measureText('L').width,
    CANVAS_WIDTH - 2,
    10,
    () => {
      game.paused = !game.paused
      if (game.paused) {
        console.log('PAUSE')
        game.sound.mute()
      }
      else {
        game.sound.unmute()
      }
    },
    { fontSize: 10, alignment: 'right' },
  )

  game.gameOverBtn = makeButton(
    'GAMEOVER',
    game.ctx.measureText('GAMEOVER').width,
    game.ctx.measureText('L').width,
    CANVAS_WIDTH / 2,
    110,
    () => {
      game.leave()
    },
    { fontSize: 25, alignment: 'center' },
  )

  game.distanceRowed = 0
  game.score = makeButton(
    game.scoreText(),
    game.ctx.measureText(game.scoreText()).width,
    game.ctx.measureText('L').width,
    CANVAS_WIDTH / 2,
    27,
    () => {
      console.log('PAUSE BUTTON PRESSED!')
    },
    { fontSize: 20, alignment: 'center' },
  )
}
game.scoreText = () => `${game.distanceRowed}m`

game.resetDifficulty = () => {
  game.difficulty = 0
}

game.updateDifficulty = (distance) => {
  game.difficulty = Math.floor(distance / 100)
}

game.goTo = () => {
  game.controls.registerButton(game.controls.getMainTouchEl(), game.quitBtn)
  game.controls.registerButton(game.controls.getMainTouchEl(), game.pauseBtn)
}

game.leave = () => {
  game.controls.clearButton(game.controls.getMainTouchEl(), game.quitBtn)
  game.controls.clearButton(game.controls.getMainTouchEl(), game.pauseBtn)
  game.goToBackScreen()
}

game.updateScore = (distance) => {
  game.distanceRowed = Math.floor((distance / 3))
  game.score.name = game.scoreText()

  game.updateDifficulty(game.distanceRowed)
}

game.render = (distanceRowed) => {
  game.updateScore(distanceRowed)

  game.quitBtn.render(game.ctx)
  game.pauseBtn.render(game.ctx)
  game.score.render(game.ctx)
}

game.renderGameOver = () => {
  game.gameOverBtn.render(game.ctx)
}
/* #endregion */

/* #region HOME */
home.init = (hs) => {
  home.hs = `Best: ${Math.floor(hs / 3) || 0}m`
  home.title = 'ROW'
  home.initialTitleX = CANVAS_WIDTH / 2
  home.initialTitleY = CANVAS_HEIGHT / 2
  home.currentTitleY = CANVAS_HEIGHT / 2
  home.playBtnDimentions = undefined
  home.tutorialBtnDimensions = undefined

  ctx.save()
  ctx.textAlign = 'center'
  ctx.fillStyle = '#ffffff'
  ctx.font = '20px Courier'
  const approxHeight = ctx.measureText('L').width

  home.playBtn = makeButton(
    PLAY_TEXT,
    ctx.measureText(PLAY_TEXT).width,
    approxHeight,
    CANVAS_WIDTH / 2,
    CANVAS_HEIGHT / 1.65,
    () => {
      console.log('PLAY BUTTON PRESSED!')
    },
    { fontSize: 16 },
  )
  home.tutorialBtn = makeButton(
    TUT_TEXT,
    ctx.measureText(TUT_TEXT).width,
    approxHeight,
    CANVAS_WIDTH / 2,
    CANVAS_HEIGHT / 1.35,
    () => {
      console.log('TUTORIAL BUTTON PRESSED!')
    },
    { fontSize: 16 },
  )
  home.hsText = makeButton(
    home.hs,
    ctx.measureText(home.hs).width,
    approxHeight,
    CANVAS_WIDTH / 2,
    CANVAS_HEIGHT / 1.15,
    () => {},
    { fontSize: 10 },
  )
  ctx.restore()
}


home.updateHs = (score) => {
  home.hs = `Best: ${Math.floor(score / 3) || 0}m`
  home.hsText.name = home.hs
}

home.renderInitialLoad = () => {
  home.renderTitle(home.initialTitleX, home.initialTitleY)
}

home.renderTitle = (x, y) => {
  ctx.save()
  ctx.textAlign = 'center'
  ctx.fillStyle = '#ffffff'
  ctx.font = '70px Courier'
  ctx.fillText(home.title, x, y)
  ctx.restore()
}

home.renderMenu = () => {
  // ctx.save()
  // ctx.textAlign = 'center'
  // ctx.fillStyle = '#ffffff'
  // ctx.font = '20px Courier'

  home.playBtn.render(ctx)
  home.tutorialBtn.render(ctx)
  home.hsText.render(ctx)

  // ctx.restore()
}

home.renderMainScreen = () => {
  // if (home.currentTitleY > 60) {
  //   home.currentTitleY -= 1
  //   home.renderTitle(home.initialTitleX, home.currentTitleY)
  // }
  // else {
  //   home.renderTitle(home.initialTitleX, home.currentTitleY)
  //   home.renderMenu()
  // }
  home.renderTitle(home.initialTitleX, 60)
  home.renderMenu()
}
/* #endregion */

/* #region COLLISION MANAGER */
collisionManager.init = (ctx, colSound) => {
  collisionManager.ctx = ctx
  collisionManager.boatY = undefined
  collisionManager.hasCollision = false
  collisionManager.colSound = colSound

  collisionManager.collisions = 0
  collisionManager.lastCollisionAt = 0
}

collisionManager.setup = (__boat) => {
  // collisionManager.boatY = __boat.y / SCALE_FACTOR
  collisionManager.boatWidth = __boat.width
  collisionManager.boatHeight = __boat.height
}

collisionManager.reset = () => {
  collisionManager.collisions = 0
  collisionManager.lastCollisionAt = 0
}

collisionManager.addCollision = () => {
  const now = Date.now()

  if (now > collisionManager.lastCollisionAt + 500) {
    collisionManager.colSound()
    collisionManager.collisions += 1
    collisionManager.lastCollisionAt = now
  }
}

collisionManager.broadPhaseCheck = (__boat, obstacles) => {
  const boatBox = __boat.getBoatBodyDimensions()

  obstacles.forEach((obstacle) => {
    const obstacleBox = obstacle.getObstacleBodyDimensions()

    if (
      boatBox.maxX > obstacleBox.minX
        && boatBox.minX < obstacleBox.maxX
        && boatBox.maxY > obstacleBox.minY
        && boatBox.minY < obstacleBox.maxY
    ) {
      collisionManager.narrowPhaseCheck(boatBox, __boat, obstacleBox, obstacle)
    }
  })
}

collisionManager.narrowPhaseCheck = (boatBox, __boat, obstacleBox) => {
  // console.log('Y: ', boatBox.maxY, obstacleBox.midY)
  console.log('X: ', boatBox.maxX, obstacleBox.midX, obstacleBox.quadSize)
  let buffer = 0

  if (
    boatBox.maxX < obstacleBox.midX - obstacleBox.quadSize
      && boatBox.maxY < obstacleBox.midY
  ) {
    console.log('NW Quad...')
    buffer = obstacleBox.quadSize
  }
  else if (
    boatBox.maxX > obstacleBox.midX + obstacleBox.quadSize
      && boatBox.maxY < obstacleBox.midY
  ) {
    console.log('NE Quad...')
    buffer = obstacleBox.quadSize
  }
  else if (
    boatBox.minX > obstacleBox.midX + obstacleBox.quadSize
      && boatBox.minY > obstacleBox.midY
  ) {
    console.log('SE Quad...')
    buffer = obstacleBox.quadSize
  }
  else if (
    boatBox.maxX < obstacleBox.midX - obstacleBox.quadSize
      && boatBox.minY > obstacleBox.midY
  ) {
    console.log('SW Quad...')
  }

  if (
    boatBox.maxY > obstacleBox.maxY
      && boatBox.maxY - obstacleBox.maxY > __boat.height / 6
      && boatBox.minX > obstacleBox.minX
      && boatBox.maxX < obstacleBox.maxX
  ) {
    // Boat is stuck on the obstacle! Hold it in place...
    console.log('SET STUCK!')
    __boat.setStuck()
    collisionManager.addCollision()
  }
  else if (boatBox.maxY > obstacleBox.minY + buffer) {
    console.log('BOUNCE OFF')
    __boat.resetVelocity()
    collisionManager.addCollision()
  }

  if (
    boatBox.minX < obstacleBox.maxX - buffer
        && boatBox.maxX > obstacleBox.maxX
  ) {
    console.log('BOUNCE RIGHT')
    __boat.bounceRight()
    collisionManager.addCollision()
  }
  if (
    boatBox.maxX > obstacleBox.minX + buffer
        && boatBox.minX < obstacleBox.minX
  ) {
    console.log('BOUNCE LEFT')
    __boat.bounceLeft()
    collisionManager.addCollision()
  }
  // else {
  //   __boat.setUnstuck()
  // }
}
/* #endregion */

/* #region OBSTACLE MANAGER */
obstacleManager.init = (ctx) => {
  obstacleManager.ctx = ctx
  obstacleManager.obstacles = []
  obstacleManager.waterfall = []
  obstacleManager.spawnKey = 7
  obstacleManager.spawnFrequency = 150
  obstacleManager.difficultyMultiplyer = 15
  obstacleManager.maxSpawnFrequency = 40
  obstacleManager.lastSpawnAt = 0
}

obstacleManager.makeWaterfall = () => {
  let waterfallObjects = 50

  while (waterfallObjects > 0) {
    obstacleManager.waterfall.push(obstacleManager.spawnRock(null, random(-10, -140)))
    obstacleManager.waterfall.push(obstacleManager.spawnTree(null, random(-10, -140)))
    waterfallObjects -= 1
  }
}

obstacleManager.render = (velocity) => {
  obstacleManager.renderWaterfall(velocity)
  obstacleManager.renderObstacles(velocity)
}

obstacleManager.renderWaterfall = (velocity) => {
  obstacleManager.waterfall.forEach((item) => {
    item.render(velocity)
  })
}

obstacleManager.renderObstacles = (velocity) => {
  obstacleManager.obstacles.forEach((obstacle) => {
    obstacle.render(velocity)
  })
}

obstacleManager.trySpawnObstacle = (distance, difficulty) => {
  const spawnDifficulty = obstacleManager.spawnFrequency - (obstacleManager.difficultyMultiplyer * difficulty)
  const spawnCheckNum = spawnDifficulty < obstacleManager.maxSpawnFrequency ? obstacleManager.maxSpawnFrequency : spawnDifficulty
  const canSpawnNum = distance - spawnCheckNum

  if (canSpawnNum > obstacleManager.lastSpawnAt) {
    if (random(1, 20) === obstacleManager.spawnKey) {
      obstacleManager.spawnObstacle()

      obstacleManager.lastSpawnAt = distance
    }
  }
}

obstacleManager.spawnObstacle = () => {
  const type = random(1, 2)
  let obstacle

  if (type === 1) {
    obstacle = obstacleManager.spawnRock()
  }
  else {
    obstacle = obstacleManager.spawnTree()
  }

  obstacleManager.obstacles.push(obstacle)
}

obstacleManager.spawnTree = (x, y) => {
  const tree = makeTree(ctx)

  tree.x = x || random(tree.minX, tree.maxX)
  tree.y = y || random(CANVAS_HEIGHT, CANVAS_HEIGHT + 25)

  return tree
}

obstacleManager.spawnRock = (x, y) => {
  const rock = makeRock(ctx)

  rock.x = x || random(rock.minX, rock.maxX)
  rock.y = y || random(CANVAS_HEIGHT, CANVAS_HEIGHT + 25)

  return rock
}
/* #endregion */

/* #region TREE */
makeTree = (ctx) => {
  const tree = {}

  tree.getObstacleBodyDimensions = () => ({
    minY: tree.y + 10,
    maxX: tree.x + 22,
    maxY: tree.y + 25,
    minX: tree.x + 6,
    midX: tree.x + 14,
    midY: tree.y + 14,
    quadSize: 5,
  })

  tree.getRenderAdjustAmount = (velocity) => (RIVER_SPEED * 2) + velocity

  tree.render = (velocity) => {
    tree.y -= tree.getRenderAdjustAmount(velocity)

    tree.sprite.update()
    tree.sprite.render(tree.x, tree.y)
  }

  tree.init = (ctx) => {
    tree.ctx = ctx

    tree.image = new Image()
    tree.image.src = treeSrc

    tree.height = 28
    tree.width = 84
    tree.frames = 3
    tree.frameWidth = tree.width / tree.frames
    tree.minX = 6
    tree.maxX = 102
    tree.collisionOffsets = {
      n: 0,
      ne: 9,
      e: 6,
      se: 9,
      s: 3,
      sw: 6,
      w: 5,
      nw: 20,
    }
    tree.x = tree.maxX - 10
    tree.y = 100
    tree.sprite = makeSprite({
      context: tree.ctx,
      width: tree.width,
      height: tree.height,
      image: tree.image,
      numberOfFrames: tree.frames,
      ticksPerFrame: 10,
      loop: true,
      x: tree.x,
      y: tree.y,
    })

    return tree
  }

  return tree.init(ctx)
}
/* #endregion */

/* #region ROCK */
makeRock = (ctx) => {
  const rock = {}

  rock.getObstacleBodyDimensions = () => ({
    minY: rock.y + 5,
    maxX: rock.x + 26,
    maxY: rock.y + 27,
    minX: rock.x + 7,
    midX: rock.x + 16,
    midY: rock.y + 15,
    quadSize: 6,
  })
  
  rock.getRenderAdjustAmount = (velocity) => (RIVER_SPEED * 2) + velocity
  
  rock.render = (velocity) => {
    rock.y -= rock.getRenderAdjustAmount(velocity)
  
    rock.sprite.update()
    rock.sprite.render(rock.x, rock.y)
  }

  rock.init = (ctx) => {
    rock.ctx = ctx
    rock.image = new Image()
    rock.image.src = rockSrc
    rock.height = 29
    rock.width = 96
    rock.frames = 3
    rock.frameWidth = rock.width / rock.frames
    rock.minX = 6
    rock.maxX = 98
    rock.collisionOffsets = {
      n: 4,
      ne: 10,
      e: 6,
      se: 10,
      s: 2,
      sw: 8,
      w: 6,
      nw: 11,
    }
    rock.x = rock.minX + 10
    rock.y = 200
    rock.sprite = makeSprite({
      context: rock.ctx,
      width: rock.width,
      height: rock.height,
      image: rock.image,
      numberOfFrames: rock.frames,
      ticksPerFrame: 10,
      loop: true,
      x: rock.x,
      y: rock.y,
    })

    return rock
  }

  return rock.init(ctx)
}
/* #endregion */

/* #region BUTTON */
makeButton = (name, width, height, x, y, action, options = {}) => {
  const button = {}

  button.setScaledMinMax = () => {
    button.xMin = (button.oX - (button.width / 2)) * SCALE_FACTOR
    button.yMin = (button.oY - (button.height * 1.2)) * SCALE_FACTOR
    button.xMax = (button.oX + button.width) * SCALE_FACTOR
    button.yMax = (button.oY + (button.height / 2)) * SCALE_FACTOR
  }

  button.render = (ctx) => {
    ctx.save()
    ctx.textAlign = button.alignment
    ctx.fillStyle = '#ffffff'
    ctx.font = `${button.fontSize}px Courier`
    ctx.fillText(
      button.name,
      button.oX,
      button.oY,
    )
    ctx.restore()
  }

  button.init = () => {
    button.name = name
    button.fontSize = options.fontSize || 20
    button.alignment = options.alignment || 'center'
    button.width = width
    button.height = height
    button.oX = x
    button.oY = y

    button.xMin = (x - (button.width / 2)) * SCALE_FACTOR
    button.yMin = (y - (button.height * 1.2)) * SCALE_FACTOR
    button.xMax = (x + button.width) * SCALE_FACTOR
    button.yMax = (y + (button.height / 2)) * SCALE_FACTOR

    button.action = action

    return button
  }

  return button.init()
}
/* #endregion */

/* #region MAKE SPRITE */
makeSprite = (options) => {
  const that = {}
  let frameIndex = 0
  let tickCount = 0
  const ticksPerFrame = options.ticksPerFrame || 0
  const numberOfFrames = options.numberOfFrames || 1

  that.context = options.context
  that.width = options.width
  that.height = options.height
  that.image = options.image
  that.loop = options.loop || false
  that.x = options.x
  that.y = options.y
  that.frameIndex = 0
  that.rotation = options.rotation

  that.currentFrame = () => frameIndex

  that.resetTickCount = () => {
    tickCount = 0
  }

  that.render = (x, y) => {
    // // Clear the canvas
    // that.context.clearRect(that.x, that.y, that.width, that.height)
    if (x || y) {
      that.x = x
      that.y = y
    }

    // Draw the animation
    if (that.rotation) {
      that.context.save()
      that.context.translate(0, 0)
      that.context.rotate(that.rotation * (Math.PI / 180))
    }

    that.context.drawImage(
      that.image,
      frameIndex * (that.width / numberOfFrames),
      0,
      that.width / numberOfFrames,
      that.height,
      that.x,
      that.y,
      that.width / numberOfFrames,
      that.height,
    )

    if (that.rotation) {
      that.context.restore()
    }
  }


  that.update = () => {
    tickCount += 1

    if (tickCount > ticksPerFrame) {
      tickCount = 0
      // If the current frame index is in range
      if (frameIndex < numberOfFrames - 1) {
        // Go to the next frame
        frameIndex += 1
      }
      else if (that.loop) {
        frameIndex = 0
      }
    }
  }

  that.goToFrame = (frame) => {
    if (frame < numberOfFrames) {
      frameIndex = frame
    }

    return that
  }

  return that
}
/* #endregion */

/* #region SOUND */
sound.init = (context) => {
  sound.ctx = context
  sound.muted = false
  sound.queueSong = false
  sound.vol = 0.005
}

sound.mute = () => {
  sound.muted = true
  sound.vol = 0
  sound.gainNode.gain.setValueAtTime(sound.vol, sound.ctx.currentTime)
  sound.ctx.suspend()
}

sound.unmute = () => {
  sound.muted = false
  sound.vol = 0.005
  sound.gainNode.gain.setValueAtTime(sound.vol, sound.ctx.currentTime)
  sound.ctx.resume()
}

sound.setup = () => {
  sound.osc = sound.ctx.createOscillator()
  sound.gainNode = sound.ctx.createGain()

  sound.osc.connect(sound.gainNode)
  sound.gainNode.connect(sound.ctx.destination)
  sound.osc.type = 'square'

  sound.unmute()
}

sound.play = (value, time, stopTime = undefined, volume = undefined) => {
  const modVol = volume ? volume * sound.vol : sound.vol

  sound.setup()

  sound.osc.frequency.value = value
  sound.gainNode.gain.setValueAtTime(modVol, sound.ctx.currentTime)

  sound.osc.start(time)

  sound.stop(time, stopTime)
}

sound.stop = (time, stopTime) => {
  // sound.gainNode.gain.exponentialRampToValueAtTime(0.005, time + 0.1)
  sound.osc.stop(time + (stopTime || 0.25))
}

sound.oar = () => {
  sound.play(OAR, sound.ctx.currentTime + 0.05, 0.01, 0.5)
  sound.play(OAR2, sound.ctx.currentTime + 0.075, 0.01, 0.5)
  sound.play(OAR, sound.ctx.currentTime + 0.1, 0.01, 0.5)
}

sound.bump = () => {
  sound.play(DEEP, sound.ctx.currentTime + 0.05, 0.05, 2)
  sound.play(DEEP, sound.ctx.currentTime + 0.1, 0.05, 2)
}

sound.song = () => {
  sound.play(C4, sound.ctx.currentTime + 0.75)
  sound.play(C4, sound.ctx.currentTime + 0.875)
  sound.play(C4, sound.ctx.currentTime + 1.25)
  sound.play(C4, sound.ctx.currentTime + 1.375)
  sound.play(C4, sound.ctx.currentTime + 1.75)
  sound.play(C4, sound.ctx.currentTime + 1.875)
  sound.play(D4, sound.ctx.currentTime + 2.00)
  sound.play(D4, sound.ctx.currentTime + 2.125)
  sound.play(E4, sound.ctx.currentTime + 2.25)
  sound.play(E4, sound.ctx.currentTime + 2.375)
  sound.play(E4, sound.ctx.currentTime + 2.75)
  sound.play(E4, sound.ctx.currentTime + 2.875)
  sound.play(D4, sound.ctx.currentTime + 3.00)
  sound.play(D4, sound.ctx.currentTime + 3.125)
  sound.play(E4, sound.ctx.currentTime + 3.25)
  sound.play(F4, sound.ctx.currentTime + 3.50)
  sound.play(G4, sound.ctx.currentTime + 3.75, 0.1)
  sound.play(G4, sound.ctx.currentTime + 3.875, 0.1)
  sound.play(G4, sound.ctx.currentTime + 4.00, 0.1)
  sound.play(G4, sound.ctx.currentTime + 4.125, 0.1)
  sound.play(G4, sound.ctx.currentTime + 4.25, 0.1)
  sound.play(C5, sound.ctx.currentTime + 4.75)
  sound.play(C5, sound.ctx.currentTime + 4.875)
  sound.play(C5, sound.ctx.currentTime + 5.00)
  sound.play(G4, sound.ctx.currentTime + 5.125)
  sound.play(G4, sound.ctx.currentTime + 5.25)
  sound.play(G4, sound.ctx.currentTime + 5.375)
  sound.play(E4, sound.ctx.currentTime + 5.50)
  sound.play(E4, sound.ctx.currentTime + 5.625)
  sound.play(E4, sound.ctx.currentTime + 5.75)
  sound.play(C4, sound.ctx.currentTime + 5.875)
  sound.play(C4, sound.ctx.currentTime + 6.00)
  sound.play(C4, sound.ctx.currentTime + 6.125)
  sound.end(6.00)
}

sound.end = (offset = 0.00) => {
  sound.play(G4, sound.ctx.currentTime + 0.25 + offset)
  sound.play(F4, sound.ctx.currentTime + 0.50 + offset)
  sound.play(F4, sound.ctx.currentTime + 0.625 + offset)
  sound.play(E4, sound.ctx.currentTime + 0.75 + offset)
  sound.play(E4, sound.ctx.currentTime + 0.875 + offset)
  sound.play(D4, sound.ctx.currentTime + 1.00 + offset)
  sound.play(C4, sound.ctx.currentTime + 1.25 + offset)
}

const sCtx = new (window.AudioContext || window.webkitAudioContext)()

sound.init(sCtx)

/* #endregion */

/* #region INFO DISPLAY */
infoDisplay.init = () => {
  infoDisplay.isInit = false
  infoDisplay.textbox = document.createElement('div')
  infoDisplay.textbox.style.fontSize = '20px'
  infoDisplay.textbox.style.fontWeight = 'bold'
  infoDisplay.textbox.style.position = 'absolute'
  infoDisplay.textbox.style.top = 0
  infoDisplay.textbox.style.left = '50%'
  infoDisplay.textbox.style.transform = 'translateX(-50%)'
  infoDisplay.textbox.style.padding = '16px 20px'
  infoDisplay.textbox.style.boxSizing = 'border-box'
  infoDisplay.textbox.style.color = '#ffffff'
  infoDisplay.textbox.style.backgroundColor = 'blue'
  infoDisplay.hide()
}
infoDisplay.setup = (parentNode, siblingNode, width) => {
  if (!infoDisplay.isInit) {
    infoDisplay.textbox.style.width = `${width}px`
    parentNode.insertBefore(infoDisplay.textbox, siblingNode)
    infoDisplay.isInit = true
  }
}

infoDisplay.setMessage = (message) => {
  infoDisplay.textbox.innerHTML = message
}

infoDisplay.show = () => {
  infoDisplay.textbox.style.opacity = 0.75
  infoDisplay.textbox.style.display = 'block'
}

infoDisplay.hide = () => {
  infoDisplay.textbox.style.opacity = 0
  infoDisplay.textbox.style.display = 'none'
}

infoDisplay.init()
/* #endregion */

/**
 * Set the event listener that will load the game
 */
window.addEventListener('load', () => {
  console.log('-- window _ load --')

  window.addEventListener('keydown', handleKeyboardControl)
  initializeGame(mainLoop)
})
/* eslint-enable */
