import { getReports } from './reportService.js';
import apiClient from '../api/apiClient.js';
import { isAuthEnabled } from '../auth/authUtils.js';

jest.mock('../api/apiClient.js');
jest.mock('../auth/authUtils', () => ({
    isAuthEnabled: jest.fn(),  // Mock the function
}));

describe('reportService', () => {
    it('should return an object with a "reportList" array', async () => {
        isAuthEnabled.mockReturnValue(false);

        const dummyData = {
            reportList: [
                {
                    id: '12345',
                    reportName: 'Dummy Report',
                    description: 'Dummy description'
                }
            ]
        };

        apiClient.get.mockResolvedValue({ data: dummyData });

        const result = await getReports();

        // Ensure 'reportList' exists
        expect(result).toEqual(dummyData);

        expect(apiClient.get).toHaveBeenCalledWith('/reports', {
            headers: {}
        })
    });

    it('should pass in access token if auth enabled', async () => {
        isAuthEnabled.mockReturnValue(true);

        const dummyData = {
            reportList: [
                {
                    id: '12345',
                    reportName: 'Dummy Report',
                    description: 'Dummy description'
                }
            ]
        };

        apiClient.get.mockResolvedValue({ data: dummyData });

        const result = await getReports("1234");

        expect(result).toEqual(dummyData);

        expect(apiClient.get).toHaveBeenCalledWith('/reports', {
            headers: {
                "authorization": "Bearer 1234"

            }
        })

    });


});