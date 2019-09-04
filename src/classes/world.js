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

  calculatePositions = (river, boat, state) => {
    const { current } = river
    const { velocity } = boat
    const distMod = ((current * 2) + velocity)

    if (this.running) {
      this.distanceMoved = this.distanceMoved - distMod
      this.distanceFromStart = this.distanceMoved
      this.totalDistanceRowed = distMod > 0
        ? this.totalDistanceRowed + distMod
        : this.totalDistanceRowed
    }

    if (state === 'game' && boat.y - this.distanceFromStart < 0) {
      this.running = false
    }
  }
}
