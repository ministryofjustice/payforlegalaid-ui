import config from '../../config.js';
import authProvider from '../auth/authProvider.js';
import { getScopes, isAuthEnabled } from '../auth/authUtils.js';

export async function getAccessToken(account) {
    if (isAuthEnabled()) {
        //We are logged in, get the access token to call the API
        const tokenRequest = {
            scopes: getScopes(),
            account: account,
        };

        const tokenDetails = await authProvider.getMsalInstance().acquireTokenSilent(tokenRequest);
        return tokenDetails.accessToken
    }

    return "";
}