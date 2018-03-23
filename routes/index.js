const router = require("express").Router();
const mapAndPostIssues = require("../issuesAndStories");

router.post("/create-story", async (req, res) => {
  const { owner, name } = req.body;
  mapAndPostIssues(owner, name).then(data => {
    res.status(200).json({ message: "success" });
  });
});

module.exports = router;
