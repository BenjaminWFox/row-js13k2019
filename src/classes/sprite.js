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

  console.log('making sprite', that.image)

  that.render = () => {
    // Clear the canvas
    that.context.clearRect(0, 0, that.width, that.height)
    // Draw the animation
    that.context.drawImage(
      that.image,
      frameIndex * (that.width / numberOfFrames),
      0,
      that.width / numberOfFrames,
      that.height,
      0,
      0,
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

  return that
}
