import validator from 'validator'
import { useFirebase } from '../../composables/useFirebase'
import { useErrorHandle} from '../../composables/useErrorHandle'
import { PrismaClient } from '@prisma/client'

export default defineEventHandler(async (event) => {
  const req = await readBody(event)
  const { email, password, displayName, tenantId } = req

  // リクエストボディで渡されたJSONデータが不正な場合は400を返す
  if (!email || !password || !displayName || !tenantId) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Bad Request',
      message: 'Invalid request body',
    })
  }

  // バリデーションを行い、1つでも不合格の場合は例外をスローし、全てに合格した場合は処理を続行する
  const validationResult = valid(email, password, displayName, tenantId)
  if (!validationResult) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Bad Request',
      message: 'Validation failed',
    })
  }

  // Firebaseへユーザ登録する
  const user = await createUserToFirebase(email, password)
  if (user.error) {
    // 失敗したらHTTPステータスコードを返す
    onFailureCreateUserToFirebase(user.error)
  }

  // データベースへプロフィール情報を登録する
  try {
    const profile = await createUserToDatabase(user.localId, email, displayName, tenantId)
    return profile
  } catch (error) {
    // 失敗したらFirebaseからデータを削除してHTTPステータスコードを返す
    await onFailureCreateUserToDatabase(user.idToken)
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
  const { firebaseErrorMessageToHttpStatusCode } = useErrorHandle()
  const message = error.message
  const { statusCode, statusMessage } = firebaseErrorMessageToHttpStatusCode(message)
  throw createError({
    statusCode,
    statusMessage,
    message: 'Create to Firebase failed',
  })
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
  throw createError({
    statusCode: 400,
    statusMessage: 'Bad Request',
    message: 'Create to database failed',
  })
}
