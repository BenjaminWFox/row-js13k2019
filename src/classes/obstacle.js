export default function makeObstacle(ctx, SpriteClass) {
  const instance = new SpriteClass(ctx)

  instance.isInView = false

  return instance
}
