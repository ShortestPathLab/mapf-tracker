import { Application, static as serve } from "express";
import mime from "mime";
import { join, normalize, sep } from "path";
import serveIndex from "serve-index";

function formatFileSize(bytes: any) {
  const units = ["B", "KB", "MB", "GB", "TB"];
  let i = 0;
  while (bytes >= 1024 && i < units.length - 1) {
    bytes /= 1024;
    i++;
  }
  return `${bytes.toFixed(2)} ${units[i]}`;
}

function makeEntry(info: any, callback: any) {
  const files = info.fileList.map((file) => {
    const st = file.stat;
    const typeClass = st.isDirectory() ? "dir" : "file";
    const parts = info.directory
      .split("/")
      .concat(file.name)
      .map((c) => encodeURIComponent(c));
    const url = normalize(parts.join("/")).split(sep).join("/");
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

export function createStaticRoutes(app: Application) {
  app.use(serve(join(__dirname, "../client/build")));

  app.use(
    "/quickDownload",
    serve(join(__dirname, "../client/public/download"))
  );
  app.use(
    "/quickDownload",
    serveIndex(join(__dirname, "../client/public/download"), {
      stylesheet: join(__dirname, "listing.css"),
      template: makeEntry,
    })
  );

  app.use("/res", serve(`${import.meta.dir}/resources`));
}
