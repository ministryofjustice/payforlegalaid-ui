import express from 'express';
const router = express.Router();

/* GET home page. */
router.get('/', async (req, res) => {

  const response = await req.axiosMiddleware.get("/reports");

  res.render('main/index');
});

export default router;
