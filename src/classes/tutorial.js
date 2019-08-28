import infoDisplay from './info-display'
import thumbPath from '../assets/images/sprites/thumb.png'
import makeSprite from './sprite'
import { setCookie, getCookie } from './cookie'
import Button from './button'
import Screen from './screen'
import CONSTANTS from './constants'

const tutorialScreenDuration = 7500

export default class Tutorial extends Screen {
  constructor(ctx, controls) {
    super('Tutorial')

    this.ctx = ctx
    this.controls = controls
    this.thumbImage = new Image()
    this.thumbImage.src = thumbPath
    this.thumbWidth = 17
    this.thumbHeight = 35
    this.running = false
    this.thumbSpeed = undefined
    this.currentTutorialStep = 0
    this.cookieName = 'tutorial'
    this.hasBeenSeen = getCookie(this.cookieName)
    let step1
    let step2
    let step3
    let step4

    this.steps = [step1, step2, step3, step4]
    this.setSlowThumbspeed()

    this.backBtn = new Button(
      '< Back',
      this.ctx.measureText('< Back').width,
      this.ctx.measureText('L').width,
      CONSTANTS.CANVAS_WIDTH / 2,
      CONSTANTS.CANVAS_HEIGHT / 3.75,
      () => {
        console.log('BACK BUTTON PRESSED!')
      },
      { fontSize: 20 },
    )
  }

  goTo = () => {

  }

  leave = () => {
    this.stopTutorial()
    this.controls.clearButton(this.controls.getMainTouchEl(), this.backBtn)
  }

  setSlowThumbspeed = () => {
    this.thumbSpeed = 2
  }

  setFastThumbspeed = () => {
    this.thumbSpeed = 6
  }

  initRightThumb = () => {
    this.rightThumb = makeSprite({
      context: this.ctx,
      width: this.thumbWidth,
      height: this.thumbHeight,
      image: this.thumbImage,
      numberOfFrames: 1,
      loop: false,
      ticksPerFrame: 0,
      x: 0,
      y: 0,
    })

    this.rThumbX = CONSTANTS.CANVAS_WIDTH - this.thumbWidth - (CONSTANTS.CANVAS_WIDTH / 3)
    this.rThumbY = CONSTANTS.CANVAS_HEIGHT - this.thumbHeight - 10
    this.currentRightThumbStep = 0
    this.rightThumbPath = {
      0: this.rThumbY,
      1: this.rThumbY - 50,
      2: this.rThumbX + 30,
      3: this.rThumbY,
      4: this.rThumbX,
    }
    this.rtMockControl = this.controls.createMockTouchObject(
      'rt',
      // This math is because the `rThumbX value is relative to the original, un-scaled canvas.
      // It has to be scaled, and adjusted to be correct relative to the MID-X that the controls use
      // which is the middle of the viewport
      (this.rThumbX * CONSTANTS.SCALE_FACTOR)
      + ((CONSTANTS.SCREEN_WIDTH - CONSTANTS.SCALED_WIDTH) / 2),
      this.rThumbY * CONSTANTS.SCALE_FACTOR,
    )
    this.controls.handleNewTouch(this.rtMockControl)
  }

  initLeftThumb = () => {
    this.leftThumb = makeSprite({
      context: this.ctx,
      width: this.thumbWidth,
      height: this.thumbHeight,
      image: this.thumbImage,
      numberOfFrames: 1,
      loop: false,
      ticksPerFrame: 0,
      x: 0,
      y: 0,
    })

    this.lThumbX = 0 + (CONSTANTS.CANVAS_WIDTH / 3)
    this.lThumbY = CONSTANTS.CANVAS_HEIGHT - this.thumbHeight - 10

    this.currentLeftThumbStep = 0
    this.leftThumbPath = {
      0: this.lThumbY,
      1: this.lThumbY - 50,
      2: this.lThumbX - 30,
      3: this.lThumbY,
      4: this.lThumbX,
    }
    this.ltMockControl = this.controls.createMockTouchObject(
      'lt',
      // See note above on what this math is doing
      (this.lThumbX * CONSTANTS.SCALE_FACTOR)
      + ((CONSTANTS.SCREEN_WIDTH - CONSTANTS.SCALED_WIDTH) / 2),
      this.lThumbY * CONSTANTS.SCALE_FACTOR,
    )
    this.controls.handleNewTouch(this.ltMockControl)
  }

  removeThumbs = () => {
    this.controls.handleRemovedTouch(this.rtMockControl)
    this.controls.handleRemovedTouch(this.ltMockControl)
  }

