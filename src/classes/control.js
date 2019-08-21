
export default (MID_X) => {
  const DIVIDING_X = MID_X

  const activeTouches = {
    left: null,
    right: null,
  }

  const prevTouch = {
    left: {
      x: 0,
      y: 0,
    },
    right: {
      x: 0,
      y: 0,
    },
  }

  const touchDiff = {
    left: {
      x: 0,
      y: 0,
    },
    right: {
      x: 0,
      y: 0,
    },
  }

  const boatFrame = {
    left: 0,
    right: 0,
  }

  const setFrameForX = (x, side) => {
    const diff = side === 'left' ? x * -1 : x

    console.log('set right X frame', diff)
    switch (boatFrame[side]) {
      case 1:
        if (Math.abs(x) !== diff) {
          boatFrame[side] = 2
        }
        break
      case 5:
        if (Math.abs(x) === diff) {
          boatFrame[side] = 6
        }
        break
      default:
    }
  }

  const setFrameForY = (y, side) => {
    console.log('Set right Y frame', y)
    switch (boatFrame[side]) {
      case 0:
        if (Math.abs(y) === y) {
          boatFrame[side] = 1
        }
        break
      case 2:
        if (Math.abs(y) !== y) {
          boatFrame[side] = 3
        }
        break
      case 3:
        if (Math.abs(y) !== y) {
          boatFrame[side] = 4
        }
        break
      case 4:
        if (Math.abs(y) !== y) {
          boatFrame[[side]] = 5
        }
        break
      case 5:
        if (Math.abs(y) === y) {
          boatFrame[side] = 6
        }
        break
      case 6:
        if (Math.abs(y) === y) {
          boatFrame[side] = 0
        }
        break
      default:
    }
  }

  const setRightFrame = (x, y) => {
    if (x) {
      setFrameForX(x, 'right')
    }
    if (y) {
      setFrameForY(y, 'right')
    }

    console.log(boatFrame.right)
  }

  const setLeftFrame = (x, y) => {
    if (x) {
      setFrameForX(x, 'left')
    }
    if (y) {
      setFrameForY(y, 'left')
    }

    console.log(boatFrame.right)
  }

  const handleNewTouch = (touchObject) => {
    if (!activeTouches.left && touchObject.pageX < DIVIDING_X) {
      console.log('New LEFT touch!')
      activeTouches.left = touchObject
      prevTouch.left = { x: touchObject.pageX, y: touchObject.pageY }
    }

    if (!activeTouches.right && touchObject.pageX > DIVIDING_X) {
      console.log('New RIGHT touch!')
      activeTouches.right = touchObject
      prevTouch.right = { x: touchObject.pageX, y: touchObject.pageY }
    }
  }

  const handleRemovedTouch = (touchObject) => {
    if (activeTouches.left && activeTouches.left.identifier === touchObject.identifier) {
      console.log('Removed LEFT touch!')
      activeTouches.left = null
    }

    if (activeTouches.right && activeTouches.right.identifier === touchObject.identifier) {
      console.log('Removed RIGHT touch!')
      activeTouches.right = null
    }
  }

  // We need to know:
  // The x diff
  // The y diff
  // IF (frame === 2) -> if the x diff

  // LEFT thumb 100 to 50 -> IN to OUT will be POSITIVE
  // -- OUT to IN will be NEGATIVE

  // RIGHT thumb 400 to 450 -> IN to OUT will be NEGATIVE
  // -- OUT to IN will be POSITIVE

  // prevTouch.right = { x: touchObject.pageX, y: touchObject.pageY }

  const handleMovedTouch = (touchObject) => {
    if (activeTouches.left && activeTouches.left.identifier === touchObject.identifier) {
      touchDiff.left.y += prevTouch.left.y - touchObject.pageY
      // console.log('tdR.Y', touchDiff.right.y)
      prevTouch.left.y = touchObject.pageY

      touchDiff.left.x += prevTouch.left.x - touchObject.pageX
      // console.log('tdR.X', touchDiff.right.x)
      prevTouch.left.x = touchObject.pageX


      if (touchDiff.left.x >= 20 || touchDiff.left.x <= -20) {
        setLeftFrame(touchDiff.left.x, undefined)
        touchDiff.left.x = 0
      }
      if (touchDiff.left.y >= 20 || touchDiff.left.y <= -20) {
        setLeftFrame(undefined, touchDiff.left.y)
        touchDiff.left.y = 0
      }
    }

    if (activeTouches.right && activeTouches.right.identifier === touchObject.identifier) {
      touchDiff.right.y += prevTouch.right.y - touchObject.pageY
      // console.log('tdR.Y', touchDiff.right.y)
      prevTouch.right.y = touchObject.pageY

      touchDiff.right.x += prevTouch.right.x - touchObject.pageX
      // console.log('tdR.X', touchDiff.right.x)
      prevTouch.right.x = touchObject.pageX


      if (touchDiff.right.x >= 20 || touchDiff.right.x <= -20) {
        setRightFrame(touchDiff.right.x, undefined)
        touchDiff.right.x = 0
      }
      if (touchDiff.right.y >= 20 || touchDiff.right.y <= -20) {
        setRightFrame(undefined, touchDiff.right.y)
        touchDiff.right.y = 0
      }
    }
  }

  const handleTouchStart = (event) => {
    console.log('Touch started', event)
    switch (event.changedTouches.length) {
      case 1:
        handleNewTouch(event.changedTouches[0])
        break
      case 2:
        handleNewTouch(event.changedTouches[0])
        handleNewTouch(event.changedTouches[1])
        break
      default:
    }
  }

  const handleTouchMove = (event) => {
    // console.log('Touch moved', event)
    switch (event.changedTouches.length) {
      case 1:
        handleMovedTouch(event.changedTouches[0])
        break
      case 2:
        handleMovedTouch(event.changedTouches[0])
        handleMovedTouch(event.changedTouches[1])
        break
      default:
    }
  }

  const handleTouchEnd = (event) => {
    console.log('Touch ended', event)
    switch (event.changedTouches.length) {
      case 1:
        handleRemovedTouch(event.changedTouches[0])
        break
      case 2:
        handleRemovedTouch(event.changedTouches[0])
        handleRemovedTouch(event.changedTouches[1])
        break
      default:
    }
  }

  const handleTouchCancel = (event) => {
    console.log('Touch cancelled', event)
    activeTouches.left = null
    activeTouches.right = null
  }

  return {
    init: (element) => {
      console.log('Running!')
      element.addEventListener('touchstart', handleTouchStart)
      element.addEventListener('touchmove', handleTouchMove)
      element.addEventListener('touchend', handleTouchEnd)
      element.addEventListener('touchcancel', handleTouchCancel)
    },
    activeTouches: () => activeTouches,
    boatFrame: () => boatFrame,
  }
}
