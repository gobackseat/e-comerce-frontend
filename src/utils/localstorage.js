export const token_key = 'E_COMMERCE_TOKEN'

export const setToken = token => {
  window.localStorage.setItem(token_key, token)
}

export const getToken = () => {
  let token = window.localStorage.getItem(token_key)
  console.log('Getting token from localStorage:', token ? token.substring(0, 20) + '...' : 'No token found');
  if (!!token) return token
  return false
}

export const isLogin = () => {
  if (!!getToken()) {
    return true
  }
  return false
}

export const logout = () => {
  window.localStorage.clear()
}
