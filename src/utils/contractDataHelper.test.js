import fs from "fs";
import yaml from "js-yaml";
import { sample } from "openapi-sampler";
import { getSampleForPath } from "./contractDataHelper.js";

// Mock openapi-sampler's sample function to return a fixed value.
jest.mock("openapi-sampler", () => ({
  sample: jest.fn(() => ({ sample: true })),
}));

describe("contractDataHelper", () => {
  let originalReadFileSync;

  beforeEach(() => {
    // Save the original fs.readFileSync to restore later.
    originalReadFileSync = fs.readFileSync;
  });

  afterEach(() => {
    // Restore the original implementation and clear mocks.
    fs.readFileSync = originalReadFileSync;
    jest.clearAllMocks();
  });

  it("should generate a sample for a valid endpoint", () => {
    // Create a fake swagger document with a valid /reports GET 200 response.
    const fakeSwagger = {
      paths: {
        "/reports": {
          get: {
            responses: {
              200: {
                content: {
                  "application/json": {
                    schema: {
                      type: "object",
                      properties: {
                        reportList: {
                          type: "array",
                          items: {
                            type: "object",
                            properties: {
                              id: { type: "string" },
                              reportName: { type: "string" },
                              description: { type: "string" },
                            },
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
      components: {},
    };

    // Dump the fake swagger doc to YAML format.
    const fakeYaml = yaml.dump(fakeSwagger);
    // Mock fs.readFileSync to return our fake YAML.
    fs.readFileSync = jest.fn(() => fakeYaml);

    // Call the helper with valid parameters.
    const result = getSampleForPath("/reports", "get", "200");

    // Verify that openapi-sampler.sample was called with the expected schema and components.
    expect(sample).toHaveBeenCalledWith(
      fakeSwagger.paths["/reports"].get.responses["200"].content[
        "application/json"
      ].schema,
      fakeSwagger.components,
    );
    // And that the function returns what our mock sample function returns.
    expect(result).toEqual({ sample: true });
  });

  it("should throw an error if endpoint definition is not found", () => {
    // Create a fake swagger doc with no paths.
    const fakeSwagger = { paths: {} };
    const fakeYaml = yaml.dump(fakeSwagger);
    fs.readFileSync = jest.fn(() => fakeYaml);

    // Expect an error due to missing endpoint definition.
    expect(() => getSampleForPath("/invalid", "get", "200")).toThrow(
      "No definition found for endpoint /invalid and method get",
    );
  });

  it("should throw an error if response definition is not found", () => {
    // Fake swagger with endpoint defined but empty responses.
    const fakeSwagger = {
      paths: {
        "/reports": {
          get: {
            responses: {},
          },
        },
      },
      components: {},
    };
    const fakeYaml = yaml.dump(fakeSwagger);
    fs.readFileSync = jest.fn(() => fakeYaml);

    expect(() => getSampleForPath("/reports", "get", "200")).toThrow(
      "No response defined for status code 200 at /reports",
    );
  });

  it("should throw an error if application/json content is not found", () => {
    // Fake swagger with a response but no application/json content.
    const fakeSwagger = {
      paths: {
        "/reports": {
          get: {
            responses: {
              200: {
                content: {},
              },
            },
          },
        },
      },
      components: {},
    };
    const fakeYaml = yaml.dump(fakeSwagger);
    fs.readFileSync = jest.fn(() => fakeYaml);

    expect(() => getSampleForPath("/reports", "get", "200")).toThrow(
      "No application/json content found for /reports get 200",
    );
  });

  it("should throw an error if schema is not found", () => {
    // Fake swagger with application/json content but missing the schema.
    const fakeSwagger = {
      paths: {
        "/reports": {
          get: {
            responses: {
              200: {
                content: {
                  "application/json": {},
                },
              },
            },
          },
        },
      },
      components: {},
    };
    const fakeYaml = yaml.dump(fakeSwagger);
    fs.readFileSync = jest.fn(() => fakeYaml);

    expect(() => getSampleForPath("/reports", "get", "200")).toThrow(
      "No schema found for /reports get 200",
    );
  });
});
