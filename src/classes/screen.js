export default class Screen {
  constructor(name, goToBackScreen, goToNextScreen) {
    this.name = name
    this.goToBackScreen = this.goToBackScreen
  }

  goTo = (runOnGoTo) => {
    console.log('Going to', this.name, 'screen.')
    runOnGoTo()
  }

  leave = (runOnLeave) => {
    this.goToBackScreen()
    console.log('Leaving', this.name, 'screen.')
  }
}
