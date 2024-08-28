import { exec } from "./exec";

const escape = (str: string) => str.replace(/"/g, '\\"');

export function mail(from: string, to: string, subject: string, body: string) {
  exec(`echo "${escape(body)}" | mail`, {
    params: [to],
    args: {
      subject: `"${escape(subject)}"`,
      append: `from:${from}`,
    },
  });
}
