import { getAuth, signInWithEmailAndPassword } from 'firebase/auth'

export default defineEventHandler(async (event) => {
  const req = await readBody(event)
  const { email, password } = req

  // リクエストボディで渡されたJSONデータが不正な場合は400を返す
  if (!email || !password) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Bad Request',
    })
  }

  try {
    const auth = getAuth()
    const userCredential = await signInWithEmailAndPassword(auth, email, password)
    const user = userCredential.user
    // ログインに成功した場合はユーザ情報を含むJSONデータを返す
    return JSON.stringify({
      uid: user.uid,
      email: user.email,
    })
  } catch (error: any) {
    // ログインに失敗した場合は、Firebaseのエラーコードに応じてステータスコードとステータスメッセージを返す
    const message = error.code
    let statusCode
    let statusMessage

    switch (message) {
      case 'auth/invalid-email':
        statusCode = 400
        statusMessage = 'Bad Request'
        break

      case 'auth/wrong-password':
        statusCode = 401
        statusMessage = 'Unauthorized'
        break

      case 'auth/user-disabled':
        statusCode = 403
        statusMessage = 'Forbidden'
        break

      case 'auth/user-not-found':
        statusCode = 404
        statusMessage = 'Not Found'
        break

      default:
        statusCode = 500
        statusMessage = 'Internal Server Error'
        break
    }

    throw createError({
      statusCode,
      statusMessage,
    })
  }
})
