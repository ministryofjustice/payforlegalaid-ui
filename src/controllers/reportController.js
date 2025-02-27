// src/controllers/reportController.js
import { dummyReports } from '../data/dummyReports.js';

/**
 * Renders the homepage with the list of dummy reports.
 *
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
export async function showHomePage(req, res, next) {
    try {
        // Pass the dummy reports to the view.
        res.render('main/index', { reports: dummyReports });
    } catch (error) {
        next(error);
    }
}