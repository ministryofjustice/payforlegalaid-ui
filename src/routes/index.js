import express from 'express';
import { showHomePage } from '../controllers/reportController.js';
const router = express.Router();

/* GET home page with reports. */
router.get('/', showHomePage);

export default router;