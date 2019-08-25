import infoDisplay from './info-display'
import thumbPath from '../assets/images/sprites/thumb.gif'
import makeSprite from './sprite'
import CONSTANTS from './constants'

export default class Tutorial {
  constructor(ctx, controls) {
    this.ctx = ctx
    this.controls = controls
    this.thumbImage = new Image()
    this.thumbImage.src = thumbPath
    this.thumbWidth = 17
    this.thumbHeight = 35
    this.isPaused = false
    this.thumbSpeed = 2
    this.currentTutorialStep = 0
    this.initRightThumb()
    this.initLeftThumb()
    this.runTutorialSteps()
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

  renderThumb = () => {
    if (!this.isPaused) {
      if (this.currentTutorialStep === 1 || this.currentTutorialStep === 3 || this.currentTutorialStep === 4) {
        this.circleLeftThumb()
        this.leftThumb.render(
          this.lThumbX,
          this.lThumbY,
        )
      }
      if (this.currentTutorialStep === 1 || this.currentTutorialStep === 2 || this.currentTutorialStep === 4) {
        this.circleRightThumb()
        this.rightThumb.render(
          this.rThumbX,
          this.rThumbY,
        )
      }
    }
  }

  runTutorialSteps = () => {
    // first show both thumbs rowing slowly
    this.setTutorialStep(1)
    infoDisplay.setMessage('Row the boat by circling your thumbs!')
    // then show just right thumb
    setTimeout(() => {
      this.setTutorialStep(2)
      infoDisplay.setMessage('Right thumb controls right oar, and makes you go left!')
    }, 7500)
    // then show just left thumb
    setTimeout(() => {
      this.setTutorialStep(3)
      infoDisplay.setMessage('Left thumb controls left oar, and makes you go right!')
    }, 15000)
    // then show just left thumb
    setTimeout(() => {
      this.setTutorialStep(4)
      this.thumbSpeed = 6
      infoDisplay.setMessage('You\'ll have to row fast if you want to get anywhere!')
    }, 22500)
    setTimeout(() => {
      this.setTutorialStep(0)
      this.thumbSpeed = 1
      infoDisplay.setMessage('')
    }, 30000)
  }

  setTutorialStep = (step) => {
    this.currentTutorialStep = step
  }
}
