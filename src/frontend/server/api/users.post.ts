import { getAuth, createUserWithEmailAndPassword, deleteUser } from 'firebase/auth'
import { PrismaClient } from '@prisma/client'
import { useErrorHandle } from '../../composables/useErrorHandle'

export default defineEventHandler(async (event) => {
  const prisma = new PrismaClient()
  const { firebaseErrorMessageToHttpStatusCode } = useErrorHandle()

  const req = await readBody(event)
  const { email, password, tenantId, displayName } = req
  // todo: ↑ 各値を配列に格納する
  // todo: ↓ 配列でループ処理する
  // リクエストボディで渡されたJSONデータが不正な場合は400を返す
  if (!email || !password || !tenantId || !displayName) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Bad Request',
    })
  }

  // バリデーションを行い、1つでも不合格の場合はエラーをスローする
  const ruleEmail = /^[A-Za-z0-9+_.-]+@[A-Za-z0-9.-]+\.[A-Za-z]+$/
  const rulePassword = /^(?=.*[0-9a-zA-Z]).{6,}$/
  const ruleDisplayName = /^[\u4E00-\u9FFF\u30A0-\u30FF\u3040-\u309Fa-zA-Z0-9_-\.]+$/
  const ruleTenantId = /^[0-9]+$/

  // todo: 配列をループ処理でバリデーションする

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

const validate = (value: any, regex: RegExp) => {
  return regex.test(value)
}
