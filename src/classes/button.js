import CONSTANTS from './constants'

export default class Button {
  constructor(name, width, height, x, y, action) {
    this.name = name
    this.width = width
    this.height = height
    this.oX = x
    this.oY = y
    this.xMin = (x - (this.width / 2)) * CONSTANTS.SCALE_FACTOR
    this.yMin = (y - (this.height * 1.2)) * CONSTANTS.SCALE_FACTOR
    this.xMax = (x + this.width) * CONSTANTS.SCALE_FACTOR
    this.yMax = (y + (this.height / 2)) * CONSTANTS.SCALE_FACTOR
    this.action = action
  }

  render = (ctx) => {
    ctx.fillText(
      this.name,
      this.oX,
      this.oY,
    )
  }
}
