import axios from 'axios'
import * as msal from '@azure/msal-node'
import { authConfig } from './authConfig'

class AuthProvider {
  cryptoProvider
  authConfig
  msalInstance

  constructor(authConfig) {
    this.authConfig = authConfig
    this.cryptoProvider = new msal.CryptoProvider()
    this.msalInstance = new msal.ConfidentialClientApplication(authConfig)
  }

  login(options = {}) {
    return async (req, res, next) => {
      /**
       * MSAL Node library allows you to pass your custom state as state parameter in the Request object.
       * The state parameter can also be used to encode information of the app's state before redirect.
       * You can pass the user's state in the app, such as the page or view they were on, as input to this parameter.
       */
      console.info("Starting login process")

      const state = this.cryptoProvider.base64Encode(
        JSON.stringify({
          successRedirect: options.successRedirect || '/',
        }),
      )      

      const authCodeUrlRequestParams = {
        state,

        /**
         * By default, MSAL Node will add OIDC scopes to the auth code url request. For more information, visit:
         * https://docs.microsoft.com/azure/active-directory/develop/v2-permissions-and-consent#openid-connect-scopes
         */
        scopes: options.scopes || [],
        redirectUri: options.redirectUri,
      }

      const authCodeRequestParams = {
        code: options.code,
        state,

        /**
         * By default, MSAL Node will add OIDC scopes to the auth code request. For more information, visit:
         * https://docs.microsoft.com/azure/active-directory/develop/v2-permissions-and-consent#openid-connect-scopes
         */
        scopes: options.scopes || [],
        redirectUri: options.redirectUri,
      }

      /**
       * If the current msal configuration does not have cloudDiscoveryMetadata or authorityMetadata, we will
       * make a request to the relevant endpoints to retrieve the metadata. This allows MSAL to avoid making
       * metadata discovery calls, thereby improving performance of token acquisition process. For more, see:
       * https://github.com/AzureAD/microsoft-authentication-library-for-js/blob/dev/lib/msal-node/docs/performance.md
       */
      if (!this.authConfig.auth.cloudDiscoveryMetadata || !this.authConfig.auth.authorityMetadata) {
        const [cloudDiscoveryMetadata, authorityMetadata] = await Promise.all([
          this.getCloudDiscoveryMetadata(this.authConfig.auth.authority),
          this.getAuthorityMetadata(this.authConfig.auth.authority),
        ])

        this.authConfig.auth.cloudDiscoveryMetadata = JSON.stringify(cloudDiscoveryMetadata)
        this.authConfig.auth.authorityMetadata = JSON.stringify(authorityMetadata)
      }

      const msalInstance = this.getMsalInstance(this.authConfig)

      // Trigger the first leg of auth code flow
      return this.redirectToAuthCodeUrl(authCodeUrlRequestParams, authCodeRequestParams, msalInstance)(req, res, next)
    }
  }

  handleRedirect() {
    return async (req, res, next) => {

      console.info("Log in completed, have been redirected back to the service")

      if (!req.body || !req.body.state) {
        return next(new Error('Error: response not found'))
      }

      if (!req.session.pkceCodes) {
        // if pkceCodes are missing in the session, redirect to signin to re-trigger the auth flow
        console.warn('Session pkceCodes not found, re-triggering auth flow')
        return res.redirect('/auth/signin')
      }

      const authCodeRequest = {
        ...req.session.authCodeRequest,
        code: req.body.code,
        codeVerifier: req.session.pkceCodes.verifier,
      }

      try {
        const msalInstance = this.getMsalInstance(this.authConfig)

        if (req.session.tokenCache) {
          msalInstance.getTokenCache().deserialize(req.session.tokenCache)
        }

        const tokenResponse = await msalInstance.acquireTokenByCode(authCodeRequest, req.body)

        req.session.tokenCache = msalInstance.getTokenCache().serialize()
        req.session.idToken = tokenResponse.idToken
        req.session.account = tokenResponse.account
        req.session.isAuthenticated = true

        const state = JSON.parse(this.cryptoProvider.base64Decode(req.body.state))

        console.info("Access token has been acquired")

        return res.redirect(state.successRedirect)
      } catch (error) {
        if (error instanceof msal.ServerError && error.errorCode === 'invalid_grant') {
          console.warn('Failed to authenticate due to invalid grant, re-triggering auth flow', error)
          return res.redirect('/auth/signin')
        }
        return next(error)
      }
    }
  }

