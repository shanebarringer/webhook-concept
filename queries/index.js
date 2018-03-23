const GraphQLClient = require("graphql-request").GraphQLClient;
const dotenv = require("dotenv");
dotenv.config();

const client = new GraphQLClient("https://github.com/api/graphql", {
  headers: {
    Authorization: `Bearer ${process.env.TOKEN}`
  }
});

const query = `query getIssues($owner: String!, $name: String!){
  repository(owner: $owner, name: $name) {
    issues(last: 100) {
      edges {
        cursor
        node {
          id
          title
          body
          closed
          state
          url
          createdAt
          author {
            login
          }
          labels(last: 100) {
            edges {
              node {
                name
                color
              }
            }
          }
          assignees(last: 100) {
            edges {
              node {
                name
                email
              }
            }
          }
          comments(last: 100) {
            nodes {
              createdAt
              bodyText
              author {
                login
              }
            }
          }
        }
      }
    }
  }
}
`;

module.exports = (owner = "shanebarringer", name = "test-sync") =>
  client.request(query, { owner, name }).then(data => {
    return data;
  });
