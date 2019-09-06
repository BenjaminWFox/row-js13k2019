import rockSrc from '../assets/images/sprites/rock-sprite.png'
import makeSprite from './sprite'
import CONSTANTS from './constants'

export default class Rock {
  constructor(ctx) {
    this.ctx = ctx

    this.image = new Image()
    this.image.src = rockSrc

    this.height = 29
    this.width = 96
    this.frames = 3
    this.frameWidth = this.width / this.frames
    this.minX = 6
    this.maxX = 98

    this.collisionOffsets = {
      n: 4,
      ne: 10,
      e: 6,
      se: 10,
      s: 2,
      sw: 8,
      w: 6,
      nw: 11,
    }

    this.x = this.minX + 10
    this.y = 200

    this.sprite = makeSprite({
      context: this.ctx,
      width: this.width,
      height: this.height,
      image: this.image,
      numberOfFrames: this.frames,
      ticksPerFrame: 10,
      loop: true,
      x: this.x,
      y: this.y,
    })
  }

  getObstacleBodyDimensions = () => ({
    minY: this.y + 5,
    maxX: this.x + 26,
    maxY: this.y + 27,
    minX: this.x + 7,
    midX: this.x + 16,
    midY: this.y + 15,
    quadSize: 6,
  })

  getRenderAdjustAmount = (velocity) => (CONSTANTS.RIVER_SPEED * 2) + velocity

  render = (velocity) => {
    this.y -= this.getRenderAdjustAmount(velocity)

    this.sprite.update()
    this.sprite.render(this.x, this.y)
  }
}
