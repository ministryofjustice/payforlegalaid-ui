import express from "express"
import { showReportsPage } from "../controllers/reportController.js"
import { healthCheck } from "../controllers/healthController.js"

const router = express.Router()

router.get("/", showReportsPage)
router.get("/health", healthCheck)

export default router
