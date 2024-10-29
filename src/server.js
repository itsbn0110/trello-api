const express = require("express");

const app = express();

const hostname = "localhost";
const port = 8686;

app.get("/", (req, res) => res.send("<h1>Helllo Server from BaoNgo</h1>"));

app.listen(port, hostname, () => {
  console.log(`Trello App is running on http://${hostname}:${port}`);
});
