const express = require("express");
const bodyParser = require("body-parser");
const dotenv = require("dotenv");
const index = require("./routes");
dotenv.config();

const server = express();
const PORT = process.env.PORT || 8080;

server.use(bodyParser.urlencoded({ extended: true }));

server.use(bodyParser.json());

server.use("/", index);

server.listen(PORT, () => {
  console.log(`server is running on port: ${PORT}`);
});
