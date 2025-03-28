// Variables to capture the interceptor callback functions from axios.create.
let capturedRequestSuccess, capturedRequestError, capturedResponseSuccess, capturedResponseError

// We mock the axios module. This allows us to intercept the call to axios.create() so we can control
// the returned instance. We also capture the interceptor registration functions.
jest.mock("axios", () => {
  return {
    // When apiClient.js calls axios.create, we return our custom mock instance.
    create: jest.fn(config => {
      return {
        // Save the provided configuration in the defaults property.
        defaults: config,
        interceptors: {
          request: {
            // Capture the success and error functions that are registered for request interceptors.
            use: jest.fn((success, error) => {
              capturedRequestSuccess = success
              capturedRequestError = error
            }),
          },
          response: {
            // Capture the success and error functions for response interceptors.
            use: jest.fn((success, error) => {
              capturedResponseSuccess = success
              capturedResponseError = error
            }),
          },
        },
        // Provide a mock implementation for GET so that we can simulate API calls.
        get: jest.fn(),
      }
    }),
    // Also export a mock for axios.get if needed, though our instance's get is used.
    get: jest.fn(),
  }
})

import config from "../../config.js"
import apiClient from "./apiClient.js"

describe("apiClient", () => {
  // Test to ensure that the Axios instance has the correct base URL as per configuration.
  it("should have the correct baseURL", () => {
    const expectedBaseURL = `${config.API_PROTOCOL}://${config.API_HOST}`
    expect(apiClient.defaults.baseURL).toBe(expectedBaseURL)
  })

  // Test that simulates a successful GET request.
  it("should make a GET request correctly", async () => {
    const fakeData = { data: { message: "Success" } }
    // Simulate axios.get resolving with fakeData.
    apiClient.get.mockResolvedValue(fakeData)

    const response = await apiClient.get("/test-endpoint")

    expect(response).toEqual(fakeData)
    // Check that the GET method was called with the correct endpoint.
    expect(apiClient.get).toHaveBeenCalledWith("/test-endpoint")
  })

  // Test the request error interceptor.
  // This interceptor should log an error and then reject with the same error.
  it("should log error and reject in the request error interceptor", async () => {
    const consoleErrorSpy = jest.spyOn(console, "error").mockImplementation(() => {})
    const dummyError = new Error("Test request error")

    try {
      // Call the captured request error interceptor callback.
      await capturedRequestError(dummyError)
    } catch (err) {
      // Verify that the error was logged as expected.
      expect(consoleErrorSpy).toHaveBeenCalledWith("API request error:", dummyError)
      // Verify that the error is rethrown.
      expect(err).toBe(dummyError)
    }
    consoleErrorSpy.mockRestore()
  })

  // Test the response error interceptor.
  // Similar to the request error interceptor, it should log the error and reject with it.
  it("should log error and reject in the response error interceptor", async () => {
    const consoleErrorSpy = jest.spyOn(console, "error").mockImplementation(() => {})
    const dummyError = new Error("Test response error")

    try {
      // Call the captured response error interceptor callback.
      await capturedResponseError(dummyError)
    } catch (err) {
      expect(consoleErrorSpy).toHaveBeenCalledWith("API response error:", dummyError)
      expect(err).toBe(dummyError)
    }
    consoleErrorSpy.mockRestore()
  })

  // Test the request success interceptor.
  // It should log the URL of the outgoing request and return the same config.
  it("should log and return the config in the request success interceptor", () => {
    const consoleLogSpy = jest.spyOn(console, "log").mockImplementation(() => {})
    const dummyConfig = { url: "/dummy" }

    // Call the captured request success interceptor callback.
    const result = capturedRequestSuccess(dummyConfig)

    expect(consoleLogSpy).toHaveBeenCalledWith("API request made to:", dummyConfig.url)
    expect(result).toEqual(dummyConfig)
    consoleLogSpy.mockRestore()
  })

  // Test the response success interceptor.
  // It should log the response status and return the response unchanged.
  it("should log and return the response in the response success interceptor", () => {
    const consoleLogSpy = jest.spyOn(console, "log").mockImplementation(() => {})
    const dummyResponse = { status: 200 }

    // Call the captured response success interceptor callback.
    const result = capturedResponseSuccess(dummyResponse)

    expect(consoleLogSpy).toHaveBeenCalledWith("API response status:", dummyResponse.status)
    expect(result).toEqual(dummyResponse)
    consoleLogSpy.mockRestore()
  })

  // Handle missing URL in request success interceptor.
  it("should handle missing url in the request success interceptor", () => {
    const consoleLogSpy = jest.spyOn(console, "log").mockImplementation(() => {})
    const dummyConfig = {} // no url provided

    const result = capturedRequestSuccess(dummyConfig)

    expect(consoleLogSpy).toHaveBeenCalledWith("API request made to:", undefined)
    expect(result).toEqual(dummyConfig)
    consoleLogSpy.mockRestore()
  })

  // Handle missing status in response success interceptor.
  it("should handle missing status in the response success interceptor", () => {
    const consoleLogSpy = jest.spyOn(console, "log").mockImplementation(() => {})
    const dummyResponse = {} // no status provided

    const result = capturedResponseSuccess(dummyResponse)

    expect(consoleLogSpy).toHaveBeenCalledWith("API response status:", undefined)
    expect(result).toEqual(dummyResponse)
    consoleLogSpy.mockRestore()
  })
})
