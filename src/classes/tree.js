import treeSrc from '../assets/images/sprites/tree-sprite.png'
import makeSprite from './sprite'

export default class Tree {
  constructor(ctx) {
    this.ctx = ctx

    this.image = new Image()
    this.image.src = treeSrc

    this.height = 28
    this.width = 84
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
      y: 100,
    })
  }

  render = () => {
    this.sprite.update()
    this.sprite.render()
  }
}
