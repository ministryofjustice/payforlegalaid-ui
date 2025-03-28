const fs = require("fs")
const path = require("path")
const axios = require("axios")

const url =
  "https://raw.githubusercontent.com/ministryofjustice/payforlegalaid-openapi/main/src/main/resources/swagger.yml"
const targetPath = path.resolve("src", "contracts", "swagger.yml")

/**
 * Downloads the swagger file from the specified URL and writes it to the target path.
 *
 * This function ensures that the target directory exists and then makes an HTTP GET request
 * to retrieve the swagger YAML file. If successful, it writes the file and logs a success message.
 * In case of an error, it logs the error and terminates the process.
 *
 * @returns {Promise<void>} A promise that resolves when the file has been successfully downloaded and written.
 */
function downloadSwagger() {
  // Ensure the target directory exists
  fs.mkdirSync(path.dirname(targetPath), { recursive: true })

  return axios
    .get(url)
    .then(response => {
      fs.writeFileSync(targetPath, response.data)
      console.log("Swagger file downloaded successfully")
    })
    .catch(error => {
      console.error("Error downloading swagger file:", error)
      process.exit(1)
    })
}

if (require.main === module) {
  downloadSwagger()
}

module.exports = downloadSwagger
