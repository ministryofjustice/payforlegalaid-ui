import nock from 'nock'
import config from '../../config'
import authProvider from './authProvider'

describe('authProvider', () => {
  let fakeAuthClient

  let request
  let response
  let session
  const next = jest.fn(()=> {
    throw Error('error')
  })

  beforeEach(() => {
    request = {
        session: {
            destroy: jest.fn()
        }
    }
    response = {
        redirect: jest.fn()
    }
    session = {
        destroy: jest.fn()
    }
    fakeAuthClient = nock(`${config.auth.cloudInstance}${config.auth.tenantId}`)
  })

  afterEach(() => {
    nock.cleanAll()
  })

  it('should handle redirect request', async () => {
    fakeAuthClient.post('/oauth2/v2.0/token').query(true).reply(200, {
      access_token: 'some-access-token',
    })

    const requestHandler = authProvider.handleRedirect()

    request.session = session
    request.session.pkceCodes = {
      verifier: 'some-verifier',
      challenge: 'some-challenge',
      challengeMethod: 'some-challengeMethod',
    }
    request.session.authCodeRequest = {
      redirectUri: '/',
    }
    request.session.tokenCache = null

    request.body = {
      code: 'someCode',
      state: 'eyJzdWNjZXNzUmVkaXJlY3QiOiIvIn0=', // base64 encoded {"successRedirect":"/"}
    }

    await requestHandler(request, response, next)

    expect(response.redirect).toHaveBeenCalledWith('/')
  })

  it('should handle redirect request when pkceCodes are missing', async () => {
    fakeAuthClient.post('/oauth2/v2.0/token').reply(200, {
      access_token: 'some-access-token',
    })

    const requestHandler = authProvider.handleRedirect()

    request.session = session
    request.session.pkceCodes = null
    request.session.authCodeRequest = {
      redirectUri: '/',
    }
    request.session.tokenCache = null

    request.body = {
      code: 'someCode',
      state: 'eyJzdWNjZXNzUmVkaXJlY3QiOiIvIn0=', // base64 encoded {"successRedirect":"/"}
    }

    await requestHandler(request, response, next)

    expect(response.redirect).toHaveBeenCalledWith('/auth/signin')
  })

  it('should handle redirect when invalid_grant error', async () => {
    fakeAuthClient.post('/oauth2/v2.0/token').query(true).reply(500, {
      error: 'invalid_grant',
    })

    const requestHandler = authProvider.handleRedirect()

    request.session = session
    request.session.pkceCodes = {
      verifier: 'some-verifier',
      challenge: 'some-challenge',
      challengeMethod: 'some-challengeMethod',
    }
    request.session.authCodeRequest = {
      redirectUri: '/',
    }
    request.session.tokenCache = null

    request.body = {
      code: 'someCode',
      state: 'eyJzdWNjZXNzUmVkaXJlY3QiOiIvIn0=',
    }

    await requestHandler(request, response, next)

    expect(response.redirect).toHaveBeenCalledWith('/auth/signin')
  })

  it('should handle redirect and throw any errors', async () => {
    fakeAuthClient.post('/oauth2/v2.0/token').reply(500)

    next.getRe
    const requestHandler = authProvider.handleRedirect()

    request.session = session
    request.session.pkceCodes = {
      verifier: 'some-verifier',
      challenge: 'some-challenge',
      challengeMethod: 'some-challengeMethod',
    }
    request.session.authCodeRequest = {
      redirectUri: '/',
    }
    request.session.tokenCache = null

    request.body = {
      code: 'someCode',
      state: 'eyJzdWNjZXNzUmVkaXJlY3QiOiIvIn0=',
    }

    await expect(requestHandler(request, response, next)).rejects.toThrow('error')

    expect(response.redirect).not.toHaveBeenCalled()
  })

  it('should handle logout request', async () => {
    const requestHandler = authProvider.logout()

    request.session = session

    await requestHandler(request, response)

    expect(request.session.destroy).toHaveBeenCalled()
  })

  it('should get access token for given scope', async () => {
    fakeAuthClient.post('/oauth2/v2.0/token').query(true).reply(200, {
      access_token: 'some-access-token',
    })

    const result = await authProvider.getAccessToken(['some-scope'])

    expect(result).toEqual('some-access-token')
  })
})