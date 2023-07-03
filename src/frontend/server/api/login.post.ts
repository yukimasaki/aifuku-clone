import { getAuth, signInWithEmailAndPassword } from 'firebase/auth'
import { useErrorHandle } from '../../composables/useErrorHandle'
import validator from 'validator'

export default defineEventHandler(async (event) => {
  const req = await readBody(event)
  const { email, password } = req

  // リクエストボディで渡されたJSONデータが不正な場合は400を返す
  if (!email || !password) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Bad Request',
      message: 'Invalid request body',
    })
  }

  // バリデーションを行い、1つでも不合格の場合は例外をスローし、全てに合格した場合は処理を続行する
  const validationResult = valid(email, password)
  if (!validationResult) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Bad Request',
      message: 'Validation failed',
    })
  }

  try {
    // ログインに成功したらuidを含むJSONデータを返し、失敗したら例外をスローする
    const uid = await login(email, password)
    return uid
  } catch (error: any) {
    onFailureLogin(error)
  }
})

const valid = (
  email: any,
  password: any,
) => {
  const ruleEmail = () => validator.isEmail(email)
  const rulePassword = () => validator.isStrongPassword(password, { minLength: 6 })

  const validationResult = [
    ruleEmail(),
    rulePassword(),
  ].every(result => result === true)

  return validationResult
}

const login = async (email: string, password: string) => {
  console.log(`login`)
  const auth = getAuth()
  const userCredential = await signInWithEmailAndPassword(auth, email, password)
  const uid = userCredential.user.uid

  return JSON.stringify({ uid })
}

const onFailureLogin = (error: any) => {
  console.log(`onFailureLogin`)
  const { firebaseErrorMessageToHttpStatusCode } = useErrorHandle()
  const message = error.code
  const { statusCode, statusMessage } = firebaseErrorMessageToHttpStatusCode(message)
  throw createError({
    statusCode,
    statusMessage,
    message: 'Login failed',
  })
}
