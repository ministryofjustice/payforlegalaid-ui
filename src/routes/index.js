import express from 'express';
const router = express.Router();

/* GET home page. */
router.get('/', async (req, res) => {
  //TODO not here but will do for now.

  const response = await req.axiosMiddleware.get("/reports");

  console.log("response status is " + response.status)

  console.log("response is " + JSON.stringify(response.data))


  res.render('main/index');
});

export default router;
