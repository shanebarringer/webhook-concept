const router = require("express").Router();

router.post("/create-story", async (req, res) => {
  const { owner, name } = req.body;

  res.status(200).json({ message: "success" });
});

module.exports = router;