  circleRightThumb = () => {
    switch (this.currentRightThumbStep) {
      case 0:
        if (this.rThumbY > this.rightThumbPath[1]) {
          this.rThumbY -= this.thumbSpeed
        }
        else {
          this.currentRightThumbStep = 1
        }
        break
      case 1:
        if (this.rThumbX < this.rightThumbPath[2]) {
          this.rThumbX += this.thumbSpeed
        }
        else {
          this.currentRightThumbStep = 2
        }
        break
      case 2:
        if (this.rThumbY < this.rightThumbPath[3]) {
          this.rThumbY += this.thumbSpeed
        }
        else {
          this.currentRightThumbStep = 3
        }
        break
      case 3:
        if (this.rThumbX > this.rightThumbPath[4]) {
          this.rThumbX -= this.thumbSpeed
        }
        else {
          this.currentRightThumbStep = 4
        }
        break
      case 4:
        this.currentRightThumbStep = 0
        break
      default:
        break
    }
    this.rtMockControl.pageX = this.rThumbX * CONSTANTS.CANVAS_RATIO
    this.rtMockControl.pageY = this.rThumbY * CONSTANTS.CANVAS_RATIO
    this.controls.handleMovedTouch(this.rtMockControl)
  }

  circleLeftThumb = () => {
    switch (this.currentLeftThumbStep) {
      case 0:
        if (this.lThumbY > this.leftThumbPath[1]) {
          this.lThumbY -= this.thumbSpeed
        }
        else {
          this.currentLeftThumbStep = 1
        }
        break
      case 1:
        if (this.lThumbX > this.leftThumbPath[2]) {
          this.lThumbX -= this.thumbSpeed
        }
        else {
          this.currentLeftThumbStep = 2
        }
        break
      case 2:
        if (this.lThumbY < this.leftThumbPath[3]) {
          this.lThumbY += this.thumbSpeed
        }
        else {
          this.currentLeftThumbStep = 3
        }
        break
      case 3:
        if (this.lThumbX < this.leftThumbPath[4]) {
          this.lThumbX += this.thumbSpeed
        }
        else {
          this.currentLeftThumbStep = 4
        }
        break
      case 4:
        this.currentLeftThumbStep = 0
        break
      default:
        break
    }
    this.ltMockControl.pageX = this.lThumbX * CONSTANTS.CANVAS_RATIO
    this.ltMockControl.pageY = this.lThumbY * CONSTANTS.CANVAS_RATIO
    this.controls.handleMovedTouch(this.ltMockControl)
  }

  renderTutorial = () => {
    this.backBtn.render(this.ctx)

    if (!this.isPaused) {
      if (this.currentTutorialStep === 1
        || this.currentTutorialStep === 3
        || this.currentTutorialStep === 4
      ) {
        this.circleLeftThumb()
        this.leftThumb.render(
          this.lThumbX,
          this.lThumbY,
        )
      }
      if (this.currentTutorialStep === 1
        || this.currentTutorialStep === 2
        || this.currentTutorialStep === 4
      ) {
        this.circleRightThumb()
        this.rightThumb.render(
          this.rThumbX,
          this.rThumbY,
        )
      }
    }
  }

  runTutorialSteps = () => {
    this.initRightThumb()
    this.initLeftThumb()
    this.hasBeenSeen = 1
    setCookie(this.cookieName, 1)
    this.running = true
    infoDisplay.show()
    // first show both thumbs rowing slowly
    this.setTutorialStep(1)
    infoDisplay.setMessage('Circle thumbs to row!')
    // then show just right thumb
    this.steps[0] = setTimeout(() => {
      this.setTutorialStep(2)
      infoDisplay.setMessage('R thumb - R oar!')
    }, tutorialScreenDuration * 1)
    // then show just left thumb
    this.steps[1] = setTimeout(() => {
      this.setTutorialStep(3)
      infoDisplay.setMessage('L thumb - L oar!')
    }, tutorialScreenDuration * 2)
    // then show just left thumb
    this.steps[2] = setTimeout(() => {
      this.setTutorialStep(4)
      this.setFastThumbspeed()
      infoDisplay.setMessage('Row fast to go go go!')
    }, tutorialScreenDuration * 3)
    this.steps[3] = setTimeout(() => {
      this.stopTutorial()
    }, tutorialScreenDuration * 4)
  }

  stopTutorial = () => {
    this.setTutorialStep(0)
    this.steps.forEach((step, i) => {
      console.log('Step?', i, step)
      if (step) {
        clearTimeout(step)
      }
    })
    this.setSlowThumbspeed()
    infoDisplay.setMessage('')
    this.removeThumbs()
    infoDisplay.hide()
    this.running = false
  }

  setTutorialStep = (step) => {
    this.currentTutorialStep = step
  }
}
