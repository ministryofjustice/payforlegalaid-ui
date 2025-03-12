import esbuild from "esbuild";
import { sassPlugin } from "esbuild-sass-plugin";
import { builtinModules } from "module";
import dotenv from "dotenv";
import { copy } from "esbuild-plugin-copy";
import fs from "fs-extra";
import path from "path";
import { getBuildNumber } from "./src/utils/index.js";

// Load environment variables from .env file
dotenv.config();
// Unique build number useful for e.g. cache busting, deployment version tracking
const buildNumber = getBuildNumber();

/**
 * Copies assets such as fonts and images from the govuk-frontend package
 * to the 'public/assets' directory for use in the application.
 *
 * @async
 * @returns {Promise<void>} A promise that resolves when assets are successfully copied.
 */
const copyAssets = async () => {
  try {
    // Copy fonts and images to 'public/assets'
    await fs.copy(
      path.resolve("./node_modules/govuk-frontend/dist/govuk/assets"),
      path.resolve("./public/assets"),
    );
    console.log("Assets copied successfully.");
  } catch (error) {
    console.error("Failed to copy assets:", error);
    process.exit(1);
  }
};

/**
 * Builds the SCSS and JavaScript files for the application using esbuild.
 * The build process includes copying assets, compiling SCSS with transformed paths,
 * and bundling JavaScript files for both server and client use.
 *
 * @async
 * @returns {Promise<void>} A promise that resolves when the build process completes successfully.
 */
const build = async () => {
  try {
    // Ensure the dist folder exists
    await fs.ensureDir(path.resolve("./dist"));
    // List of additional external dependencies
    const additionalExternals = [
      "express",
      "nunjucks",
      "dotenv",
      "crypto",
      "cookie-signature",
      "cookie-parser",
      "body-parser",
      "express-session",
      "morgan",
      "compression",
      "sqlite3",
      "sqlite",
      "axios",
      "middleware-axios",
      "util",
      "csrf-sync",
    ];

    // Combine core Node.js modules with additional external dependencies
    const externalModules = [
      ...builtinModules,
      ...additionalExternals,
      "*.node",
    ];

    // Copy assets before building SCSS
    await copyAssets();

    // Bundle SCSS
    const scssBuildOptions = {
      entryPoints: ["src/scss/main.scss"],
      bundle: true,
      outfile: `public/css/main.${buildNumber}.css`,
      plugins: [
        sassPlugin({
          resolveDir: path.resolve("src/scss"),
          /**
           * Transforms the source SCSS content by replacing asset paths.
           *
           * @param {string} source - The source SCSS content.
           * @returns {string} The transformed SCSS content with updated asset paths.
           */
          transform: (source) => {
            return source
              .replace(
                /url\(["']?\/assets\/fonts\/([^"')]+)["']?\)/g,
                'url("../../node_modules/govuk-frontend/dist/govuk/assets/fonts/$1")',
              )
              .replace(
                /url\(["']?\/assets\/images\/([^"')]+)["']?\)/g,
                'url("../../node_modules/govuk-frontend/dist/govuk/assets/images/$1")',
              );
          },
        }),
      ],
      loader: {
        ".scss": "css",
        ".woff": "file",
        ".woff2": "file",
        ".png": "file",
        ".jpg": "file",
        ".svg": "file",
      },
      minify: true,
      sourcemap: true,
    };

    // Build the server-side JavaScript (Node/Express code)
    const serverBuildOptions = {
      entryPoints: ["src/app.js"], // Your Express server entry point
      bundle: true,
      platform: "node",
      target: "es2020",
      format: "esm",
      sourcemap: true,
      minify: false,
      external: externalModules,
      outfile: "dist/app.js", // Output server bundle to the dist folder
    };

    await esbuild.build(scssBuildOptions).catch((error) => {
      console.error("SCSS build failed:", error);
      process.exit(1);
    });

    // Build server JS code
    await esbuild.build(serverBuildOptions).catch((error) => {
      console.error("Server JS build failed:", error);
      process.exit(1);
    });

    // Bundle assets (for additional assets from govuk-frontend)
    await esbuild
      .build({
        entryPoints: [],
        bundle: true,
        plugins: [
          copy({
            assets: [
              {
                from: "./node_modules/govuk-frontend/dist/govuk/govuk-frontend.min.js",
                to: `./js/govuk-frontend.${buildNumber}.min.js`,
              },
              {
                from: "./node_modules/govuk-frontend/dist/govuk/assets/",
                to: "./assets",
              },
            ],
          }),
        ],
        outfile: "public/dummy.js", // dummy file to satisfy esbuild; can be ignored/deleted later.
      })
      .catch((error) => {
        console.error("Asset copy build failed:", error);
        process.exit(1);
      });

    console.log("Build completed successfully.");
  } catch (error) {
    console.error("Build process failed:", error);
    process.exit(1);
  }
};

export { build };

if (import.meta.url === `file://${process.argv[1]}`) {
  build().catch((error) => {
    console.error("Build script failed:", error);
    process.exit(1);
  });
}
