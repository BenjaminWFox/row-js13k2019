import CONSTANTS from './constants'
import Button from './button'

export default class Home {
  constructor(ctx) {
    this.ctx = ctx
    this.title = 'ROW'
    this.playBtnText = 'PLAY'
    this.tutorialBtnText = 'TUTORIAL'
    this.initialTitleX = CONSTANTS.CANVAS_WIDTH / 2
    this.initialTitleY = CONSTANTS.CANVAS_HEIGHT / 2
    this.currentTitleY = CONSTANTS.CANVAS_HEIGHT / 2
    this.playBtnDimentions = undefined
    this.tutorialBtnDimensions = undefined

    this.ctx.save()
    this.ctx.textAlign = 'center'
    this.ctx.fillStyle = '#ffffff'
    this.ctx.font = '20px Courier'
    const approxHeight = this.ctx.measureText('L').width

    this.playBtn = new Button(
      this.playBtnText,
      this.ctx.measureText(this.playBtnText).width,
      approxHeight,
      CONSTANTS.CANVAS_WIDTH / 2,
      CONSTANTS.CANVAS_HEIGHT / 1.6,
      () => {
        console.log('PLAY BUTTON PRESSED!')
      },
    )
    this.tutorialBtn = new Button(
      this.tutorialBtnText,
      this.ctx.measureText(this.tutorialBtnText).width,
      approxHeight,
      CONSTANTS.CANVAS_WIDTH / 2,
      CONSTANTS.CANVAS_HEIGHT / 1.25,
      () => {
        console.log('TUTORIAL BUTTON PRESSED!')
      },
    )
    this.ctx.restore()
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

    this.playBtn.render(this.ctx)
    this.tutorialBtn.render(this.ctx)

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
