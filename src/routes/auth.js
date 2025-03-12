import { Router } from 'express'
import asyncMiddleware from '../middleware/asyncMiddleware'
import authProvider from '../auth/authProvider'
import { REDIRECT_URI, POST_LOGOUT_REDIRECT_URI, API_DEFAULT_SCOPES } from '../auth/authConfig'

export default function routes() {
  const router = Router()

  router.use((req, res, next) => {
    return next()
  })

  const get = (path, handler) => router.get(path, asyncMiddleware(handler))
  const post = (routePath, handler) => router.post(routePath, asyncMiddleware(handler))

  get(
    '/signin',
    authProvider.login({
      scopes: API_DEFAULT_SCOPES,
      redirectUri: REDIRECT_URI,
      successRedirect: '/',
    }),
  )

  post('/redirect', authProvider.handleRedirect())

  get(
    '/signout',
    authProvider.logout({
      postLogoutRedirectUri: POST_LOGOUT_REDIRECT_URI,
    }),
  )

  return router
}