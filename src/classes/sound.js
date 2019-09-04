const DEEP = 440 / 6
const OAR = 440 * 3
const OAR2 = 440 * 4
const A4 = 440
const C4 = A4 * (2 ** (2 / 12))
const D4 = A4 * (2 ** (4 / 12))
const E4 = A4 * (2 ** (6 / 12))
const F4 = A4 * (2 ** (7 / 12))
const G4 = A4 * (2 ** (9 / 12))
const C5 = A4 * (2 ** (14 / 12))

export default class Sound {
  constructor(context) {
    this.ctx = context
    this.muted = false
    this.queueSong = false
  }

  mute = () => {
    this.muted = true
    this.vol = 0
    this.gainNode.gain.setValueAtTime(this.vol, this.ctx.currentTime)
    this.ctx.suspend()
  }

  unmute = () => {
    this.muted = false
    this.vol = 0.005
    this.gainNode.gain.setValueAtTime(this.vol, this.ctx.currentTime)
    this.ctx.resume()
  }

  init() {
    this.osc = this.ctx.createOscillator()
    this.gainNode = this.ctx.createGain()

    this.osc.connect(this.gainNode)
    this.gainNode.connect(this.ctx.destination)
    this.osc.type = 'square'

    this.unmute()
  }

  play(value, time, stopTime = undefined, volume = undefined) {
    const modVol = volume ? volume * this.vol : this.vol

    console.log('PLAY', time)

    this.init()

    this.osc.frequency.value = value
    this.gainNode.gain.setValueAtTime(modVol, this.ctx.currentTime)

    this.osc.start(time)

    this.stop(time, stopTime)
  }

  stop(time, stopTime) {
    // this.gainNode.gain.exponentialRampToValueAtTime(0.005, time + 0.1)
    this.osc.stop(time + (stopTime || 0.25))
  }

  oar() {
    this.play(OAR, this.ctx.currentTime + 0.05, 0.01, 0.5)
    this.play(OAR2, this.ctx.currentTime + 0.075, 0.01, 0.5)
    this.play(OAR, this.ctx.currentTime + 0.1, 0.01, 0.5)
  }

  bump() {
    this.play(DEEP, this.ctx.currentTime + 0.05, 0.05, 2)
    this.play(DEEP, this.ctx.currentTime + 0.1, 0.05, 2)
  }

  song() {
    this.play(C4, this.ctx.currentTime + 0.75)
    this.play(C4, this.ctx.currentTime + 0.875)
    this.play(C4, this.ctx.currentTime + 1.25)
    this.play(C4, this.ctx.currentTime + 1.375)
    this.play(C4, this.ctx.currentTime + 1.75)
    this.play(C4, this.ctx.currentTime + 1.875)
    this.play(D4, this.ctx.currentTime + 2.00)
    this.play(D4, this.ctx.currentTime + 2.125)
    this.play(E4, this.ctx.currentTime + 2.25)
    this.play(E4, this.ctx.currentTime + 2.375)
    this.play(E4, this.ctx.currentTime + 2.75)
    this.play(E4, this.ctx.currentTime + 2.875)
    this.play(D4, this.ctx.currentTime + 3.00)
    this.play(D4, this.ctx.currentTime + 3.125)
    this.play(E4, this.ctx.currentTime + 3.25)
    this.play(F4, this.ctx.currentTime + 3.50)
    this.play(G4, this.ctx.currentTime + 3.75, 0.1)
    this.play(G4, this.ctx.currentTime + 3.875, 0.1)
    this.play(G4, this.ctx.currentTime + 4.00, 0.1)
    this.play(G4, this.ctx.currentTime + 4.125, 0.1)
    this.play(G4, this.ctx.currentTime + 4.25, 0.1)
    this.play(C5, this.ctx.currentTime + 4.75)
    this.play(C5, this.ctx.currentTime + 4.875)
    this.play(C5, this.ctx.currentTime + 5.00)
    this.play(G4, this.ctx.currentTime + 5.125)
    this.play(G4, this.ctx.currentTime + 5.25)
    this.play(G4, this.ctx.currentTime + 5.375)
    this.play(E4, this.ctx.currentTime + 5.50)
    this.play(E4, this.ctx.currentTime + 5.625)
    this.play(E4, this.ctx.currentTime + 5.75)
    this.play(C4, this.ctx.currentTime + 5.875)
    this.play(C4, this.ctx.currentTime + 6.00)
    this.play(C4, this.ctx.currentTime + 6.125)
    this.end(6.00)
  }

  end = (offset = 0.00) => {
    this.play(G4, this.ctx.currentTime + 0.25 + offset)
    this.play(F4, this.ctx.currentTime + 0.50 + offset)
    this.play(F4, this.ctx.currentTime + 0.625 + offset)
    this.play(E4, this.ctx.currentTime + 0.75 + offset)
    this.play(E4, this.ctx.currentTime + 0.875 + offset)
    this.play(D4, this.ctx.currentTime + 1.00 + offset)
    this.play(C4, this.ctx.currentTime + 1.25 + offset)
  }
}
