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
  that.loop = options.loop
  that.x = options.x
  that.y = options.y

  console.log('making sprite', that.image)

  that.render = (x, y) => {
    // Clear the canvas
    that.context.clearRect(that.x, that.y, that.width, that.height)

    that.x = x || that.x
    that.y = y || that.y

    // Draw the animation
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
  }

  return that
}
