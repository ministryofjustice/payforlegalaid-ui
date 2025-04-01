import fs from "fs"
import path from "path"
import yaml from "js-yaml"
import { sample } from "openapi-sampler"

/**
 * Reads and parses the Swagger (OpenAPI) YAML file from the contracts' folder.
 * @returns {object} The parsed Swagger document.
 */
function loadSwaggerDocument() {
  const swaggerPath = path.resolve("src", "contracts", "swagger.yml")
  const fileContents = fs.readFileSync(swaggerPath, "utf8")
  return yaml.load(fileContents)
}

/**
 * Generates sample response data for a given API endpoint, method, and response status.
 *
 * @param {string} endpoint - The API endpoint (e.g. "/reports").
 * @param {string} method - The HTTP method in lowercase (e.g. "get").
 * @param {string} statusCode - The response status code as a string (e.g. "200").
 * @returns {object} A sample object based on the response schema.
 */
export function getSampleForPath(endpoint, method, statusCode) {
  const swaggerDoc = loadSwaggerDocument()

  // Check if the endpoint exists in the swagger document.
  const endpointPaths = swaggerDoc.paths[endpoint]
  if (!endpointPaths) {
    throw new Error(`No definition found for endpoint ${endpoint} and method ${method}`)
  }

  // Retrieve the endpoint definition from the Swagger document.
  const endpointDefinition = endpointPaths[method]
  if (!endpointDefinition) {
    throw new Error(`No definition found for endpoint ${endpoint} and method ${method}`)
  }

  // Retrieve the response definition for the given status code.
  const responseDefinition = endpointDefinition.responses[statusCode]
  if (!responseDefinition) {
    throw new Error(`No response defined for status code ${statusCode} at ${endpoint}`)
  }

  // Assuming the response content is application/json.
  const content = responseDefinition.content["application/json"]
  if (!content) {
    throw new Error(`No application/json content found for ${endpoint} ${method} ${statusCode}`)
  }

  const schema = content.schema
  if (!schema) {
    throw new Error(`No schema found for ${endpoint} ${method} ${statusCode}`)
  }

  // Use openapi-sampler to generate a sample response from the schema.
  return sample(schema, swaggerDoc.components)
}
