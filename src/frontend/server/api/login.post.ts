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
  } catch (error) {
    // ログインに失敗した場合は401を返す
    throw createError({
      statusCode: 401,
      statusMessage: 'Unauthorized',
    })
  }
})
