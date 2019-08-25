import boatLeftSheet from '../assets/images/sprites/boat-left-sprite.png'
import boatRightSheet from '../assets/images/sprites/boat-right-sprite.png'
import makeSprite from './sprite'

export default class Boat {
  constructor(ctx, scaleFx, strokePower, maxVelocity, waterFriction, startCoords) {
    this.context = ctx
    this.leftImage = new Image()
    this.rightImage = new Image()
    this.leftImage.src = boatLeftSheet
    this.rightImage.src = boatRightSheet
    this.scaleFx = scaleFx
    this.x = startCoords.x
    this.y = startCoords.y
    this.leftSprite = makeSprite({
      context: ctx,
      width: 84,
      height: 14,
      image: this.leftImage,
      numberOfFrames: 7,
      loop: true,
      ticksPerFrame: 5,
      x: 0,
      y: 0,
    })
    this.rightSprite = makeSprite({
      context: ctx,
      width: 84,
      height: 14,
      image: this.rightImage,
      numberOfFrames: 7,
      loop: true,
      ticksPerFrame: 5,
      x: 12,
      y: 0,
    })

    this.velocity = 0
    // this.rotation = 0
    this.drift = 0
    this.sameSideStrokes = 0
    this.lastSameSideStroke = 0
    this.maxVelocity = maxVelocity
    this.strokePower = strokePower
    this.waterFriction = waterFriction
    this.lastStrokeUpdate = undefined
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
        this.velocity = 0
      }
    }
  }

  runFrameUpdate = () => {
    this.render()
    this.applyWaterFriction()
  }

  render = () => {
    this.x += this.drift * 4

    const scaledX = Math.round(this.x / this.scaleFx)
    const scaledY = Math.round(this.y / this.scaleFx)
    const renderX = -12
    const renderY = -7
    const renderXOffset = 12

    this.context.save()

    // Keeping the context
    this.context.translate(scaledX, scaledY)
    // this.context.rotate((((Math.round(this.rotation / 90) * 90) * Math.PI) / 180).toFixed(5))

    // draw the image...
    // these are rendered in relation to the translated X and Y
    // The numbers are 1/2 of the original images resepctive width & height
    this.leftSprite.render(renderX, renderY)
    this.rightSprite.render(renderX + renderXOffset, renderY)

    this.context.restore()
  }
}
