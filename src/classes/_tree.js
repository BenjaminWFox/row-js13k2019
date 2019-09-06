import treeSrc from '../assets/images/sprites/tree-sprite.png'
import makeSprite from './sprite'
import CONSTANTS from './constants'

export default class Tree {
  constructor(ctx) {
    this.ctx = ctx

    this.image = new Image()
    this.image.src = treeSrc

    this.height = 28
    this.width = 84
    this.frames = 3
    this.frameWidth = this.width / this.frames
    this.minX = 6
    this.maxX = 102

    this.collisionOffsets = {
      n: 0,
      ne: 9,
      e: 6,
      se: 9,
      s: 3,
      sw: 6,
      w: 5,
      nw: 20,
    }

    this.x = this.maxX - 10
    this.y = 100


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
    minY: this.y + 10,
    maxX: this.x + 22,
    maxY: this.y + 25,
    minX: this.x + 6,
    midX: this.x + 14,
    midY: this.y + 14,
    quadSize: 5,
  })

  getRenderAdjustAmount = (velocity) => (CONSTANTS.RIVER_SPEED * 2) + velocity

  render = (velocity) => {
    this.y -= this.getRenderAdjustAmount(velocity)

    this.sprite.update()
    this.sprite.render(this.x, this.y)
  }
}
