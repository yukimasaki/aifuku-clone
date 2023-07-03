export const useErrorHandle = () => {
  const firebaseErrorMessageToHttpStatusCode = (message: string) => {
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
    return { statusCode, statusMessage}
  }

  return {
    firebaseErrorMessageToHttpStatusCode
  }
}
