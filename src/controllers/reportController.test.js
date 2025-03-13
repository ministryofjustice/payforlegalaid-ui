import { showReportsPage } from "./reportController.js";
import * as reportService from "../services/reportService.js";
import config from "../../config.js";

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

    const baseURL = `${config.API_PROTOCOL}://${config.API_HOST}`;

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
