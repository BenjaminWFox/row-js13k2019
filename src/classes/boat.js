import boatLeftSheet from '../assets/images/sprites/boat-left-sprite.png'
import boatRightSheet from '../assets/images/sprites/boat-right-sprite.png'
import makeSprite from './sprite'

export default class Boat {
  constructor(canvas, scaleFx) {
    this.leftImage = new Image()
    this.rightImage = new Image()

    this.leftImage.src = boatLeftSheet
    this.rightImage.src = boatRightSheet

    this.scaleFx = scaleFx
    this.leftSprite = makeSprite({
      context: canvas.getContext('2d'),
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
      context: canvas.getContext('2d'),
      width: 84,
      height: 14,
      image: this.rightImage,
      numberOfFrames: 7,
      loop: true,
      ticksPerFrame: 5,
      x: 12,
      y: 0,
    })
  }

  update = () => {
    this.leftSprite.update()
    this.rightSprite.update()
  }

  rowLeft = () => {
    this.leftSprite.update()
  }

  rowRight = () => {
    this.rightSprite.update()
  }

  setFrames = (frameObj) => {
    this.leftSprite.goToFrame(frameObj.left)
    this.rightSprite.goToFrame(frameObj.right)
  }

  render = (x, y) => {
    let sX = x ? Math.round(x / this.scaleFx) : undefined
    let sY = y ? Math.round(y / this.scaleFx) : undefined

    sX -= 24 / 2
    sY -= 14

    this.leftSprite.render(sX, sY)
    this.rightSprite.render(sX ? sX + 12 : null, sY)
  }
}
