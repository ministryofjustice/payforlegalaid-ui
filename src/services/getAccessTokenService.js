import config from '../../config.js';
import { API_DEFAULT_SCOPES } from '../auth/authConfig.js';
import authProvider from '../auth/authProvider.js';

export async function getAccessToken(account) {
    if (config.auth.isEnabled) {
        //We are logged in, get the access token to call the API
        const tokenRequest = {
            scopes: API_DEFAULT_SCOPES,
            account: account,
        };

        const tokenDetails = await authProvider.getMsalInstance().acquireTokenSilent(tokenRequest);
        return tokenDetails.accessToken
    }

    return "";
}