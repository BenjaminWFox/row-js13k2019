import CONSTANTS from './constants'

export default class World {
  constructor(ctx) {
    this.distanceMoved = 0
    this.ctx = ctx
  }

  drawDistanceGrid = () => {
    const startingDrawY = 0 - this.distanceMoved
    const endingDrawY = startingDrawY + CONSTANTS.CANVAS_HEIGHT
    const numbersYOffset = startingDrawY % 50
    const startingNumber = startingDrawY - numbersYOffset
    const numbersToDraw = Math.ceil((endingDrawY - startingDrawY) / 50)

    // console.log(startingDrawY, endingDrawY, numbersYOffset, startingNumber, numbersToDraw)

    for (let i = 0; i < numbersToDraw; i += 1) {
      const currentNumber = startingNumber + (i * 50)

      this.ctx.fillText(currentNumber, 10, this.distanceMoved + currentNumber)
    }
  }

  calculatePositions = (river, boat) => {
    const { current } = river
    const { velocity } = boat

    this.distanceMoved = this.distanceMoved - (current + velocity)

    // console.log(this.distanceMoved)
  }
}
