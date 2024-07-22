import bodyParser from "body-parser";
import cors from "cors";
import express from "express";
import fs from "fs";
import http from "http";
import https from "https";
import mime from "mime-types";
import path from "path";
import serveIndex from "serve-index";
import db from "./app/models";
import { createRouters } from "./createRouters";

export const app = express();

createRouters(app);

app.use(bodyParser.json({ limit: "500mb" }));
app.use(
  bodyParser.urlencoded({
    limit: "500mb",
    extended: true,
    parameterLimit: 500000,
  })
);

// const corsOptions = {
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
  .connect(db.url, {})
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

app.use((request, response, next) => {
  if (process.env.NODE_ENV != "development" && !request.secure) {
    if (!request.url.includes(".well-known"))
      return response.redirect(`https://${request.headers.host}${request.url}`);
  }

  next();
});

app.use(express.static(path.join(__dirname, "../client/build")));

app.use(
  "/quickDownload",
  express.static(path.join(__dirname, "../client/public/download"))
);
app.use(
  "/quickDownload",
  serveIndex(path.join(__dirname, "../client/public/download"), {
    stylesheet: path.join(__dirname, "listing.css"),
    template: makeEntry,
  })
);

function formatFileSize(bytes: any) {
  const units = ["B", "KB", "MB", "GB", "TB"];
  let i = 0;
  while (bytes >= 1024 && i < units.length - 1) {
    bytes /= 1024;
    i++;
  }
  return bytes.toFixed(2) + " " + units[i];
}

function makeEntry(info: any, callback: any) {
  const files = info.fileList.map((file) => {
    const st = file.stat;
    const typeClass = st.isDirectory() ? "dir" : "file";
    const parts = info.directory
      .split("/")
      .concat(file.name)
      .map((c) => encodeURIComponent(c));
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

app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../client/build", "index.html"));
});
// set port, listen for requests
// const PORT = "" || 80;
// const PORT = process.env.PORT || 80;
if (process.env.NODE_ENV === "development") {
  const PORT = process.env.PORT || 3001;
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}.`);
  });
} else {
  const privateKey = fs.readFileSync("./credential/privkey.pem", "utf8");
  const certificate = fs.readFileSync("./credential/fullchain.pem", "utf8");
  const credentials = { key: privateKey, cert: certificate };
  const httpsServer = https.createServer(credentials, app);

  const https_port = 5443;
  const http_port = 5000;
  httpsServer.listen(https_port, () =>
    console.log(`Listening on port ${https_port} for https`)
  );

  const httpServer = http.createServer(app);

  httpServer.listen(http_port, () =>
    console.log(`Listening on port ${http_port} for http`)
  );
}

if (process.env.NODE_ENV === "development") {
  console.log("Development mode");
} else {
  console.log("Production mode");
}
