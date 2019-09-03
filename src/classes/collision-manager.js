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
        (boatBox.minX > obstacleBox.minX
        && boatBox.minY > obstacleBox.minY)
        // || (boatBox.maxX < obstacleBox.maxX
        // && boatBox.maxY < obstacleBox.maxY)
      ) {
        console.log('GO TO NARROW PHASE')
      }
    })
  }

  narrowPhaseCheck = (boatBox, obstacle) => {
    // if (boatBox.maxX > obstacle.x + obstacle.collisionOffsets.nw
    //   && boatBox.maxY > obstacle.y + obstacle.collisionOffsets.nw) {
    //   console.log('NW Collision...')
    //   this.hasCollision = true
    // }
  }
}
