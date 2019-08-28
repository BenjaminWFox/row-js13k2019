import borderSrc from '../assets/images/sprites/river-border-horizontal.png'
import bodySrc from '../assets/images/sprites/river-body.png'
import makeSprite from './sprite'
import CONSTANTS from './constants'

function randomIntFromInterval(min, max) { // min and max included
  return Math.floor(Math.random() * (max - min + 1) + min)
}

export default class River {
  constructor(ctx, currentSpeed) {
    this.ctx = ctx

    this.bodyDimention = 27
    this.bodiesInRow = Math.ceil(CONSTANTS.CANVAS_WIDTH / this.bodyDimention)
    this.rowsInBodyColumn = Math.ceil(CONSTANTS.CANVAS_HEIGHT / this.bodyDimention) + 2

    this.borderXDimension = 25
    this.borderYDimension = 240
    this.bordersInColumn = 3

    this.bordersLeft = []
    this.bordersRight = []

    this.borderImage = new Image()
    this.borderImage.src = borderSrc
    this.bodyImage = new Image()
    this.bodyImage.src = bodySrc
    this.current = currentSpeed

    this.bodyColumns = []

    this.maxBodyTileY = 0
    this.minBodyTileY = 0

    this.makeBorderLeft()
    this.makeBorderRight()
    this.makeBodySprites()
  }

  getBodySpriteYPos = (index) => ((index * this.bodyDimention) - this.bodyDimention)

  getLeftBorderYPos = (yPos, index) => (yPos + ((index - 1) * this.borderYDimension))

  getRightBorderYPos = (yPos, index) => (yPos + ((index - 1) * this.borderYDimension))

  // getLeftBorderYPos = (yPos, index) => ((index * yPos) - this.borderYDimension)

  makeBorderLeft = () => {
    this.makeBorderSprites(0, -this.borderXDimension, 90, this.bordersLeft)
  }

  makeBorderRight = () => {
    this.makeBorderSprites(-this.borderYDimension, CONSTANTS.CANVAS_WIDTH - this.borderXDimension, -90, this.bordersRight)
  }

  makeBorderSprites = (xPos, yPos, rotation, arr) => {
    console.log(xPos, rotation, arr)
    for (let i = 0; i < this.bordersInColumn; i += 1) {
      let x
      let y

      if (Math.abs(rotation) === rotation) {
        y = yPos
        x = this.getLeftBorderYPos(xPos, i)
        // console.log('LEFT sprite', x, y, xPos, i)
      }
      else {
        y = yPos
        x = this.getRightBorderYPos(xPos, i)
        // console.log('LEFT sprite', x, y, xPos, i)
      }

      const sprite = makeSprite(
        {
          context: this.ctx,
          width: this.borderYDimension,
          height: this.borderXDimension,
          image: this.borderImage,
          numberOfFrames: 0,
          x, // this is actually the Y value ... rotation ...
          y, // this is actually the X value ... rotation ...
          rotation,
        },
      )

      // console.log('Made sprite, sprite y', sprite.y)
      // console.log('Made sprite, sprite X', sprite.x)
      arr.push(sprite)
    }
  }

  makeBodySprites = () => {
    for (let i = 0; i < this.rowsInBodyColumn; i += 1) {
      if (i === 0) {
        this.minBodyTileY = this.getBodySpriteYPos(i)
      }
      if (i === this.rowsInBodyColumn - 1) {
        this.maxBodyTileY = this.getBodySpriteYPos(i)
      }

      this.bodyColumns.push(this.makeSpriteRow(i))
    }

    console.log(this.bodyColumns)
  }

  makeSpriteRow = (index) => {
    const spriteRow = []

    for (let n = 0; n < this.bodiesInRow; n += 1) {
      const x = n * this.bodyDimention
      const y = this.getBodySpriteYPos(index)
      const sprite = makeSprite(
        {
          context: this.ctx,
          width: 135,
          height: this.bodyDimention,
          image: this.bodyImage,
          numberOfFrames: 5,
          x,
          y,
        },
      )

      sprite.goToFrame(randomIntFromInterval(0, 4))
      spriteRow.push(sprite)
    }

    return spriteRow
  }

  unshiftRowToColumns = () => {
    // Add new row at start. Remove row at end.
    this.bodyColumns.unshift(this.makeSpriteRow(0))
    if (this.bodyColumns.length > this.rowsInBodyColumn + 2) {
      this.bodyColumns.splice(this.bodyColumns.length - 1, 1)
    }
  }

  pushRowToColumns = () => {
    // Add new row at end, remove row at start.
    this.bodyColumns.push(this.makeSpriteRow(this.rowsInBodyColumn - 1))
    if (this.bodyColumns.length > this.rowsInBodyColumn + 2) {
      this.bodyColumns.shift()
    }
  }

  renderBody = (velocity) => {
    const maxY = this.bodyColumns[this.bodyColumns.length - 1][0].y
    const minY = this.bodyColumns[0][0].y

    if (maxY < this.maxBodyTileY - this.bodyDimention) {
      this.pushRowToColumns(maxY, this.minBodyTileY + this.bodyDimention)
    }
    else if (minY > this.minBodyTileY + this.bodyDimention) {
      this.unshiftRowToColumns(this.maxBodyTileY - this.bodyDimention)
    }

    for (let i = 0; i < this.bodyColumns.length; i += 1) {
      for (let n = 0; n < this.bodiesInRow; n += 1) {
        const sprite = this.bodyColumns[i][n]

        sprite.y -= this.getRenderAdjustAmount(velocity)

        this.bodyColumns[i][n].render()
      }
    }
  }

  renderBorder = (velocity) => {
    for (let i = 0; i < this.bordersLeft.length; i += 1) {
      // console.log('LEFT COLUMN', this.bordersLeft[0].x, this.bordersLeft[this.bordersLeft.length - 1].x)
      if (this.bordersLeft[0].x >= 0) {
        this.unshiftBorderToColumn(this.bordersLeft, 'left')
      }
      if (this.bordersLeft[this.bordersLeft.length - 1].x <= 0) {
        this.pushBorderToColumn(this.bordersLeft, 'left')
      }
      // Unshift LEFT at GREATER THAN 0
      // Push LEFT at LESS THAN 0
      const sprite = this.bordersLeft[i]

      sprite.x -= this.getRenderAdjustAmount(velocity)
      sprite.render()
    }
    for (let i = 0; i < this.bordersRight.length; i += 1) {
      // console.log('RIGHT COLUMN', this.bordersRight[0].x, this.bordersRight[this.bordersRight.length - 1].x)
      if (this.bordersRight[0].x <= -720) {
        this.unshiftBorderToColumn(this.bordersRight, 'right')
      }
      if (this.bordersRight[this.bordersRight.length - 1].x >= 240) {
        this.pushBorderToColumn(this.bordersRight, 'right')
      }
      // Unshift RIGHT at LESS THAN -720
      // Push RIGHT at GREATER THAN 240
      const sprite = this.bordersRight[i]

      sprite.x += this.getRenderAdjustAmount(velocity)
      sprite.render()
    }
  }

  unshiftBorderToColumn = (array, debug) => {
    console.log('UNSHIFT BORDER', debug)
  }

  pushBorderToColumn = (array, debug) => {
    console.log('PUSH BORDER', debug)
  }

  render = (velocity) => {
    this.renderBody(velocity)
    this.renderBorder(velocity)
  }

  getRenderAdjustAmount = (velocity) => (this.current * 2) + velocity
}
