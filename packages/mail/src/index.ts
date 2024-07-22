import { exec } from "./exec";

export function mail(from: string, to: string, subject: string, body: string) {
  exec(`echo "${body}" | mail`, {
    params: [to],
    args: {
      subject: subject,
      append: `from:${from}`,
    },
  });
}
