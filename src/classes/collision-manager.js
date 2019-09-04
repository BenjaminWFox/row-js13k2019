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
    })
  }

  narrowPhaseCheck = (boatBox, boat, obstacleBox, obstacle) => {
    // console.log('Y: ', boatBox.maxY, obstacleBox.midY)
    console.log('X: ', boatBox.maxX, obstacleBox.midX, obstacleBox.quadSize)
    let buffer = 0

    if (
      boatBox.maxX < obstacleBox.midX - obstacleBox.quadSize
      && boatBox.maxY < obstacleBox.midY
    ) {
      console.log('NW Quad...')
      buffer = obstacleBox.quadSize
    }
    else if (
      boatBox.maxX > obstacleBox.midX + obstacleBox.quadSize
      && boatBox.maxY < obstacleBox.midY
    ) {
      console.log('NE Quad...')
      buffer = obstacleBox.quadSize
    }
    else if (
      boatBox.minX > obstacleBox.midX + obstacleBox.quadSize
      && boatBox.minY > obstacleBox.midY
    ) {
      console.log('SE Quad...')
      buffer = obstacleBox.quadSize
    }
    else if (
      boatBox.maxX < obstacleBox.midX - obstacleBox.quadSize
      && boatBox.minY > obstacleBox.midY
    ) {
      console.log('SW Quad...')
    }

    if (
      boatBox.maxY > obstacleBox.maxY
      && boatBox.maxY - obstacleBox.maxY > boat.height / 6
      && boatBox.minX > obstacleBox.minX
      && boatBox.maxX < obstacleBox.maxX
    ) {
      // Boat is stuck on the obstacle! Hold it in place...
      console.log('SET STUCK!')
      boat.setStuck()
    }
    else if (boatBox.maxY > obstacleBox.minY + buffer) {
      console.log('BOUNCE OFF')
      boat.resetVelocity()
    }

    if (
      boatBox.minX < obstacleBox.maxX - buffer
        && boatBox.maxX > obstacleBox.maxX
    ) {
      console.log('BOUNCE RIGHT')
      boat.bounceRight()
    }
    if (
      boatBox.maxX > obstacleBox.minX + buffer
        && boatBox.minX < obstacleBox.minX
    ) {
      console.log('BOUNCE LEFT')
      boat.bounceLeft()
    }
    // else {
    //   boat.setUnstuck()
    // }
  }
}
