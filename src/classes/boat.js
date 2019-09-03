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

      console.log('Just rowing...', this.x, this.startingX)

      if (this.x - this.startingX > 1) {
        console.log('Going right')
        this.x -= 0.25
        this.rightSprite.update()
      }
      else if (this.x - this.startingX < -1) {
        console.log('Going left')
        this.x += 0.25
        this.leftSprite.update()
      }
      else {
        this.x = this.startingX
        console.log('Resetting X', this.x, this.startingX)
      }
    }
    else {
      if (this.oarsOffset) {
        console.log('Fixing offset oars!')
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
        this.velocity += this.strokePower
        this.lastStrokeUpdate = Date.now()
      }
    }
  }

  addDrift = (frame, direction) => {
    if (this.isSameSideRowing()) {
      this.lastSameSideStroke = Date.now()
    }
    else {
      this.sameSideStrokes += direction
    }

    // console.log(this.sameSideStrokes)

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

    if (now - this.lastStrokeUpdate > 500 && this.velocity > 0) {
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

    const scaledX = Math.round(this.x) // Math.round(this.x / this.scaleFx)
    const scaledY = Math.round(this.y) // Math.round(this.y / this.scaleFx)
    const renderX = -12
    const renderY = -Math.floor(BOAT_SPRITE_HEIGHT / 2)
    const renderXOffset = 12

    this.context.save()

    // Keeping the context
    // this.context.translate(scaledX, scaledY)
    // this.context.rotate((((Math.round(this.rotation / 90) * 90) * Math.PI) / 180).toFixed(5))

    // draw the image...
    // these are rendered in relation to the translated X and Y
    // The numbers are 1/2 of the original images resepctive width & height
    // this.leftSprite.render(renderX, renderY)
    // this.rightSprite.render(renderX + renderXOffset, renderY)
    this.leftSprite.render(scaledX, scaledY)
    this.rightSprite.render(scaledX + renderXOffset, scaledY)

    this.context.rect(renderX, renderY, 24, 14)
    this.context.fill()

    // console.log('GA', this.context.globalAlpha)

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
