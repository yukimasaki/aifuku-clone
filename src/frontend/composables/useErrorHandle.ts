export const useErrorHandle = () => {
  const firebaseErrorMessageToHttpStatusCode = (message: string) => {
    let statusCode
    let statusMessage

    switch (message) {
      case 'auth/invalid-email':
      case 'auth/weak-password':
        statusCode = 400
        statusMessage = 'Bad Request'
        break

      case 'auth/wrong-password':
        statusCode = 401
        statusMessage = 'Unauthorized'
        break

      case 'OPERATION_NOT_ALLOWED':
      case 'auth/user-disabled':
        statusCode = 403
        statusMessage = 'Forbidden'
        break

      case 'auth/user-not-found':
        statusCode = 404
        statusMessage = 'Not Found'
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
