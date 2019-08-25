import borderSrc from '../assets/images/sprites/river-border.gif'
import makeSprite from './sprite'

export default class River {
  constructor(currentSpeed) {
    this.borderImage = new Image()
    this.borderImage.src = borderSrc
    this.current = currentSpeed

    this.borderSprite = makeSprite(
      {
        context: '',
        width: 25,
        height: 240,
        image: this.borderImage,
        numberOfFrames: 20,
        x: 0,
        y: 0,
      },
    )
  }
}
