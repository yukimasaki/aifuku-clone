import { getAuth, signOut } from 'firebase/auth'

export default defineEventHandler(async () => {
  try {
    const auth = getAuth()
    const user = auth.currentUser
    await signOut(auth)
    if (user) {
      return JSON.stringify({
        uid: user.uid
      })
    }
    // todo: オプショナルチェーン演算子 (nullの場合、undefinedが返る) の動作検証
    // return JSON.stringify({
    //   uid: user?.uid
    // })
  } catch (error) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Internal Server Error',
    })
  }
})
