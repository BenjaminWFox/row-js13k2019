export default function drawDebug(ctx, world) {
  world.drawDistanceGrid()

  ctx.beginPath()
  ctx.moveTo((Math.round(135 / 2)), 0)
  ctx.lineTo((Math.round(135 / 2)), 240)
  ctx.stroke()
}
