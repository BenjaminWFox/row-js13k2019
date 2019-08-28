
export default (MID_X) => {
  let mtl

  const getMainTouchEl = () => mtl

  const setMainTouchEl = (el) => {
    mtl = el
  }

  const DIVIDING_X = MID_X

  const createMockTouchObject = (id, startX, startY) => ({
    identifier: id,
    pageX: startX,
    pageY: startY,
  })

  const buttonRegistry = {}

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
    // The in-to-out & out-to-in will be different (pos vs neg)
    // depending on the side
    const diff = side === 'left' ? x * -1 : x

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
  }

  const setLeftFrame = (x, y) => {
    if (x) {
      setFrameForX(x, 'left')
    }
    if (y) {
      setFrameForY(y, 'left')
    }
  }

  const resetAllForSide = (side) => {
    activeTouches[side] = null
    prevTouch[side].x = 0
    prevTouch[side].y = 0
    touchDiff[side].x = 0
    touchDiff[side].y = 0
    boatFrame[side] = 0
  }

  const handleNewTouch = (touchObject) => {
    if (!activeTouches.left && touchObject.pageX < DIVIDING_X) {
      activeTouches.left = touchObject
      prevTouch.left = { x: touchObject.pageX, y: touchObject.pageY }
    }

    if (!activeTouches.right && touchObject.pageX > DIVIDING_X) {
      activeTouches.right = touchObject
      prevTouch.right = { x: touchObject.pageX, y: touchObject.pageY }
    }
  }

  const handleRemovedTouch = (touchObject) => {
    if (activeTouches.left && activeTouches.left.identifier === touchObject.identifier) {
      resetAllForSide('left')
    }

    if (activeTouches.right && activeTouches.right.identifier === touchObject.identifier) {
      resetAllForSide('right')
    }
  }

  const handleMovedTouch = (touchObject) => {
    if (activeTouches.left && activeTouches.left.identifier === touchObject.identifier) {
      touchDiff.left.y += prevTouch.left.y - touchObject.pageY
      prevTouch.left.y = touchObject.pageY
      touchDiff.left.x += prevTouch.left.x - touchObject.pageX
      prevTouch.left.x = touchObject.pageX

      if (touchDiff.left.x >= 40 || touchDiff.left.x <= -40) {
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
      prevTouch.right.y = touchObject.pageY
      touchDiff.right.x += prevTouch.right.x - touchObject.pageX
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
    // console.log('Touch started', event)
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
    // console.log('Touch ended', event)
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

  const registerButton = (element, button, actionOverride = null) => {
    buttonRegistry[button.name] = (event) => {
      if (event.changedTouches.length === 1) {
        const { pageX, pageY } = event.changedTouches[0]

        if (
          pageX > button.xMin
          && pageX < button.xMax
          && pageY > button.yMin
          && pageY < button.yMax
        ) {
          if (actionOverride) {
            actionOverride()
          }
          else {
            button.action(event)
          }
        }
      }
    }

    element.addEventListener('touchend', buttonRegistry[button.name])
  }

  const clearButton = (element, button) => {
    element.removeEventListener('touchend', buttonRegistry[button.name])

    delete buttonRegistry[button.name]
  }

  return {
    init: (el) => setMainTouchEl(el),
    getMainTouchEl,
    registerBoatControls: (element) => {
      element.addEventListener('touchstart', handleTouchStart)
      element.addEventListener('touchmove', handleTouchMove)
      element.addEventListener('touchend', handleTouchEnd)
      element.addEventListener('touchcancel', handleTouchCancel)
    },
    clearBoatControls: (element) => {
      element.removeEventListener('touchstart', handleTouchStart)
      element.removeEventListener('touchmove', handleTouchMove)
      element.removeEventListener('touchend', handleTouchEnd)
      element.removeEventListener('touchcancel', handleTouchCancel)
    },
    activeTouches: () => activeTouches,
    boatFrame: () => boatFrame,
    createMockTouchObject,
    handleNewTouch,
    handleMovedTouch,
    handleRemovedTouch,
    registerButton,
    clearButton,
  }
}
