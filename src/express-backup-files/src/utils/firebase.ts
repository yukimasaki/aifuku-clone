import { Request } from 'express'

export const useFirebase = () => {
  const apiKey = 'AIzaSyDIraHkuFWYdItWEydce1dbaAwBsRNNMeA'
  const baseUrl = `https://identitytoolkit.googleapis.com/v1`

  const signUp = async (email: string, password: string) => {
    const endPoint = `accounts:signUp`
    const url = `${baseUrl}/${endPoint}?key=${apiKey}`

    const body = {
      email,
      password,
      returnSecureToken: true,
    }

    const response = await fetch(url,{
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })

    return await response.json()
  }

  const deleteUser = async (idToken: string) => {
    const endPoint = `accounts:delete`
    const url = `${baseUrl}/${endPoint}?key=${apiKey}`

    const body = {
      idToken
    }

    const response = await fetch(url,{
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })

    return await response.json()
  }

  const signInWithEmailAndPassword = async (email: string, password: string) => {
    const endPoint = `accounts:signInWithPassword`
    const url = `${baseUrl}/${endPoint}?key=${apiKey}`

    const body = {
      email,
      password,
      returnSecureToken: true,
    }

    const response = await fetch(url,{
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })

    return await response.json()
  }

  const checkIdToken = async (req: Request) => {
    const endPoint = `accounts:lookup`
    const url = `${baseUrl}/${endPoint}?key=${apiKey}`

    const idToken = req.headers.authorization
    const body = { idToken }

    const response = await fetch(url,{
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })

    const user = await response.json()
    return user
  }

  const errMsgToStatusCodeAndMessage = (message: string) => {
    let statusCode
    let statusMessage

    switch (message) {
      case 'INVALID_PASSWORD':
      case 'EMAIL_NOT_FOUND':
        statusCode = 401
        statusMessage = 'Unauthorized'
        break

      case 'OPERATION_NOT_ALLOWED':
      case 'USER_DISABLED':
        statusCode = 403
        statusMessage = 'Forbidden'
        break

      case 'EMAIL_EXISTS':
        statusCode = 409
        statusMessage = 'Conflict'
        break

      case 'TOO_MANY_ATTEMPTS_TRY_LATER':
        statusCode = 429
        statusMessage = 'Too Many Requests'
        break

      default:
        statusCode = 500
        statusMessage = 'Internal Server Error'
        break
    }
    return { statusCode, statusMessage }
  }

  return {
    signUp,
    deleteUser,
    signInWithEmailAndPassword,
    checkIdToken,
    errMsgToStatusCodeAndMessage,
  }
}
