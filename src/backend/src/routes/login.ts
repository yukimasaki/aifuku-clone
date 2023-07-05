import { Request, Response } from 'express'
import express from 'express'
import validator from 'validator'
import { useFirebase } from 'src/utils/firebase'
import { verify } from '../middleware/verify'

const router = express.Router()

/** POST /user/login */
router.post('/', async (req, res) => {
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

  const onFailureLogin = (error: any) => {
    console.log(`onFailureLogin`)
    const { errMsgToStatusCodeAndMessage } = useFirebase()
    const message = error.message
    const { statusCode, statusMessage } = errMsgToStatusCodeAndMessage(message)
    return { statusCode, statusMessage, message }
  }

  const body = req.body
  const { email, password } = body

  // リクエストボディで渡されたJSONデータが不正な場合は例外をスローする
  if (!email || !password) {
    res
    .status(400)
    .send({
      statusCode: 400,
      statusMessage: 'Bad Request',
      message: 'Invalid request body',
    })
  }

  // バリデーションを行い、1つでも不合格の場合は例外をスローする
  const validationResult = valid(email, password)
  if (!validationResult) {
    res
    .status(400)
    .send({
      statusCode: 400,
      statusMessage: 'Bad Request',
      message: 'Validation failed',
    })
  }

  // ログインを試みる
  const user = await login(email, password)
  if (user.error) {
    // 失敗したらHTTPステータスコードとメッセージを含むJSONデータを返す
    const { statusCode, statusMessage, message } = onFailureLogin(user.error)
    res
    .send({
      statusCode,
      statusMessage,
      message,
    })
  }

  // ログインに成功したらクッキーを保存する
  const expires = new Date(Date.now() + 60 * 60 * 1000)
  res.cookie('token', user.idToken, {
    expires: expires,
    // httpOnly: true,
    // secure: true,
  })

  res
  .send({
    uid: user.localId,
    email: user.email,
  })
})

/** DELETE /user/login */
router.delete('/', verify, async (req: Request, res: Response) => {
  try {
    res
    .clearCookie('token')
    .send({})
  } catch (error) {
    res.send({
      statusCode: 500,
      statusMessage: 'Internal Server Error',
      message: 'Unexpected error',
    })
  }
})

export default router
