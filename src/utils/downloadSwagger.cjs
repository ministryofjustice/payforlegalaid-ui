const fs = require("fs")
const path = require("path")
const axios = require("axios")

const url =
  "https://raw.githubusercontent.com/ministryofjustice/payforlegalaid-openapi/main/src/main/resources/swagger.yml"
const targetPath = path.resolve("src", "contracts", "swagger.yml")

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
