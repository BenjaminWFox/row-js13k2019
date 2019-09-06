export default class CollisionManager {
  constructor(ctx, colSound) {
    this.ctx = ctx
    this.boatY = undefined
    this.hasCollision = false
    this.colSound = colSound

    this.collisions = 0
    this.lastCollisionAt = 0
  }

  init = (boat) => {
    // this.boatY = boat.y / CONSTANTS.SCALE_FACTOR
    this.boatWidth = boat.width
    this.boatHeight = boat.height
  }

  reset = () => {
    this.collisions = 0
    this.lastCollisionAt = 0
  }

  addCollision = () => {
    const now = Date.now()

    if (now > this.lastCollisionAt + 500) {
      this.colSound()
      this.collisions += 1
      this.lastCollisionAt = now
    }
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

  narrowPhaseCheck = (boatBox, boat, obstacleBox) => {
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
      this.addCollision()
    }
    else if (boatBox.maxY > obstacleBox.minY + buffer) {
      console.log('BOUNCE OFF')
      boat.resetVelocity()
      this.addCollision()
    }

    if (
      boatBox.minX < obstacleBox.maxX - buffer
        && boatBox.maxX > obstacleBox.maxX
    ) {
      console.log('BOUNCE RIGHT')
      boat.bounceRight()
      this.addCollision()
    }
    if (
      boatBox.maxX > obstacleBox.minX + buffer
        && boatBox.minX < obstacleBox.minX
    ) {
      console.log('BOUNCE LEFT')
      boat.bounceLeft()
      this.addCollision()
    }
    // else {
    //   boat.setUnstuck()
    // }
  }
}
