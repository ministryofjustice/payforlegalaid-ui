import express from 'express';
import { showReportsPage } from '../controllers/reportController.js';
const router = express.Router();

router.get('/', showReportsPage);

export default router;