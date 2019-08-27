function setCookie(name, value) {
  console.log('SET COOKIE', name, value)

  document.cookie = `${name}=${value}`
}
function getCookie(name) {
  const regex = new RegExp(`(?:(?:^|.*;\\s*)${name}\\s*\\=\\s*([^;]*).*$)|^.*$`)

  return document.cookie.replace(regex, '$1')
}

// function eraseCookie(name) {
//   document.cookie = `${name}=; Max-Age=-99999999;`
// }

export { setCookie, getCookie }
