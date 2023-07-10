import express from 'express'
import validator from 'validator'
import { z } from 'zod' //ためしに使ってみる
import { useFirebase } from 'src/utils/firebase'
import { PrismaClient } from '@prisma/client'
import { verify } from '../middleware/verify'
// import { paginate } from 'src/utils/paginate'
import { paginate } from 'src/utils/paginate-test'

const router = express.Router()
const prisma = new PrismaClient()

/** POST /api/users */
router.post('/', verify, async (req, res) => {
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
    .status(statusCode)
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
    .status(400)
    .send({
      statusCode: 400,
      statusMessage: 'Bad Request',
      message: 'Create to database failed',
    })
  }
})

/** GET /api/users */
// router.get('/', verify, async (req, res) => {
router.get('/', async (req, res) => {
  const { page, perPage } = req.query

  const rulePage = z.coerce.number().int().min(1)
  const rulePerPage = z.coerce.number().int().min(1).max(100)

  if (
    rulePage.safeParse(page).success === false ||
    rulePerPage.safeParse(perPage).success === false
  ) {
    res.status(422)
    .send({
      statusCode: 422,
      statusMessage: 'Unprocessable Entity',
      message: 'Validation failed',
    })
    return
  }

  const users = await paginate(req,{
    page: rulePage.parse(page),
    perPage: rulePerPage.parse(perPage),
    queryFn: (args) =>
      prisma.profile.findMany({ ...args }),
    countFn: () => prisma.profile.count()
  })

  res
  .status(200)
  .send(users)
})

export default router