  logout(options = {}) {
    return async (req, res) => {
      /**
       * Construct a logout URI and redirect the user to end the
       * session with Azure AD. For more information, visit:
       * https://docs.microsoft.com/azure/active-directory/develop/v2-protocols-oidc#send-a-sign-out-request
       */
      let logoutUri = `${this.authConfig.auth.authority}/oauth2/v2.0/`

      if (options.postLogoutRedirectUri) {
        logoutUri += `logout?post_logout_redirect_uri=${options.postLogoutRedirectUri}`
      }

      req.session.destroy(() => {
        res.redirect(logoutUri)
      })
    }
  }

  async getAccessToken(scopes) {
    const msalInstance = this.getMsalInstance(this.authConfig)
    const clientCredentialRequest = {
      scopes,
      skipCache: true,
    }

    const response = await msalInstance.acquireTokenByClientCredential(clientCredentialRequest)

    return response.accessToken
  }

  /**
   * Returns the MSAL ConfidentialClientApplication object
   * @returns
   */
  getMsalInstance() {
    // Default implementation of this is to create a new Instance everytime it is called but that means we lose cached tokens etc
    return this.msalInstance;
  }

  /**
   * Prepares the auth code request parameters and initiates the first leg of auth code flow
   * @param authCodeUrlRequestParams
   * @param authCodeRequestParams
   * @param msalInstance
   */
   redirectToAuthCodeUrl(
    authCodeUrlRequestParams,
    authCodeRequestParams,
    msalInstance
  ) {
    return async (req, res, next) => {
      // Generate PKCE Codes before starting the authorization flow
      const { verifier, challenge } = await this.cryptoProvider.generatePkceCodes()

      //  Set generated PKCE codes and method as session vars
      req.session.pkceCodes = {
        challengeMethod: 'S256',
        verifier,
        challenge,
      }

      /**
       * By manipulating the request objects below before each request, we can obtain
       * auth artifacts with desired claims. For more information, visit:
       * https://azuread.github.io/microsoft-authentication-library-for-js/ref/modules/_azure_msal_node.html#authorizationurlrequest
       * https://azuread.github.io/microsoft-authentication-library-for-js/ref/modules/_azure_msal_node.html#authorizationcoderequest
       * */
      req.session.authCodeUrlRequest = {
        ...authCodeUrlRequestParams,
        responseMode: msal.ResponseMode.FORM_POST, // recommended for confidential clients
        codeChallenge: req.session.pkceCodes.challenge,
        codeChallengeMethod: req.session.pkceCodes.challengeMethod,
      }

      req.session.authCodeRequest = {
        ...authCodeRequestParams,
        code: '',
      }

      try {
        const authCodeUrlResponse = await msalInstance.getAuthCodeUrl(req.session.authCodeUrlRequest)
        res.redirect(authCodeUrlResponse)
      } catch (error) {
        next(error)
      }
    }
  }

  /**
   * Retrieves cloud discovery metadata from the /discovery/instance endpoint
   * @returns
   */
   async getCloudDiscoveryMetadata(authority){
    const endpoint = 'https://login.microsoftonline.com/common/discovery/instance'

    const response = await axios.get(endpoint, {
      params: {
        'api-version': '1.1',
        authorization_endpoint: `${authority}/oauth2/v2.0/authorize`,
      },
    })

    return response.data
  }

  /**
   * Retrieves oidc metadata from the openid endpoint
   * @returns
   */
  async getAuthorityMetadata(authority) {
    const endpoint = `${authority}/v2.0/.well-known/openid-configuration`

    const response = await axios.get(endpoint)
    return response.data
  }
}

const authProvider = new AuthProvider(authConfig)

export default authProvider