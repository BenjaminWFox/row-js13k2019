const constants = {
  CANVAS_RATIO: 16 / 9,
  CANVAS_MID_X: undefined,
  CANVAS_MID_Y: undefined,
  CANVAS_WIDTH: undefined,
  CANVAS_HEIGHT: undefined,
  SCREEN_WIDTH: undefined,
  SCREEN_HEIGHT: undefined,
  SCREEN_MID_X: undefined,
  SCREEN_MID_Y: undefined,
  SCALE_FACTOR: undefined,
  SCALED_WIDTH: undefined,
  SCALED_HEIGHT: undefined,
  MAX_HUMAN_POWER_VELOCITY: 0.75,
  WATER_FRICTION: 0.005,
  // STROKE_POWER: 0.005, // ORIGINAL...
  // STROKE_POWER: 0.0075, // TO TRY ...
  STROKE_POWER: 0.01, // FOR TESTING ...
  RIVER_SPEED: -0.1,
  BOAT_WIDTH: 24,
  BOAT_HEIGHT: 14,
}

export const setConstants = (canvas) => {
  constants.CANVAS_WIDTH = canvas.width
  constants.CANVAS_HEIGHT = canvas.height
  constants.SCREEN_WIDTH = window.innerWidth
  constants.SCREEN_HEIGHT = window.innerHeight
  constants.SCREEN_MID_X = constants.SCREEN_WIDTH / 2
  constants.SCREEN_MID_Y = constants.SCREEN_HEIGHT / 2
  constants.SCALED_WIDTH = Math.round(constants.SCREEN_HEIGHT / constants.CANVAS_RATIO)
  constants.SCALED_HEIGHT = constants.SCREEN_HEIGHT
  constants.CANVAS_MID_X = Math.round(constants.SCALED_WIDTH / 2)
  constants.CANVAS_MID_Y = constants.SCALED_HEIGHT / 2
  constants.SCALE_FACTOR = constants.SCALED_HEIGHT / canvas.height
}

export default constants
