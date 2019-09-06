import Screen from './screen'
import Button from './button'
import CONSTANTS from './constants'

const quitText = '< QUIT'
const pauseText = 'PAUSE'

export default class Game extends Screen {
  constructor(ctx, controls, goToBackScreen, sound) {
    super('Game', goToBackScreen, undefined)

    this.ctx = ctx
    this.controls = controls
    this.sound = sound
    console.log('GAME', this.sound)
    this.paused = false
    this.resetDifficulty()

    this.goToBackScreen = goToBackScreen
    // this.goToNextScreen = goToNextScreen

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
        if (this.paused) {
          console.log('PAUSE')
          this.sound.mute()
        }
        else {
          this.sound.unmute()
        }
      },
      { fontSize: 10, alignment: 'right' },
    )

    this.gameOverBtn = new Button(
      'GAMEOVER',
      this.ctx.measureText('GAMEOVER').width,
      this.ctx.measureText('L').width,
      CONSTANTS.CANVAS_WIDTH / 2,
      110,
      () => {
        this.leave()
      },
      { fontSize: 25, alignment: 'center' },
    )

    this.distanceRowed = 0
    this.score = new Button(
      this.scoreText,
      this.ctx.measureText(this.scoreText).width,
      this.ctx.measureText('L').width,
      CONSTANTS.CANVAS_WIDTH / 2,
      27,
      () => {
        console.log('PAUSE BUTTON PRESSED!')
      },
      { fontSize: 20, alignment: 'center' },
    )
  }

  get scoreText() {
    return `${this.distanceRowed}m`
  }

  resetDifficulty = () => {
    this.difficulty = 0
  }

  updateDifficulty = (distance) => {
    this.difficulty = Math.floor(distance / 100)
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
    this.distanceRowed = Math.floor((distance / 3))
    this.score.name = this.scoreText

    this.updateDifficulty(this.distanceRowed)
  }

  render = (distanceRowed) => {
    this.updateScore(distanceRowed)

    this.quitBtn.render(this.ctx)
    this.pauseBtn.render(this.ctx)
    this.score.render(this.ctx)
  }

  renderGameOver = () => {
    this.gameOverBtn.render(this.ctx)
  }
}
