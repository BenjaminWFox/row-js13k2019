import infoDisplay from './info-display'
import thumbPath from '../assets/images/sprites/thumb.png'
import makeSprite from './sprite'
import { setCookie, getCookie } from './cookie'
import Button from './button'
import Screen from './screen'
import C from './constants'

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
    this.cTS = 0
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
      C.CANVAS_WIDTH / 2,
      C.CANVAS_HEIGHT / 5,
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

    this.rTX = C.CANVAS_WIDTH - this.thumbWidth - (C.CANVAS_WIDTH / 3)
    this.rTY = C.CANVAS_HEIGHT - this.thumbHeight - 10
    this.currentRightThumbStep = 0
    this.rightThumbPath = {
      0: this.rTY,
      1: this.rTY - 50,
      2: this.rTX + 30,
      3: this.rTY,
      4: this.rTX,
    }
    this.rtMockControl = this.controls.createMockTouchObject(
      'rt',
      // This math is because the `rThumbX value is relative to the original, un-scaled canvas.
      // It has to be scaled, and adjusted to be correct relative to the MID-X that the controls use
      // which is the middle of the viewport
      (this.rTX * C.SCALE_FACTOR)
      + ((C.SCREEN_WIDTH - C.SCALED_WIDTH) / 2),
      this.rTY * C.SCALE_FACTOR,
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

    this.lTX = 0 + (C.CANVAS_WIDTH / 3)
    this.lTY = C.CANVAS_HEIGHT - this.thumbHeight - 10

    this.currentLeftThumbStep = 0
    this.leftThumbPath = {
      0: this.lTY,
      1: this.lTY - 50,
      2: this.lTX - 30,
      3: this.lTY,
      4: this.lTX,
    }
    this.ltMockControl = this.controls.createMockTouchObject(
      'lt',
      // See note above on what this math is doing
      (this.lTX * C.SCALE_FACTOR)
      + ((C.SCREEN_WIDTH - C.SCALED_WIDTH) / 2),
      this.lTY * C.SCALE_FACTOR,
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
        if (this.rTY > this.rightThumbPath[1]) {
          this.rTY -= this.thumbSpeed
        }
        else {
          this.currentRightThumbStep = 1
        }
        break
      case 1:
        if (this.rTX < this.rightThumbPath[2]) {
          this.rTX += this.thumbSpeed
        }
        else {
          this.currentRightThumbStep = 2
        }
        break
      case 2:
        if (this.rTY < this.rightThumbPath[3]) {
          this.rTY += this.thumbSpeed
        }
        else {
          this.currentRightThumbStep = 3
        }
        break
      case 3:
        if (this.rTX > this.rightThumbPath[4]) {
          this.rTX -= this.thumbSpeed
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
    this.rtMockControl.pageX = this.rTX * C.CANVAS_RATIO
    this.rtMockControl.pageY = this.rTY * C.CANVAS_RATIO
    this.controls.handleMovedTouch(this.rtMockControl)
  }

  circleLeftThumb = () => {
    switch (this.currentLeftThumbStep) {
      case 0:
        if (this.lTY > this.leftThumbPath[1]) {
          this.lTY -= this.thumbSpeed
        }
        else {
          this.currentLeftThumbStep = 1
        }
        break
      case 1:
        if (this.lTX > this.leftThumbPath[2]) {
          this.lTX -= this.thumbSpeed
        }
        else {
          this.currentLeftThumbStep = 2
        }
        break
      case 2:
        if (this.lTY < this.leftThumbPath[3]) {
          this.lTY += this.thumbSpeed
        }
        else {
          this.currentLeftThumbStep = 3
        }
        break
      case 3:
        if (this.lTX < this.leftThumbPath[4]) {
          this.lTX += this.thumbSpeed
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
    this.ltMockControl.pageX = this.lTX * C.CANVAS_RATIO
    this.ltMockControl.pageY = this.lTY * C.CANVAS_RATIO
    this.controls.handleMovedTouch(this.ltMockControl)
  }

  renderTutorial = () => {
    this.backBtn.render(this.ctx)

    if (!this.isPaused) {
      if (this.cTS === 1
        || this.cTS === 3
        || this.cTS === 4
      ) {
        this.circleLeftThumb()
        this.leftThumb.render(
          this.lTX,
          this.lTY,
        )
      }
      if (this.cTS === 1
        || this.cTS === 2
        || this.cTS === 4
      ) {
        this.circleRightThumb()
        this.rightThumb.render(
          this.rTX,
          this.rTY,
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
    this.cTS = step
  }
}
