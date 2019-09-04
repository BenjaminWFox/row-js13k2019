import boatLeftSheet from '../assets/images/sprites/boat-shadow-sprite-left.png'
import boatRightSheet from '../assets/images/sprites/boat-shadow-sprite-right.png'
import makeSprite from './sprite'
import CONSTANTS from './constants'

const BOAT_SPRITE_WIDTH = 84
const BOAT_SPRITE_HEIGHT = 15

export default class Boat {
  constructor(ctx, scaleFx, strokePower, maxVelocity, waterFriction, startCoords) {
    this.context = ctx
    this.height = BOAT_SPRITE_HEIGHT
    this.width = BOAT_SPRITE_WIDTH / 7

    this.leftImage = new Image()
    this.rightImage = new Image()

    this.leftImage.src = boatLeftSheet
    this.rightImage.src = boatRightSheet
    this.startingX = startCoords.x
    this.scaleFx = scaleFx

    this.x = startCoords.x
    this.y = startCoords.y

    console.log('THIS X/Y', this.x, this.y)

    this.opacity = 1
    this.leftSprite = makeSprite({
      context: ctx,
      width: BOAT_SPRITE_WIDTH,
      height: BOAT_SPRITE_HEIGHT,
      image: this.leftImage,
      numberOfFrames: 7,
      loop: true,
      ticksPerFrame: 5,
      x: 0,
      y: 0,
    })
    this.rightSprite = makeSprite({
      context: ctx,
      width: BOAT_SPRITE_WIDTH,
      height: BOAT_SPRITE_HEIGHT,
      image: this.rightImage,
      numberOfFrames: 7,
      loop: true,
      ticksPerFrame: 5,
      x: 12,
      y: 0,
    })

    this.resetVelocity()
    this.drift = 0
    this.sameSideStrokes = 0
    this.lastSameSideStroke = 0
    this.maxVelocity = maxVelocity
    this.strokePower = strokePower
    this.waterFriction = waterFriction
    this.lastStrokeUpdate = undefined

    this.isStuck = false
  }

  renderLivesLeft = (collisions) => {
    const atY = 32
    const loops = 8 - collisions > 0 ? 8 - collisions : 0
    let evens = 0
    let odds = 0

    this.context.save()
    this.context.globalAlpha = 0.7
    for (let i = 0; i < loops; i += 1) {
      if (i % 2 === 0) {
        this.context.drawImage(this.leftImage, 0, 0, 12, 14, 16 + (evens * 24) + (evens * 2), atY, 12, 14)
        evens += 1
      }
      else {
        this.context.drawImage(this.rightImage, 0, 0, 12, 14, 28 + (odds * 24) + (odds * 2), atY, 12, 14)
        odds += 1
      }
    }
    this.context.restore()
  }

  setStuck = () => {
    console.log('Stuck set...')
    this.isStuck = true
  }

  setUnstuck = () => {
    if (this.isStuck) {
      console.log('UNStuck set...')
      this.isStuck = false
    }
  }

  updateStrokePower = (difficulty) => {
    this.strokePower = CONSTANTS.STROKE_POWER + (CONSTANTS.STROKE_INCREASE * difficulty)
  }

  getBoatBodyDimensions = () => ({
    minY: this.y,
    maxX: this.x + 17,
    maxY: this.y + this.height,
    minX: this.x + 8,
  })

  resetVelocity = () => {
    this.velocity = 0
  }

  setFrames = (frameObj) => {
    if (
      this.leftSprite.currentFrame() !== frameObj.left
      && this.rightSprite.currentFrame() !== frameObj.right
    ) {
      this.sameSideStrokes = 0
    }
    if (this.leftSprite.currentFrame() !== frameObj.left) {
      this.addVelocity(frameObj.left)
      this.addDrift(frameObj.left, 1)
    }
    this.leftSprite.goToFrame(frameObj.left)

    if (this.rightSprite.currentFrame() !== frameObj.right) {
      this.addVelocity(frameObj.right)
      this.addDrift(frameObj.right, -1)
    }
    this.rightSprite.goToFrame(frameObj.right)
  }

