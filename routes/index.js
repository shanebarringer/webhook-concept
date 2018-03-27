const router = require("express").Router();
const issues = require("../issuesAndStories");

const newIssue = async issue => {
  const newStory = await issues.createStory(issue);
  const updatedIssue = await issues.updateIssueTitle(
    issue.url,
    issue.title,
    newStory.id
  );
};

const successResponse = (res, code = 200) =>
  res.status(code).json({ message: "success" });

const closeIssue = async issue => {
  const title = issue.title.match(/\[[^\]]*\]/g)[0];
  const storyID = title.substring(1, title.length - 1);
  await issues.closeStory(storyID);
};

router.post("/log-payload", (req, res) => {
  const { issue, action } = req.body;
  // console.log(req.body);
  // console.log(issue, action);
  res.json({ title: "success" });
});

router.post("/handle-issues", async (req, res) => {
  const { issue, action } = req.body;

  try {
    switch (action) {
      case "opened":
        await newIssue(issue);
        successResponse(res, 201);
        break;
      case "closed":
        await closeIssue(issue);
        successResponse(res);
        break;
      default:
        console.log("no action taken");
        res.status(200).json({ message: "no action taken" });
    }
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: err });
  }
});

module.exports = router;
