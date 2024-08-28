import execSh from "exec-sh";
import { entries, trim } from "lodash";
import { Shescape } from "shescape";
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
const shescape = new Shescape({
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
export {
  mail
};
