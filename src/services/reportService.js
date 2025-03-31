import apiClient from "../api/apiClient.js"

/**
 * Gets the list of reports from the API.
 *
 * @returns {Promise<Array>} A promise that resolves to an array of reports.
 */
export async function getReports() {
  const correlationId = crypto.randomUUID()
  const operationName = "getReports"
  const logPrefix = `[${operationName}][${correlationId}]`

  try {
    console.log(`${logPrefix} Starting to fetch reports from /reports endpoint`)

    const response = await apiClient.get("/reports")

    console.log(`${logPrefix} Successfully fetched ${response.data?.length || 0} reports (Status: ${response.status})`)

    return response.data
  } catch (error) {
    const errorDetails = {
      name: error.name,
      message: error.message,
      ...(error.response && {
        status: error.response.status,
        data: error.response.data,
      }),
    }

    console.error(`${logPrefix} Failed to fetch reports:`, {
      error: errorDetails,
      stack: error.stack,
    })

    const enhancedError = new Error(`${logPrefix} ${error.message}`)
    enhancedError.correlationId = correlationId
    enhancedError.originalError = error
    throw enhancedError
  }
}
