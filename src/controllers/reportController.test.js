import * as reportService from '../services/reportService.js';
import * as getAccessTokenService from '../services/getAccessTokenService.js';
import { isAuthEnabled } from '../auth/authUtils.js';
import { showReportsPage } from './reportController.js';

jest.mock("../services/reportService.js");
jest.mock('../services/getAccessTokenService.js');
jest.mock('../auth/authUtils', () => ({
    isAuthEnabled: jest.fn(),  // Mock the function
  }));

describe("showReportsPage", () => {

  let req, res, next;

    beforeAll(() => {
        // We expect the error case to call console.error, so stop jest treating it as a test failure
        jest.spyOn(console, 'error').mockImplementation(() => {});
    })

    afterAll(() => {
        console.error.mockRestore();
    })

  beforeEach(() => {
    req = {
            session: jest.fn()
        };
    res = {
      render: jest.fn(),
            redirect: jest.fn()
    };
    next = jest.fn();
  });

  it("should render the index page with reports on success when authentication disabled", async () => {

        isAuthEnabled.mockReturnValue(false);
        
    const dummyData = {
      reportList: [
        {
          id: "12345",
          reportName: "Dummy Report",
          description: "Dummy description",
        },
      ],
    };
    // Simulate a successful call
    reportService.getReports.mockResolvedValue(dummyData);

    await showReportsPage(req, res, next);

    const baseURL = `${process.env.API_PROTOCOL}://${process.env.API_HOST}`;

    // Expect that the view 'main/index' is rendered with the reportList
    expect(res.render).toHaveBeenCalledWith("main/index", {
      reports: [
        {
          id: "12345",
          reportName: "Dummy Report",
          description: "Dummy description",
          reportDownloadUrl: `${baseURL}/csv/12345`,
        },
      ],
    });
  });

  it("should render the error page when getReports throws an error when authentication disabled", async () => {

        isAuthEnabled.mockReturnValue(false);

    // Simulate an error in getReports
    reportService.getReports.mockRejectedValue(new Error("API error"));

    await showReportsPage(req, res, next);

    // Expect that the error view is rendered with the correct error details
    expect(res.render).toHaveBeenCalledWith("main/error", {
      status: "An error occurred",
      error: "An error occurred while loading the reports.",
    });
  });

    it('should redirect to login page if authentication enabled and not authenticated', async () => {

        isAuthEnabled.mockReturnValue(true);
        
        await showReportsPage(req, res, next);

        expect(res.redirect).toHaveBeenCalledWith('/auth/signin' );
    });

    it('should render the index page with reports on success when authentication enabled and logged in', async () => {

        isAuthEnabled.mockReturnValue(true);
        getAccessTokenService.getAccessToken.mockResolvedValue("token")
        req.session.isAuthenticated = true; 
        req.session.account = "user";
        
        const dummyData = {
            reportList: [
                {
                    id: '12345',
                    reportName: 'Dummy Report',
                    description: 'Dummy description'
                }
            ]
        };

        // Simulate a successful call
        reportService.getReports.mockResolvedValue(dummyData);

        await showReportsPage(req, res, next);

        const baseURL = `${process.env.API_PROTOCOL}://${process.env.API_HOST}`;
        
        expect(getAccessTokenService.getAccessToken).toHaveBeenCalledWith('user')
        expect(reportService.getReports).toHaveBeenCalledWith('token');

        // Expect that the view 'main/index' is rendered with the reportList
        expect(res.render).toHaveBeenCalledWith('main/index', {
            reports: [
                {
                    id: '12345',
                    reportName: 'Dummy Report',
                    description: 'Dummy description',
                    reportDownloadUrl: `${baseURL}/csv/12345`
                }
            ]
        });
    });

    it('should render the error page when getReports throws an error when authentication enabled and logged in', async () => {

        isAuthEnabled.mockReturnValue(true);
        getAccessTokenService.getAccessToken.mockResolvedValue("token")
        req.session.isAuthenticated = true; 
        req.session.account = "user";
        
        const dummyData = {
            reportList: [
                {
                    id: '12345',
                    reportName: 'Dummy Report',
                    description: 'Dummy description'
                }
            ]
        };

        // Simulate an error in getReports
        reportService.getReports.mockRejectedValue(new Error('API error'));

        await showReportsPage(req, res, next);

        const baseURL = `${process.env.API_PROTOCOL}://${process.env.API_HOST}`;
        
        expect(getAccessTokenService.getAccessToken).toHaveBeenCalledWith('user')
        expect(reportService.getReports).toHaveBeenCalledWith('token');

        // Expect that the error view is rendered with the correct error details
        expect(res.render).toHaveBeenCalledWith('main/error', {
            status: "An error occurred",
            error: "An error occurred while loading the reports."
        });
    });

    it('should render the error page when getAccessToken throws an error', async () => {

        isAuthEnabled.mockReturnValue(true);
        getAccessTokenService.getAccessToken.mockRejectedValue(new Error('Auth error'))
        req.session.isAuthenticated = true; 
        req.session.account = "user";
        
        // Simulate an error in getReports
        reportService.getReports.mockRejectedValue(new Error('API error'));

        await showReportsPage(req, res, next);

        
        expect(getAccessTokenService.getAccessToken).toHaveBeenCalledWith('user')
        expect(reportService.getReports).toHaveBeenCalledTimes(0);

        // Expect that the error view is rendered with the correct error details
        expect(res.render).toHaveBeenCalledWith('main/error', {
            status: "An error occurred",
            error: "An error occurred while loading the reports."
        });
    });

});
