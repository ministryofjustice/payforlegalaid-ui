import { showReportsPage } from "./reportController.js";
import * as reportService from "../services/reportService.js";
import config from "../../config.js";
import { getSampleForPath } from "../utils/contractDataHelper.js";

jest.mock("../services/reportService.js");

describe("showReportsPage", () => {
  let req, res, next;

  beforeEach(() => {
    req = {};
    res = {
      render: jest.fn(),
    };
    next = jest.fn();
  });

  it("should render the index page with reports on success", async () => {
    // Generate sample data from the Swagger contract for the /reports GET 200 response.
    const sampleData = getSampleForPath("/reports", "get", "200");

    // Use the contract-driven sample data in your mock.
    reportService.getReports.mockResolvedValue(sampleData);

    await showReportsPage(req, res, next);

    const baseURL = `${config.API_PROTOCOL}://${config.API_HOST}`;
    // Expect that the view 'main/index' is rendered with the reports,
    // where each report has a reportDownloadUrl generated from the contract sample.
    expect(res.render).toHaveBeenCalledWith("main/index", {
      reports: sampleData.reportList.map((report) => ({
        ...report,
        reportDownloadUrl: `${baseURL}/csv/${report.id}`,
      })),
    });
  });

  it("should render the error page when getReports throws an error", async () => {
    // Simulate an error in getReports
    reportService.getReports.mockRejectedValue(new Error("API error"));

    await showReportsPage(req, res, next);

    // Expect that the error view is rendered with the correct error details
    expect(res.render).toHaveBeenCalledWith("main/error", {
      status: "An error occurred",
      error: "An error occurred while loading the reports.",
    });
  });
});
