import { getAuth, createUserWithEmailAndPassword, deleteUser } from 'firebase/auth'
import { PrismaClient } from '@prisma/client'
import { useErrorHande } from '../../composables/useErrorHandle'
import { profile } from 'console'

export default defineEventHandler(async (event) => {
  const prisma = new PrismaClient()
  const { firebaseErrorMessageToHttpStatusCode } = useErrorHande()

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
    console.log(`Firebaseへの登録に成功`)
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
      if (profile) {
        // 双方のユーザ登録に成功した場合はユーザ情報を含むJSONデータを返す
        console.log(`データベースへの登録に成功`)
        return JSON.stringify({
          uid: profile.uid,
          email: profile.email,
          displayName: profile.displayName,
        })
      }
    } catch (error) {
      try {
        // データベースへの登録に失敗した場合は、Firebaseへ登録したユーザ情報を削除する
        await deleteUser(userCredential.user)
        console.log(`データベースへの登録に失敗`)
        console.log(error)
        throw createError({
          statusCode: 400,
          statusMessage: 'Bad Request',
        })
      } catch (error) {
        console.log(`Firebaseからの削除に失敗`)
        console.log(error)
        throw createError({
          statusCode: 500,
          statusMessage: 'Internal Server Error',
        })
      }
    }
  } catch (error: any) {
    // ユーザ登録に失敗した場合は、Firebaseのエラーコードに応じてステータスコードとステータスメッセージを返す
    console.log(`Firebaseへの登録に失敗`)
    console.log(error)
    const message = error.code
    const { statusCode, statusMessage } = firebaseErrorMessageToHttpStatusCode(message)
    throw createError({
      statusCode,
      statusMessage,
    })
  }
})
