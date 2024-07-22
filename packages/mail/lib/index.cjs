(function(global, factory) {
  typeof exports === "object" && typeof module !== "undefined" ? factory(exports, require("exec-sh"), require("lodash")) : typeof define === "function" && define.amd ? define(["exports", "exec-sh", "lodash"], factory) : (global = typeof globalThis !== "undefined" ? globalThis : global || self, factory(global.mail = {}, global.execSh, global.lodash));
})(this, function(exports2, execSh, lodash) {
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
  function mail(from, to, subject, body) {
    exec(`echo "${body}" | mail`, {
      params: [to],
      args: {
        subject,
        append: `from:${from}`
      }
    });
  }
  exports2.mail = mail;
  Object.defineProperty(exports2, Symbol.toStringTag, { value: "Module" });
});
