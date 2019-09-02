import waterfallSrc from '../assets/images/sprites/waterfall-sprite.png'
import makeSprite from './sprite'

export default class Waterfall {
  constructor(ctx, currentSpeed) {
    this.ctx = ctx

    this.height = 166

    this.current = currentSpeed

    this.yPos = -this.height

    this.image = new Image()

    this.image.src = waterfallSrc

    this.sprite = makeSprite({
      context: this.ctx,
      width: 405,
      height: 166,
      image: this.image,
      numberOfFrames: 3,
      ticksPerFrame: 10,
      loop: true,
      x: 0,
      y: this.yPos,
    })
  }

  getRenderAdjustAmount = (velocity) => (this.current * 2) + velocity

  render = (velocity) => {
    this.yPos -= this.getRenderAdjustAmount(velocity)
    this.sprite.update()
    this.sprite.render(0, this.yPos)
  }
}
