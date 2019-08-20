
export default (MID_X) => {
  const DIVIDING_X = MID_X

  const activeTouches = {
    left: null,
    right: null,
  }

  const handleNewTouch = (touchObject) => {
    if (!activeTouches.left && touchObject.pageX < DIVIDING_X) {
      console.log('New LEFT touch!')
      activeTouches.left = touchObject
    }

    if (!activeTouches.right && touchObject.pageX > DIVIDING_X) {
      console.log('New RIGHT touch!')
      activeTouches.right = touchObject
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

  const handleMovedTouch = (touchObject) => {
    if (activeTouches.left && activeTouches.left.identifier === touchObject.identifier) {
      console.log('Left touch moved!')
    }
    if (activeTouches.right && activeTouches.right.identifier === touchObject.identifier) {
      console.log('Right touch moved!')
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
    console.log('Touch moved', event)
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
  }
}
