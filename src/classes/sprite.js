export default function makeSprite(options) {
  const that = {}
  let frameIndex = 0
  let tickCount = 0
  const ticksPerFrame = options.ticksPerFrame || 0
  const numberOfFrames = options.numberOfFrames || 1

  that.context = options.context
  that.width = options.width
  that.height = options.height
  that.image = options.image
  that.loop = options.loop || false
  that.x = options.x
  that.y = options.y
  that.frameIndex = 0
  that.rotation = options.rotation

  that.currentFrame = () => frameIndex

  that.resetTickCount = () => {
    tickCount = 0
  }

  that.render = (x, y) => {
    // // Clear the canvas
    // that.context.clearRect(that.x, that.y, that.width, that.height)
    if (x || y) {
      that.x = x
      that.y = y
    }

    // Draw the animation
    if (that.rotation) {
      that.context.save()
      that.context.translate(0, 0)
      that.context.rotate(that.rotation * (Math.PI / 180))
    }

    that.context.drawImage(
      that.image,
      frameIndex * (that.width / numberOfFrames),
      0,
      that.width / numberOfFrames,
      that.height,
      that.x,
      that.y,
      that.width / numberOfFrames,
      that.height,
    )

    if (that.rotation) {
      that.context.restore()
    }
  }


  that.update = () => {
    tickCount += 1

    if (tickCount > ticksPerFrame) {
      tickCount = 0
      // If the current frame index is in range
      if (frameIndex < numberOfFrames - 1) {
        // Go to the next frame
        frameIndex += 1
      }
      else if (that.loop) {
        frameIndex = 0
      }
    }
  }

  that.goToFrame = (frame) => {
    if (frame < numberOfFrames) {
      frameIndex = frame
    }

    return that
  }

  return that
}

class Tween {
  constructor(from, to) {
    this.from = from
    this.to = to
  }

  onUpdate = (fn) => {
    fn()

    return this
  }

  onComplete = (fn) => {
    fn()

    return this
  }

  duration = (timeInMs) => {
    this.tweenDuration = timeInMs

    return this
  }
}

export { Tween }
