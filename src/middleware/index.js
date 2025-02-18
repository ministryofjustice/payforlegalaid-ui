import {setupMiddlewares} from './commonMiddleware.js';
import { csrfProtection } from './csrfMiddleWare.js';
import { setupConfig } from './setupConfigs.js';
import { axiosMiddleware } from './axiosSetup.js';


export { setupMiddlewares, csrfProtection, setupConfig, axiosMiddleware };