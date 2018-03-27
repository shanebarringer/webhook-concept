const RootQuery = require("../queries");
const dotenv = require("dotenv");
dotenv.config();

// prettier-ignore
const headers = {
        'Content-Type': 'application/json',
        'X-TrackerToken': process.env.TRACKER_TOKEN
      }

const BASE_URL = process.env.PIVOTAL_BASE_URL;

const convertMultiIssuesToStory = issues =>
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

const updateIssueTitle = (url, originalTitle, storyId) => {
  const title = JSON.stringify({ title: `[${storyId}] - ${originalTitle}` });
  fetch(url, {
    method: "PATCH",
    // prettier-ignore
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'token ' + process.env.TOKEN,
      'Accept': 'application/vnd.github.symmetra-preview+json'
    },
    body: title
  })
    .then(res => res.json())
    .then(data => {
      console.log(data);
      return data;
    })
    .catch(err => {
      throw err;
    });
};

const postStory = story => {
  story.estimate = 1.0;
  console.log(story);
  return fetch(`${BASE_URL}/projects/${process.env.PROJECT_ID}/stories/?`, {
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
};

const closeStory = storyID =>
  fetch(`${BASE_URL}/projects/${process.env.PROJECT_ID}/stories/${storyID}`, {
    method: "PUT",
    headers,
    body: JSON.stringify({ current_state: "accepted" })
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
  return convertMultiIssuesToStory(issues);
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

const mapIssueToStory = issue => {
  const { title, body, labels, comments, createdAt } = issue;
  return {
    project_id: process.env.PROJECT_ID,
    name: title,
    description: body,
    labels: labels.map(l => l.name),
    created_at: createdAt
  };
};

const createStory = issue => postStory(mapIssueToStory(issue));

module.exports = { createStory, closeStory, updateIssueTitle };
