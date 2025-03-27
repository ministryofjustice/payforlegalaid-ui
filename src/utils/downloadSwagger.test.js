const fs = require("fs")
const path = require("path")
const axios = require("axios")
const downloadSwagger = require("./downloadSwagger.cjs")

const targetPath = path.resolve("src", "contracts", "swagger.yml")
const targetDir = path.dirname(targetPath)

// Mock fs methods.
jest.mock("fs", () => ({
  mkdirSync: jest.fn(),
  writeFileSync: jest.fn(),
}))

// Mock axios.get.
jest.mock("axios", () => ({
  get: jest.fn(),
}))

describe("downloadSwagger", () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it("should download and write the swagger file when axios.get succeeds", async () => {
    const sampleSwaggerData = "swagger: '2.0'\ninfo:\n  title: 'Test API'"
    axios.get.mockResolvedValue({ data: sampleSwaggerData })

    await downloadSwagger()

    expect(fs.mkdirSync).toHaveBeenCalledWith(targetDir, { recursive: true })
    expect(fs.writeFileSync).toHaveBeenCalledWith(targetPath, sampleSwaggerData)
  })

  it("should call process.exit when axios.get fails", async () => {
    const error = new Error("Download failed")
    axios.get.mockRejectedValue(error)

    const exitSpy = jest.spyOn(process, "exit").mockImplementation(() => {})
    const consoleErrorSpy = jest.spyOn(console, "error").mockImplementation(() => {})

    await downloadSwagger()

    expect(consoleErrorSpy).toHaveBeenCalledWith("Error downloading swagger file:", error)
    expect(exitSpy).toHaveBeenCalledWith(1)

    exitSpy.mockRestore()
    consoleErrorSpy.mockRestore()
  })
})
