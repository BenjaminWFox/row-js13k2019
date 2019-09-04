import Tree from './tree'
import Rock from './rock'
import makeObstacle from './obstacle'
import random from './utility'
import CONSTANTS from './constants'

export default class ObstacleManager {
  constructor(ctx) {
    this.ctx = ctx
    this.obstacles = []
    this.waterfall = []
    this.spawnKey = 7
    this.spawnFrequency = 150
    this.difficultyMultiplyer = 15
    this.maxSpawnFrequency = 40
    this.lastSpawnAt = 0
  }

  makeWaterfall = () => {
    let waterfallObjects = 50

    while (waterfallObjects > 0) {
      this.waterfall.push(this.spawnRock(null, random(-10, -140)))
      this.waterfall.push(this.spawnTree(null, random(-10, -140)))
      waterfallObjects -= 1
    }
  }

  render = (velocity) => {
    this.renderWaterfall(velocity)
    this.renderObstacles(velocity)
  }

  renderWaterfall = (velocity) => {
    this.waterfall.forEach((item) => {
      item.render(velocity)
    })
  }

  renderObstacles = (velocity) => {
    this.obstacles.forEach((obstacle) => {
      obstacle.render(velocity)
    })
  }

  trySpawnObstacle = (distance, difficulty) => {
    const spawnDifficulty = this.spawnFrequency - (this.difficultyMultiplyer * difficulty)
    const spawnCheckNum = spawnDifficulty < this.maxSpawnFrequency ? this.maxSpawnFrequency : spawnDifficulty
    const canSpawnNum = distance - spawnCheckNum

    if (canSpawnNum > this.lastSpawnAt) {
      if (random(1, 20) === this.spawnKey) {
        this.spawnObstacle()

        this.lastSpawnAt = distance
      }
    }
  }

  spawnObstacle = () => {
    const type = random(1, 2)
    let obstacle

    if (type === 1) {
      obstacle = this.spawnRock()
    }
    else {
      obstacle = this.spawnTree()
    }

    this.obstacles.push(obstacle)
  }

  spawnTree = (x, y) => {
    const tree = makeObstacle(this.ctx, Tree)

    tree.x = x || random(tree.minX, tree.maxX)
    tree.y = y || random(CONSTANTS.CANVAS_HEIGHT, CONSTANTS.CANVAS_HEIGHT + 25)

    return tree
  }

  spawnRock = (x, y) => {
    const rock = makeObstacle(this.ctx, Rock)

    rock.x = x || random(rock.minX, rock.maxX)
    rock.y = y || random(CONSTANTS.CANVAS_HEIGHT, CONSTANTS.CANVAS_HEIGHT + 25)

    return rock
  }
}
