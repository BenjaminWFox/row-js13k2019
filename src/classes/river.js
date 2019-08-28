import borderSrc from '../assets/images/sprites/river-border.gif'
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
    this.rowsInColumns = Math.ceil(CONSTANTS.CANVAS_HEIGHT / this.bodyDimention) + 2

    this.borderImage = new Image()
    this.borderImage.src = borderSrc
    this.bodyImage = new Image()
    this.bodyImage.src = bodySrc
    this.current = currentSpeed

    this.borderSprite = makeSprite(
      {
        context: '',
        width: 25,
        height: 240,
        image: this.borderImage,
        numberOfFrames: 20,
        x: 0,
        y: 0,
      },
    )

    this.bodyColumns = []

    this.maxBodyTileY = 0
    this.minBodyTileY = 0

    this.makeBodySprites()
  }

  makeBodySprites = () => {
    for (let i = 0; i < this.rowsInColumns; i += 1) {
      if (i === 0) {
        this.minBodyTileY = this.getSpriteYPos(i)
      }
      if (i === this.rowsInColumns - 1) {
        this.maxBodyTileY = this.getSpriteYPos(i)
      }

      this.bodyColumns.push(this.makeSpriteRow(i))
    }

    console.log(this.bodyColumns)
  }

  getSpriteYPos = (index) => ((index * this.bodyDimention) - this.bodyDimention)

  makeSpriteRow = (index) => {
    const spriteRow = []

    for (let n = 0; n < this.bodiesInRow; n += 1) {
      const x = n * this.bodyDimention
      const y = this.getSpriteYPos(index)
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
    if (this.bodyColumns.length > this.rowsInColumns + 2) {
      this.bodyColumns.splice(this.bodyColumns.length - 1, 1)
    }
  }

  pushRowToColumns = () => {
    // Add new row at end, remove row at start.
    this.bodyColumns.push(this.makeSpriteRow(this.rowsInColumns - 1))
    if (this.bodyColumns.length > this.rowsInColumns + 2) {
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

        sprite.y -= (this.current * 2) + velocity

        this.bodyColumns[i][n].render()
      }
    }
  }
}
