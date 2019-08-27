import CONSTANTS from './constants'

export default class Home {
  constructor(ctx) {
    this.ctx = ctx
    this.title = 'ROW'
    this.playBtn = 'PLAY'
    this.tutorialBtn = 'Tutorial'
    this.initialTitleX = CONSTANTS.CANVAS_WIDTH / 2
    this.initialTitleY = CONSTANTS.CANVAS_HEIGHT / 2
    this.currentTitleY = CONSTANTS.CANVAS_HEIGHT / 2
  }

  renderInitialLoad = () => {
    this.renderTitle(this.initialTitleX, this.initialTitleY)
  }

  renderTitle = (x, y) => {
    this.ctx.save()
    this.ctx.textAlign = 'center'
    this.ctx.fillStyle = '#ffffff'
    this.ctx.font = '70px Courier'
    this.ctx.fillText(this.title, x, y)
    this.ctx.restore()
  }

  renderMenu = () => {
    this.ctx.save()
    this.ctx.textAlign = 'center'
    this.ctx.fillStyle = '#ffffff'
    this.ctx.font = '20px Courier'
    this.ctx.fillText(this.playBtn, CONSTANTS.CANVAS_WIDTH / 2, CONSTANTS.CANVAS_HEIGHT / 1.6)
    this.ctx.fillText(this.tutorialBtn, CONSTANTS.CANVAS_WIDTH / 2, CONSTANTS.CANVAS_HEIGHT / 1.25)
    this.ctx.restore()
  }

  renderMainScreen = () => {
    if (this.currentTitleY > 60) {
      this.currentTitleY -= 1
      this.renderTitle(this.initialTitleX, this.currentTitleY)
    }
    else {
      this.renderTitle(this.initialTitleX, this.currentTitleY)
      this.renderMenu()
    }
  }
}
