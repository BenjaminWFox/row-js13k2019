import borderSrc from '../assets/images/sprites/river-border-horizontal-stone.png'
import bodySrc from '../assets/images/sprites/river-body.png'
import makeSprite from './sprite'
import random from './utility'
import CONSTANTS from './constants'

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

  getRenderAdjustAmount = (velocity) => (this.current * 2) + velocity

  /**
   * BORDER methods
   */
  getBorderBasePositions = () => ({
    left: {
      x: 0,
      y: -this.borderXDimension,
    },
    right: {
      x: -this.borderYDimension,
      y: CONSTANTS.CANVAS_WIDTH - this.borderXDimension,
    },
  })

  getLeftBorderYPos = (yPos, index) => (yPos + ((index - 1) * this.borderYDimension))

  getRightBorderYPos = (yPos, index) => (yPos + ((index - 1) * this.borderYDimension))

  makeBorderLeft = () => {
    const startPos = this.getBorderBasePositions()

    this.makeBorderSprites(startPos.left.x, startPos.left.y, 90, this.bordersLeft)
  }

  makeBorderRight = () => {
    const startPos = this.getBorderBasePositions()

    this.makeBorderSprites(startPos.right.x, startPos.right.y, -90, this.bordersRight)
  }

  makeBorderSprites = (xPos, yPos, rotation, arr) => {
    for (let i = 0; i < this.bordersInColumn; i += 1) {
      const sprite = this.makeBorderSprite(xPos, yPos, rotation, i)

      // console.log('Made sprite, sprite y', sprite.y)
      // console.log('Made sprite, sprite X', sprite.x)
      arr.push(sprite)
    }
  }

  makeBorderSprite = (xPos, yPos, rotation, i) => {
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

    console.log('Making new border sprite', y, x)

    return makeSprite(
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
  }

  addBordersAbove = () => {
    const startPos = this.getBorderBasePositions()

    this.bordersLeft.unshift(this.makeBorderSprite(startPos.left.x, startPos.left.y, 90, 0))
    this.bordersRight.push(this.makeBorderSprite(startPos.right.x, startPos.right.y, -90, 2))

    if (this.bordersLeft.length > 4) {
      this.bordersLeft.splice(this.bordersLeft.length - 1, 1)
    }
    if (this.bordersRight.length > 4) {
      this.bordersRight.splice(0, 1)
    }

    console.log('Added above ... ', this.bordersLeft.length, this.bordersRight.length)
  }

  addBordersBelow = () => {
    const startPos = this.getBorderBasePositions()

    this.bordersLeft.push(this.makeBorderSprite(startPos.left.x, startPos.left.y, 90, 2))
    this.bordersRight.unshift(this.makeBorderSprite(startPos.right.x, startPos.right.y, -90, 0))

    if (this.bordersLeft.length > 4) {
      this.bordersLeft.splice(0, 1)
    }
    if (this.bordersRight.length > 4) {
      this.bordersRight.splice(this.bordersRight.length - 1, 1)
    }

    console.log('Added below ... ', this.bordersLeft.length, this.bordersRight.length)
  }

  /**
   * BODY methods
   */
  getBodySpriteYPos = (index) => ((index * this.bodyDimention) - this.bodyDimention)

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

    console.log('BODY COLUMNS', this.bodyColumns)
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

      sprite.goToFrame(random(0, 4))
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

  /**
    * GENERAL methods
    */
  render = (velocity) => {
    this.renderBody(velocity)
    this.renderBorder(velocity)
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

        sprite.y -= this.getRenderAdjustAmount(velocity) + 0.15

        this.bodyColumns[i][n].render()
      }
    }
  }

  renderBorder = (velocity) => {
    if (this.bordersLeft[0].x >= 0) {
      this.addBordersAbove()
    }
    if (this.bordersLeft[this.bordersLeft.length - 1].x <= 0) {
      this.addBordersBelow()
    }

    for (let i = 0; i < this.bordersLeft.length; i += 1) {
      // Unshift LEFT at GREATER THAN 0
      // Push LEFT at LESS THAN 0
      const sprite = this.bordersLeft[i]

      sprite.x -= this.getRenderAdjustAmount(velocity)
      sprite.render()
    }
    for (let i = 0; i < this.bordersRight.length; i += 1) {
      // Unshift RIGHT at LESS THAN -720
      // Push RIGHT at GREATER THAN 240
      const sprite = this.bordersRight[i]

      sprite.x += this.getRenderAdjustAmount(velocity)
      sprite.render()
    }
  }
}
