const RootQuery = require("../queries");
const dotenv = require("dotenv");
dotenv.config();

// prettier-ignore
const headers = {
        'Content-Type': 'application/json',
        'X-TrackerToken': process.env.TRACKER_TOKEN
      }

const BASE_URL = process.env.PIVOTAL_BASE_URL;

const convertToStory = issues =>
  issues.map(issue => {
    const { title, body, labels, comments, createdAt } = issue.node;
    return {
      project_id: process.env.PROJECT_ID,
      name: title,
      description: body,
      labels: labels.edges.map(l => l.node.name),
      created_at: createdAt,
      comments: comments.nodes.map(c =>
        Object.assign(
          {},
          {
            text: `${c.bodyText} by: ${c.author.login}`
          }
        )
      )
    };
  });

const postStory = story =>
  fetch(`${BASE_URL}/projects/${process.env.PROJECT_ID}/stories/?`, {
    method: "POST",
    headers,
    body: JSON.stringify(story)
  })
    .then(res => res.json())
    .then(data => {
      console.log(data);
      return data;
    })
    .catch(err => {
      console.log(err);
    });

const getIssues = async (owner, name) => {
  const issues = await RootQuery(owner, name).then(
    data => data.repository.issues.edges
  );
  return convertToStory(issues);
};

const getStories = async () => {
  return await fetch(`${BASE_URL}/projects/${process.env.PROJECT_ID}/stories`, {
    headers
  }).then(res => res.json());
};

const mapAndPostIssues = (owner, name) => {
  return Promise.all([getIssues(owner, name), getStories()]).then(
    ([issues, stories]) => {
      const storyNames = stories.map(story => story.name);
      return issues
        .filter(issue => !storyNames.includes(issue.name))
        .map(issue => postStory(issue));
    }
  );
};

module.exports = mapAndPostIssues;
