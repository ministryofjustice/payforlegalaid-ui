import { getReports } from './reportService.js';
import apiClient from '../api/apiClient.js';
import { getScopes, isAuthEnabled } from '../auth/authUtils.js';
import { getAccessToken } from './getAccessTokenService.js';
import authProvider from '../auth/authProvider.js';

jest.mock('../api/apiClient.js');
jest.mock('../auth/authUtils', () => ({
    isAuthEnabled: jest.fn(),
    getScopes: jest.fn()
}));
jest.mock('../auth/authProvider', () => ({
    getMsalInstance: jest.fn(),
    acquireTokenSilent: jest.fn()
}))

describe('getAccessTokenService', () => {
    it('should return empty string if auth disabled', async () => {
        isAuthEnabled.mockReturnValue(false);

        const result = await getAccessToken("account");

        expect(result).toEqual("");

    });

    it('should call auth provider if auth enabled', async () => {
        isAuthEnabled.mockReturnValue(true);
        getScopes.mockReturnValue(['testScope'])
        
        authProvider.getMsalInstance.mockReturnThis();
        authProvider.acquireTokenSilent.mockResolvedValue({
            accessToken: "token"
        })

        const result = await getAccessToken("account");

        expect(result).toEqual("token");

        expect(authProvider.acquireTokenSilent).toHaveBeenCalledWith({
            account: "account",
            scopes: ['testScope']
    });
    });

});