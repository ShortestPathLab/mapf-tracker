import execSh from "exec-sh";
import { entries, trim } from "lodash";
const sh = execSh.promise;
class ExecError extends Error {
}
async function exec(path, { params = [], args = {}, flags = [] } = {}, errorsAsOutput) {
  const command = [
    path,
    ...entries(args).map(([k, v]) => `--${k} ${v}`),
    ...flags.map((s) => `--${s}`),
    ...params
  ];
  const { stdout, stderr } = await sh(command.join(" "), true);
  if (!stderr) {
    return trim(stdout);
  } else throw new ExecError(stderr);
}
const escape = (str) => str.replace(/"/g, '\\"');
function mail(from, to, subject, body) {
  exec(`echo "${escape(body)}" | mail`, {
    params: [to],
    args: {
      subject: `"${escape(subject)}
Content-Type: text/html"`,
      append: `from:${from}`
    }
  });
}
export {
  mail
};
