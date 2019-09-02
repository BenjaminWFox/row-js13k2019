import CONSTANTS from './constants'

export default class World {
  constructor(ctx) {
    this.distanceMoved = 0
    this.ctx = ctx
    this.running = true
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

  calculatePositions = (river, waterfall, boat) => {
    const { current } = river
    const { velocity, scaleFx } = boat

    this.distanceMoved = this.distanceMoved - (current + velocity)

    if (
      (((waterfall.sprite.y + waterfall.height) * boat.scaleFx) - ((boat.height * boat.scaleFx) / 2) + (16))
      > boat.y + (boat.height * boat.scaleFx)
    ) {
      console.log('GAME OVER!')
      this.running = false
    }
    else {
      console.log('BOAT vs WATERFALL',
        boat.y + (boat.height * boat.scaleFx),
        ((waterfall.sprite.y + waterfall.height) * boat.scaleFx) - (boat.height * boat.scaleFx) + 16)
    }
  }
}
