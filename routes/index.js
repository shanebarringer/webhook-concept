const router = require("express").Router();
const issues = require("../issuesAndStories");

router.post("/log-payload", (req, res) => {
  const { issue, action } = req.body;

  res.json({ title: "success" });
});

router.post("/create-story-from-issue", async (req, res) => {
  const { issue, action } = req.body;

  if (action === "opened") {
    try {
      const newStory = await issues.createStory(issue);
      console.log(newStory);

      const updatedIssue = await issues.updateIssueTitle(
        issue.url,
        issue.title,
        newStory.id
      );
      console.log(updatedIssue);
      res.status(200).json({ message: "success" });
    } catch (err) {
      console.log(err);
      res.status(500).json({ message: err });
    }
  } else {
    res.status(200).json({ message: "no action taken" });
  }
});

router.post("/finish-story", async (req, res) => {
  const { issue, action } = req.body;

  if (action === "closed") {
    try {
      const title = issue.title.match(/\[[^\]]*\]/g)[0];
      const storyID = title.substring(1, title.length - 1);
      await issues.closeStory(storyID);
      res.status(200).json({ message: "success" });
    } catch (err) {
      console.log(err);
      res.status(500).json({ message: err });
    }
  } else {
    res.status(200).json({ message: "no action taken" });
  }
});

module.exports = router;
