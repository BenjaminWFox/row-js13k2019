export default class Screen {
  constructor(name) {
    this.name = name
  }

  goTo = () => {
    console.log('Going to', this.name, 'screen.')
  }

  leave = () => {
    console.log('Leaving', this.name, 'screen.')
  }
}
