import makeSprite from './sprite'

export default class Boat {
  constructor(canvas, leftImage, rightImage, scaleFx) {
    this.scaleFx = scaleFx
    this.leftSprite = makeSprite({
      context: canvas.getContext('2d'),
      width: 84,
      height: 14,
      image: leftImage,
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
      image: rightImage,
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

    sX -= 24
    sY -= 14

    this.leftSprite.render(sX, sY)
    this.rightSprite.render(sX ? sX + 12 : null, sY)
  }
}
