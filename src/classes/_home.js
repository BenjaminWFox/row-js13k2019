import CONSTANTS from './constants'
import Button from './button'

export default class Home {
  constructor(ctx, hs) {
    this.ctx = ctx
    this.hs = `Best: ${Math.floor(hs / 3) || 0}m`
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
      CONSTANTS.CANVAS_HEIGHT / 1.65,
      () => {
        console.log('PLAY BUTTON PRESSED!')
      },
      { fontSize: 20 },
    )
    this.tutorialBtn = new Button(
      this.tutorialBtnText,
      this.ctx.measureText(this.tutorialBtnText).width,
      approxHeight,
      CONSTANTS.CANVAS_WIDTH / 2,
      CONSTANTS.CANVAS_HEIGHT / 1.35,
      () => {
        console.log('TUTORIAL BUTTON PRESSED!')
      },
      { fontSize: 20 },
    )
    this.hsText = new Button(
      this.hs,
      this.ctx.measureText(this.hs).width,
      approxHeight,
      CONSTANTS.CANVAS_WIDTH / 2,
      CONSTANTS.CANVAS_HEIGHT / 1.15,
      () => {},
      { fontSize: 10 },
    )
    this.ctx.restore()
  }

  updateHs = (score) => {
    this.hs = `Best: ${Math.floor(score / 3) || 0}m`
    this.hsText.name = this.hs
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
    // this.ctx.save()
    // this.ctx.textAlign = 'center'
    // this.ctx.fillStyle = '#ffffff'
    // this.ctx.font = '20px Courier'

    this.playBtn.render(this.ctx)
    this.tutorialBtn.render(this.ctx)
    this.hsText.render(this.ctx)

    // this.ctx.restore()
  }

  renderMainScreen = () => {
    // if (this.currentTitleY > 60) {
    //   this.currentTitleY -= 1
    //   this.renderTitle(this.initialTitleX, this.currentTitleY)
    // }
    // else {
    //   this.renderTitle(this.initialTitleX, this.currentTitleY)
    //   this.renderMenu()
    // }
    this.renderTitle(this.initialTitleX, 60)
    this.renderMenu()
  }
}
