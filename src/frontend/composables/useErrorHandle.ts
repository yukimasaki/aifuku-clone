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

      case 'auth/operation-not-allowed':
      case 'auth/user-disabled':
        statusCode = 403
        statusMessage = 'Forbidden'
        break

      case 'auth/user-not-found':
        statusCode = 404
        statusMessage = 'Not Found'
        break

      case 'auth/email-already-in-use':
        statusCode = 409
        statusMessage = 'Conflict'
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
