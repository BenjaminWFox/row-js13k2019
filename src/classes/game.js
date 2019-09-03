import Screen from './screen'
import Button from './button'
import CONSTANTS from './constants'

const quitText = '< QUIT'
const pauseText = 'PAUSE'

export default class Game extends Screen {
  constructor(ctx, controls, goToBackScreen, goToNextScreen) {
    super('Game', goToBackScreen, goToNextScreen)

    this.ctx = ctx
    this.controls = controls
    this.paused = false

    this.goToBackScreen = goToBackScreen
    this.goToNextScreen = goToNextScreen

    this.quitBtn = new Button(
      quitText,
      this.ctx.measureText(quitText).width,
      this.ctx.measureText('L').width,
      2,
      10,
      () => {
        this.leave()
      },
      { fontSize: 10, alignment: 'left' },
    )

    this.pauseBtn = new Button(
      pauseText,
      this.ctx.measureText(pauseText).width,
      this.ctx.measureText('L').width,
      CONSTANTS.CANVAS_WIDTH - 2,
      10,
      () => {
        this.paused = !this.paused
      },
      { fontSize: 10, alignment: 'right' },
    )

    this.distanceTraveled = 0
    this.score = new Button(
      this.scoreText,
      this.ctx.measureText(this.scoreText).width,
      this.ctx.measureText('L').width,
      2,
      25,
      () => {
        console.log('PAUSE BUTTON PRESSED!')
      },
      { fontSize: 10, alignment: 'left' },
    )
  }

  get scoreText() {
    return `Traveled: ${this.distanceTraveled}m`
  }

  goTo = () => {
    this.controls.registerButton(this.controls.getMainTouchEl(), this.quitBtn)
    this.controls.registerButton(this.controls.getMainTouchEl(), this.pauseBtn)
  }

  leave = () => {
    this.controls.clearButton(this.controls.getMainTouchEl(), this.quitBtn)
    this.controls.clearButton(this.controls.getMainTouchEl(), this.pauseBtn)
    this.goToBackScreen()
  }

  updateScore = (distance) => {
    this.distanceTraveled = Math.floor((distance / 3))
    this.score.name = this.scoreText
  }

  render = (distanceMoved) => {
    this.updateScore(distanceMoved)

    this.quitBtn.render(this.ctx)
    this.pauseBtn.render(this.ctx)
    this.score.render(this.ctx)
  }
}
