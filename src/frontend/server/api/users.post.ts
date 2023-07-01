import { getAuth, createUserWithEmailAndPassword, deleteUser, User } from 'firebase/auth'
import { PrismaClient } from '@prisma/client'
import { useErrorHandle} from '../../composables/useErrorHandle'
import validator from 'validator'

export default defineEventHandler(async (event) => {
  const req = await readBody(event)
  const { email, password, displayName, tenantId } = req

  // リクエストボディで渡されたJSONデータが不正な場合は400を返す
  if (!email || !password || !displayName || !tenantId) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Bad Request',
    })
  }

  // バリデーションを行い、1つでも不合格の場合は例外をスローし、全てに合格した場合は処理を続行する
  const validationResult = valid(email, password, displayName, tenantId)
  if (!validationResult) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Bad Request',
    })
  }

  try {
    // Firebaseへユーザ登録する
    // 成功したら次のtryへ進み、失敗したら例外をスローする
    const user = await createUserToFirebase(email, password)
    try {
      // データベースへプロフィール情報を登録する
      // 成功したらJSON形式でレスポンスボディを返し、失敗したらFirebaseからデータを削除して例外をスローする
      const profile = await createUserToDatabase(user.uid, email, displayName, tenantId)
      return profile
    } catch (error) {
      await onFailureCreateUserToDatabase(user)
    }
  } catch (error: any) {
    onFailureCreateUserToFirebase(error)
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
  const auth = getAuth()
  const userCredential = await createUserWithEmailAndPassword(auth, email, password)
  const user = userCredential.user
  return user
}

const onFailureCreateUserToFirebase = (error: any) => {
  console.log(`onFailureCreateUserToFirebase`)
  const { firebaseErrorMessageToHttpStatusCode } = useErrorHandle()
  const message = error.code
  const { statusCode, statusMessage } = firebaseErrorMessageToHttpStatusCode(message)
  throw createError({
    statusCode,
    statusMessage,
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

const onFailureCreateUserToDatabase = async (user: User) => {
  console.log(`onFailureCreateUserToDatabase`)
  await deleteUser(user)
  throw createError({
    statusCode: 400,
    statusMessage: 'Bad Request',
  })
}
