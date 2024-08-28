(function(global, factory) {
  typeof exports === "object" && typeof module !== "undefined" ? factory(exports, require("exec-sh"), require("lodash"), require("shescape")) : typeof define === "function" && define.amd ? define(["exports", "exec-sh", "lodash", "shescape"], factory) : (global = typeof globalThis !== "undefined" ? globalThis : global || self, factory(global.mail = {}, global.execSh, global.lodash, global.shescape$1));
})(this, function(exports2, execSh, lodash, shescape$1) {
  "use strict";
  const sh = execSh.promise;
  class ExecError extends Error {
  }
  async function exec(path, { params = [], args = {}, flags = [] } = {}, errorsAsOutput) {
    const command = [
      path,
      ...lodash.entries(args).map(([k, v]) => `--${k} ${v}`),
      ...flags.map((s) => `--${s}`),
      ...params
    ];
    const { stdout, stderr } = await sh(command.join(" "), true);
    if (!stderr) {
      return lodash.trim(stdout);
    } else throw new ExecError(stderr);
  }
  const shescape = new shescape$1.Shescape({
    shell: true
  });
  function mail(from, to, subject, body) {
    exec(`echo ${shescape.quote(body)} | mail`, {
      params: [shescape.escape(to)],
      args: {
        subject: shescape.quote(`${subject}
Content-Type: text/html`),
        append: `from:${shescape.escape(from)}`
      }
    });
  }
  exports2.mail = mail;
  Object.defineProperty(exports2, Symbol.toStringTag, { value: "Module" });
});
