import express = require("express");
import cors = require("cors");
import path = require("path");
const app = express();
import serveIndex = require("serve-index");
import fs = require("fs");
import mime = require("mime-types");
var bodyParser = require("body-parser");
var https = require("https");
var http = require("http");
import db from "./app/models/index.ts";

app.use(bodyParser.json({ limit: "500mb" }));
app.use(
  bodyParser.urlencoded({
    limit: "500mb",
    extended: true,
    parameterLimit: 500000,
  })
);

// var corsOptions = {
//   origin:
//   ["http://localhost:8080","http://localhost:3000"]
// };
//
// app.use(cors(corsOptions));
app.use(cors());
// parse requests of content-type - application/json
app.use(express.json());

// parse requests of content-type - application/x-www-form-urlencoded
app.use(express.urlencoded({ extended: true }));

db.mongoose
  .connect(db.url, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("Connected to the database!");
  })
  .catch((err) => {
    console.log("Cannot connect to the database!", err);
    process.exit();
  });

// simple route
// app.get("/", (req, res) => {
//     res.json({ message: "Welcome to bezkoder application." });
// });

app.use(function (request, response, next) {
  if (process.env.NODE_ENV != "development" && !request.secure) {
    if (!request.url.includes(".well-known"))
      return response.redirect("https://" + request.headers.host + request.url);
  }

  next();
});

require("./app/routes/turorial.routes.ts")(app);
require("./app/routes/map.routes.ts")(app);
require("./app/routes/instance.routes.ts")(app);
require("./app/routes/submission.routes.ts")(app);
require("./app/routes/solution_submission.routes.ts")(app);
require("./app/routes/scenario.routes.ts")(app);
require("./app/routes/algorithm.routes.ts")(app);
require("./app/routes/auth.routes.ts")(app);
require("./app/routes/user.routes.ts")(app);
require("./app/routes/solution_path.routes.ts")(app);
require("./app/routes/request.routes.ts")(app);
require("./app/routes/submission_key.routes.ts")(app);
require("./app/routes/ongoing_submission.routes.ts")(app);

app.use(express.static(path.join(__dirname, "../client/build")));

app.use(
  "/quickDownload",
  express.static(path.join(__dirname, "../client/public/download"))
);
app.use(
  "/quickDownload",
  serveIndex(path.join(__dirname, "../client/public/download"), {
    icon: true,
    stylesheet: path.join(__dirname, "listing.css"),
    template: makeEntry,
  })
);

function formatFileSize(bytes) {
  const units = ["B", "KB", "MB", "GB", "TB"];
  let i = 0;
  while (bytes >= 1024 && i < units.length - 1) {
    bytes /= 1024;
    i++;
  }
  return bytes.toFixed(2) + " " + units[i];
}

function makeEntry(info, callback) {
  const files = info.fileList.map((file) => {
    const st = file.stat;
    const typeClass = st.isDirectory() ? "dir" : "file";
    const parts = info.directory
      .split("/")
      .concat(file.name)
      .map(function (c) {
        return encodeURIComponent(c);
      });
    const url = path.normalize(parts.join("/")).split(path.sep).join("/");
    const size = formatFileSize(st.size);
    const date = st.mtime.toLocaleDateString();
    const time = st.mtime.toLocaleTimeString();
    const type = st.isDirectory() ? "dir" : mime.lookup(file.name) || "";
    return `
      <div class="entry ${typeClass}">
        <a href="${url}">
          <span class="icon" data-type="${type}"></span>
          <span class="name">${file.name}</span>
          <span class="size">${size}</span>
          <span class="date">${date}</span>
          <span class="time">${time}</span>
        </a>
      </div>
          `;
  });

  callback(
    null,
    `
     <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.3.0/css/all.min.css">
          <style>
      ${info.style}
     </style>
    <div class="directory">
      <div class="filelist">
        ${files.join("\n")}
      </div>
    </div>

          `
  );
}

app.get("*", function (req, res) {
  res.sendFile(path.join(__dirname, "../client/build", "index.html"));
});
// set port, listen for requests
// var PORT = "" || 80;
// const PORT = process.env.PORT || 80;
if (process.env.NODE_ENV === "development") {
  const PORT = process.env.PORT || 3001;
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}.`);
  });
} else {
  var privateKey = fs.readFileSync("./credential/privkey.pem", "utf8");
  var certificate = fs.readFileSync("./credential/fullchain.pem", "utf8");
  var credentials = { key: privateKey, cert: certificate };
  var httpsServer = https.createServer(credentials, app);

  var https_port = 5443;
  var http_port = 5000;
  httpsServer.listen(https_port, () =>
    console.log(`Listening on port ${https_port} for https`)
  );

  var httpServer = http.createServer(app);

  httpServer.listen(http_port, () =>
    console.log(`Listening on port ${http_port} for http`)
  );
}

if (process.env.NODE_ENV === "development") {
  console.log("Development mode");
} else {
  console.log("Production mode");
}
