import { getAuth, createUserWithEmailAndPassword, deleteUser } from 'firebase/auth'
import { PrismaClient } from '@prisma/client'

export default defineEventHandler(async (event) => {
  const prisma = new PrismaClient()
  const req = await readBody(event)
  const { email, password, tenantId, displayName } = req

  // リクエストボディで渡されたJSONデータが不正な場合は400を返す
  if (!email || !password || !tenantId || !displayName) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Bad Request',
    })
  }

  try {
    const auth = getAuth()
    const userCredential = await createUserWithEmailAndPassword(auth, email, password)
    const uid = userCredential.user.uid
    // Firebaseへのユーザ登録後、データベースにもプロフィール情報を登録する
    try {
      const profile = await prisma.profile.create({
        data: {
          uid,
          email,
          displayName,
          tenantId: parseInt(tenantId),
        }
      })
      console.log(profile)
    } catch (error) {
      // データベースへの登録に失敗した場合は、Firebaseへ登録したユーザ情報を削除する
      console.log(`データベースへの登録に失敗`)
      console.log(error)
      try {
        await deleteUser(userCredential.user)
      } catch (error) {
        console.log(`Firebaseからの削除に失敗`)
        console.log(error)
      }
    }
    // final. 双方のユーザ登録に成功した場合はユーザ情報を含むJSONデータを返す
    const user = userCredential.user
    return JSON.stringify({
      uid: user.uid,
      email: user.email,
    })
  } catch (error: any) {
    // ユーザ登録に失敗した場合は、Firebaseのエラーコードに応じてステータスコードとステータスメッセージを返す
    const message = error.code
    let statusCode
    let statusMessage

    switch (message) {
      case 'auth/invalid-email':
      case 'auth/weak-password':
        statusCode = 400
        statusMessage = 'Bad Request'
        break

      case 'auth/operation-not-allowed':
        statusCode = 403
        statusMessage = 'Forbidden'
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

    throw createError({
      statusCode,
      statusMessage,
    })
  }
})
