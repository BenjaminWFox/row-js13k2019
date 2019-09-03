import CONSTANTS from './constants'

export default class CollisionManager {
  constructor(ctx) {
    this.ctx = ctx
    this.boatY = undefined
    this.hasCollision = false
  }

  init = (boat) => {
    // this.boatY = boat.y / CONSTANTS.SCALE_FACTOR
    this.boatWidth = boat.width
    this.boatHeight = boat.height
  }

  broadPhaseCheck = (boat, obstacles) => {
    const boatBox = boat.getBoatBodyDimensions()

    obstacles.forEach((obstacle) => {
      const obstacleBox = obstacle.getObstacleBodyDimensions()

      if (
        boatBox.maxX > obstacleBox.minX
        && boatBox.minX < obstacleBox.maxX
        && boatBox.maxY > obstacleBox.minY
        && boatBox.minY < obstacleBox.maxY
      ) {
        this.narrowPhaseCheck(boatBox, boat, obstacleBox, obstacle)
      }
      else {
        boat.setUnstuck()
      }
    })
  }

  narrowPhaseCheck = (boatBox, boat, obstacleBox, obstacle) => {
    // console.log('NARROW PHASE!')

    if (boatBox.maxY > obstacleBox.maxY) {
      // Boat is stuck on the obstacle! Hold it in place...
      console.log('SET STUCK!')
      boat.setStuck()
    }
    else {
      if (boatBox.minX < obstacleBox.maxX && boatBox.maxX > obstacleBox.maxX) {
        console.log('BOUNCE RIGHT')
        boat.bounceRight()
      }
      if (boatBox.maxX > obstacleBox.minX && boatBox.minX < obstacleBox.minX) {
        console.log('BOUNCE LEFT')
        boat.bounceLeft()
      }
      if (boatBox.maxY > obstacleBox.minY) {
        // console.log('BOUNCE OFF')
        boat.resetVelocity()
      }
    }
    // else {
    //   boat.setUnstuck()
    // }
  }
}
