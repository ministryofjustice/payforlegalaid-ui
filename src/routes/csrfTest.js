import express from 'express';
const router = express.Router();

/**
 * GET /csrf-test
 * Renders a simple HTML form with the CSRF token embedded as a hidden field.
 * This file can be deleted once proper tests have been added
 */
router.get('/', (req, res) => {
    // Retrieve the CSRF token via the middleware-added req.csrfToken function.
    const token = typeof req.csrfToken === 'function' ? req.csrfToken() : '';
    res.send(`
    <html lang="en">
      <body>
        <form action="/csrf-test" method="POST">
          <input type="hidden" name="_csrf" value="${token}">
          <button type="submit">Submit</button>
        </form>
      </body>
    </html>
  `);
});

/**
 * POST /csrf-test
 * Processes the form submission and confirms successful CSRF token validation.
 */
router.post('/', (req, res) => {
    res.send('Form submitted successfully!');
});

export default router;