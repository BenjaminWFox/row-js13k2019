import CONSTANTS from './constants'

export default class World {
  constructor(ctx, endSound) {
    this.distanceMoved = 0
    this.distanceFromStart = 0
    this.totalDistanceRowed = 0
    this.ctx = ctx
    this.running = true
    this.endSound = endSound
  }

  reset = () => {
    this.distanceMoved = 0
    this.distanceFromStart = 0
    this.totalDistanceRowed = 0
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

  calculatePositions = (river, boat) => {
    const { current } = river
    const { velocity } = boat
    const distMod = ((current * 2) + velocity)

    this.distanceMoved = this.distanceMoved - distMod
    this.distanceFromStart = this.distanceMoved
    this.totalDistanceRowed = distMod > 0 ? this.totalDistanceRowed + distMod : this.totalDistanceRowed

    // console.log('Distance mod', ((current * 2) + velocity))

    // if (
    //   (((waterfall.sprite.y + waterfall.height)) - ((boat.height) / 2))
    //   > boat.y + (boat.height)
    // ) {
    if (boat.y - this.distanceFromStart < 0) {
      if (this.running) {
        this.endSound()
      }
      this.running = false
    }
    else {
      // console.log('BOAT vs WATERFALL',
      //   boat.y + (boat.height * boat.scaleFx),
      //   ((waterfall.sprite.y + waterfall.height) * boat.scaleFx)
      //   - (boat.height * boat.scaleFx) + 16)
    }
  }
}
