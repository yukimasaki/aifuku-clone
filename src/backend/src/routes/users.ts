import express from 'express'
import validator from 'validator'
import { useFirebase } from 'src/utils/firebase'
import { PrismaClient } from '@prisma/client'
const router = express.Router()

/** POST /api/users */
router.post('/', async (req, res) => {
  const body = req.body
  const { email, password, displayName, tenantId } = body

  // リクエストボディで渡されたJSONデータが不正な場合は例外をスローする
  if (!email || !password || !displayName || !tenantId) {
    res
    .status(400)
    .send({
      statusCode: 400,
      statusMessage: 'Bad Request',
      message: 'Invalid request body',
    })
  }

  // バリデーションを行い、1つでも不合格の場合は例外をスローする
  const validationResult = valid(email, password, displayName, tenantId)
  if (!validationResult) {
    res
    .status(400)
    .send({
      statusCode: 400,
      statusMessage: 'Bad Request',
      message: 'Validation failed',
    })
  }

  // Firebaseへユーザ登録する
  const user = await createUserToFirebase(email, password)
  if (user.error) {
    // 失敗したらHTTPステータスコードとメッセージを含むJSONデータを返す
    const { statusCode, statusMessage, message } = onFailureCreateUserToFirebase(user.error)
    res
    .send({
      statusCode,
      statusMessage,
      message,
    })
  }

  // データベースへプロフィール情報を登録する
  try {
    const profile = await createUserToDatabase(user.localId, email, displayName, tenantId)
    res.send(profile)
  } catch (error) {
    // 失敗したらFirebaseからデータを削除してHTTPステータスコードを返す
    await onFailureCreateUserToDatabase(user.idToken)
    res
    .send({
      statusCode: 400,
      statusMessage: 'Bad Request',
      message: 'Create to database failed',
    })
  }
})

const valid = (
  email: any,
  password: any,
  displayName: any,
  tenantId: any,
) => {
  const ruleEmail = () => validator.isEmail(email)
  const rulePassword = () => validator.isStrongPassword(password, { minLength: 6 })
  const ruleDisplayName = () => {
    const isSomeText = [
      validator.isAscii(displayName),
      validator.isMultibyte(displayName),
    ].some(result => result === true)

    const isValid = [
      isSomeText,
      validator.isLength(displayName, { min: 1, max: 32 }),
    ].every(result => result === true)

    return isValid
  }
  const ruleTenantId = () => validator.isInt(tenantId)

  const validationResult = [
    ruleEmail(),
    rulePassword(),
    ruleDisplayName(),
    ruleTenantId(),
  ].every(result => result === true)

  return validationResult
}

const createUserToFirebase = async (email: string, password: string) => {
  console.log(`createUserToFirebase`)
  const { signUp } = useFirebase()
  const user = await signUp(email, password)
  return user
}

const onFailureCreateUserToFirebase = (error: any) => {
  console.log(`onFailureCreateUserToFirebase`)
  const { errMsgToStatusCodeAndMessage } = useFirebase()
  const message = error.message
  const { statusCode, statusMessage } = errMsgToStatusCodeAndMessage(message)
  return { statusCode, statusMessage, message }
}

const createUserToDatabase = async (
  uid: string,
  email: string,
  displayName: string,
  tenantId: string,
  ) => {
  console.log(`createUserToDatabase`)
  const prisma = new PrismaClient()
  const profile = await prisma.profile.create({
    data: {
      uid,
      email,
      displayName,
      tenantId: parseInt(tenantId),
    }
  })
  return JSON.stringify(profile)
}

const onFailureCreateUserToDatabase = async (idToken: string) => {
  console.log(`onFailureCreateUserToDatabase`)
  const { deleteUser } = useFirebase()
  await deleteUser(idToken)
}

export default router
