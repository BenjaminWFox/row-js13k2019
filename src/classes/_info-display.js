class InfoDisplay {
  constructor() {
    this.isInit = false
    this.textbox = document.createElement('div')
    this.textbox.style.fontSize = '20px'
    this.textbox.style.fontWeight = 'bold'
    this.textbox.style.position = 'absolute'
    this.textbox.style.top = 0
    this.textbox.style.left = '50%'
    this.textbox.style.transform = 'translateX(-50%)'
    this.textbox.style.padding = '16px 20px'
    this.textbox.style.boxSizing = 'border-box'
    this.textbox.style.color = '#ffffff'
    this.textbox.style.backgroundColor = 'blue'
    this.hide()
  }

  init = (parentNode, siblingNode, width) => {
    if (!this.isInit) {
      this.textbox.style.width = `${width}px`
      parentNode.insertBefore(this.textbox, siblingNode)
      this.isInit = true
    }
  }

  setMessage = (message) => {
    this.textbox.innerHTML = message
  }

  show = () => {
    this.textbox.style.opacity = 0.75
    this.textbox.style.display = 'block'
  }

  hide = () => {
    this.textbox.style.opacity = 0
    this.textbox.style.display = 'none'
  }
}

const infoDisplay = new InfoDisplay()

export default infoDisplay