  checkOarAlignment = () => {
    // console.log('Checking oar alignment...')
    if (this.x === this.startingX) {
      console.log('Resetting oars...')
      this.leftSprite.goToFrame(0).resetTickCount()
      this.rightSprite.goToFrame(0).resetTickCount()
      this.rightSprite.update()
      this.leftSprite.update()
      this.oarsOffset = false
    }
  }

  justRow = () => {
    if (this.x !== this.startingX) {
      if (this.drift !== 0) {
        this.drift = 0
      }
      this.oarsOffset = true

      // console.log('Just rowing...', this.x, this.startingX)

      if (this.x - this.startingX > 1) {
        // console.log('Going right')
        this.x -= 0.25
        this.rightSprite.update()
      }
      else if (this.x - this.startingX < -1) {
        // console.log('Going left')
        this.x += 0.25
        this.leftSprite.update()
      }
      else {
        this.x = this.startingX
        // console.log('Resetting X', this.x, this.startingX)
      }
    }
    else {
      if (this.oarsOffset) {
        // console.log('Fixing offset oars!')
        this.x = this.startingX
        this.leftSprite.goToFrame(0).resetTickCount()
        this.rightSprite.goToFrame(0).resetTickCount()
        this.oarsOffset = false
      }

      this.rightSprite.update()
      this.leftSprite.update()
    }

    this.render()
  }

  isOarInWater = (frame) => frame > 2 && frame < 6

  isSameSideRowing = () => Math.abs(this.sameSideStrokes) > 3

  addVelocity = (frame) => {
    if (frame) {
      if (
        this.isOarInWater(frame)
        && this.velocity <= this.maxVelocity
        && !this.isSameSideRowing()
      ) {
        this.setUnstuck()
        this.velocity += this.strokePower
        this.lastStrokeUpdate = Date.now()
      }
    }
  }

  bounceLeft = () => {
    this.drift = -0.066
  }

  bounceRight = () => {
    this.drift = 0.066
  }

  addDrift = (frame, direction) => {
    if (this.isSameSideRowing()) {
      this.lastSameSideStroke = Date.now()
    }
    else {
      this.sameSideStrokes += direction
    }

    if (frame) {
      if (this.isOarInWater(frame)) {
        this.drift += this.strokePower * direction
      }
    }
  }

  applyWaterFriction = () => {
    const now = Date.now()

    if (now - this.lastSameSideStroke > 500 && this.drift !== 0) {
      if (this.drift > 0) {
        this.drift -= this.waterFriction
        if (this.drift < 0) {
          this.drift = 0
        }
      }
      if (this.drift < 0) {
        this.drift += this.waterFriction
        if (this.drift > 0) {
          this.drift = 0
        }
      }
    }

    if (this.isStuck) {
      this.velocity = -(CONSTANTS.RIVER_SPEED * 2)
      // console.log('Is stuck...', this.velocity)
    }
    else if (now - this.lastStrokeUpdate > 500 && this.velocity > 0) {
      // console.log('Friction unstuck...')
      this.setUnstuck()
      this.velocity -= this.waterFriction
      if (this.velocity < 0) {
        this.resetVelocity()
      }
    }
  }

  runFrameUpdate = () => {
    this.render()
    this.applyWaterFriction()
  }

  checkForOutOfBounds = (x) => {
    if (x >= CONSTANTS.CANVAS_WIDTH - this.width - 20) {
      this.x = CONSTANTS.CANVAS_WIDTH - this.width - 20
      this.drift = 0
    }
    if (x <= 0 + 10) {
      this.x = 10
      this.drift = 0
    }
  }

  render = () => {
    this.x += this.drift * 4

    this.checkForOutOfBounds(this.x)

    const roundX = Math.round(this.x) // Math.round(this.x / this.scaleFx)
    const roundY = Math.round(this.y) // Math.round(this.y / this.scaleFx)
    const renderXOffset = 12

    this.context.save()
    this.leftSprite.render(roundX, roundY)
    this.rightSprite.render(roundX + renderXOffset, roundY)

    this.context.restore()
  }

  fadeOut = () => {
    if (this.velocity !== 0) {
      this.resetVelocity()
    }
    if (this.opacity > 0) {
      this.context.save()
      this.opacity -= 0.05
      this.context.globalAlpha = this.opacity

      // console.log('OP', this.opacity)
      this.render()
      this.context.restore()
    }
  }
}
