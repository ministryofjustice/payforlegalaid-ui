import express from 'express';
const router = express.Router();

/* GET home page. */
router.get('/', async (req, res) => {
  try {
    const response = await req.axiosMiddleware.get("/reports");

    // TODO: Remove this when we are displaying results in UI!
    console.log("response is " + JSON.stringify(response.data));
    res.render('main/index');
  } catch (error) {
    res.render('main/error', {status: "An error occurred", error: "An error occurred while loading the reports."});
  }
});

export default router;
