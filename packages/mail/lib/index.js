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
function mail(from, to, subject, body) {
  exec(`echo "${body}" | mail`, {
    params: [to],
    args: {
      subject,
      append: `from:${from}`
    }
  });
}
export {
  mail
};
