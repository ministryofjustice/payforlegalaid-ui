import { setupMiddlewares } from "./commonMiddleware.js"
import { setupCsrf } from "./setupCsrf.js"
import { setupConfig } from "./setupConfigs.js"
import { setUpWebSecurity } from "./setUpWebSecurity.js"

export { setupCsrf, setUpWebSecurity, setupConfig, setupMiddlewares }
