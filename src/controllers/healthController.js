import config from "../../config.js";

/**
 * Health check endpoint handler.
 *
 * @param {object} req - The request object, containing information about the HTTP request.
 * @param {object} res - The response object, used to send back the desired HTTP response.
 * @returns {void}
 */
export async function healthCheck(req, res) {
  try {
    const healthStatus = {
      status: "UP",
      timestamp: new Date().toISOString(),

    };

    const statusCode = healthStatus.status === "UP" ? 200 : 503;
    res.status(statusCode).json(healthStatus);
  } catch (error) {
    console.error("Health check failed:", error);
    res.status(503).json({
      status: "DOWN",
      error: "Health check failed",
      details: error.message,
    });
  }
}