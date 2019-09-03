import Tree from './tree'
import Rock from './rock'
import makeObstacle from './obstacle'
import random from './utility'
import CONSTANTS from './constants'

export default class ObstacleManager {
  constructor(ctx) {
    this.ctx = ctx
    this.obstacles = []
  }

  renderObstacles = (velocity) => {
    this.obstacles.forEach((obstacle) => {
      obstacle.render(velocity)
    })
  }

  spawnObstacle = () => {
    const type = random(1, 2)

    if (type === 1) {
      this.spawnRock()
    }
    else {
      this.spawnTree()
    }
  }

  spawnTree = () => {
    const tree = makeObstacle(this.ctx, Tree)

    // tree.x = random(tree.minX, tree.maxX)
    tree.x = 50
    tree.y = CONSTANTS.CANVAS_HEIGHT / 2

    this.obstacles.push(tree)
  }

  spawnRock = () => {
    const rock = makeObstacle(this.ctx, Rock)

    // rock.x = random(rock.minX, rock.maxX)
    rock.x = 50
    rock.y = CONSTANTS.CANVAS_HEIGHT / 2

    this.obstacles.push(rock)
  }
}
