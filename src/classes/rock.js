import rockSrc from '../assets/images/sprites/rock-sprite.png'
import makeSprite from './sprite'

export default class Rock {
  constructor(ctx) {
    this.ctx = ctx

    this.image = new Image()
    this.image.src = rockSrc

    this.height = 29
    this.width = 96
    this.frames = 3

    this.sprite = makeSprite({
      context: this.ctx,
      width: this.width,
      height: this.height,
      image: this.image,
      numberOfFrames: this.frames,
      ticksPerFrame: 10,
      loop: true,
      x: 50,
      y: 200,
    })
  }

  render = () => {
    this.sprite.update()
    this.sprite.render()
  }
}
