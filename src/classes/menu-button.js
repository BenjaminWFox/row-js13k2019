import Button from './button'

export default class MenuButton extends Button {
  constructor(ctx, name, x, y, action) {
    super(name, 1, 1, x, y, action)

    this.ctx = ctx
    this.setCtx()
    this.width = ctx.measureText(name).width
    this.height = ctx.measureText('L').width
    this.setScaledMinMax()
    this.restoreCtx()
    this.parentRender = this.render
    console.log(this.parentRender)

    this.render = () => {
      this.setCtx()
      this.parentRender(this.ctx)
      this.restoreCtx()
    }
  }

  superPropCheck = () => {
    console.log(super.name)
    console.log(this.name)
  }

  setCtx = () => {
    this.ctx.save()
    this.ctx.textAlign = 'center'
    this.ctx.fillStyle = '#ffffff'
    this.ctx.font = '20px Courier'
  }
}
