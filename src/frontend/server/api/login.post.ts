import validator from 'validator'
import { H3Event } from 'h3'
import { useFirebase } from '../../composables/useFirebase'
import { useErrorHandle } from '../../composables/useErrorHandle'

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

  // ログインを試みる
  const user = await login(email, password)
  if (user.error) {
    onFailureLogin(user.error)
  }

  // ログインに成功したらクッキーを保存する
  setIdTokenToCookie(event, user.idToken)

  return JSON.stringify({ email: user.email, uid: user.localId})
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
  const { signInWithEmailAndPassword } = useFirebase()
  const user = await signInWithEmailAndPassword(email, password)

  return user
}

const setIdTokenToCookie = (event: H3Event, idToken: string) => {
  console.log(`setIdTokenToCookie`)
  const options = {
    httpOnly: true,
    // secure: true,
  }
  setCookie(event, 'token', idToken, options)
}

const onFailureLogin = (error: any) => {
  console.log(`onFailureLogin`)
  const { firebaseErrorMessageToHttpStatusCode } = useErrorHandle()
  const message = error.message
  const { statusCode, statusMessage } = firebaseErrorMessageToHttpStatusCode(message)
  throw createError({
    statusCode,
    statusMessage,
    message: 'Login failed',
  })
}
