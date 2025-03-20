import { exec } from "./exec";
import { Shescape } from "shescape";

const shescape = new Shescape({
  shell: true,
});

export function mail(from: string, to: string, subject: string, body: string) {
  exec(`echo ${shescape.quote(body)} | mail`, {
    params: [shescape.escape(to)],
    args: {
      subject: shescape.quote(`${subject}\nContent-Type: text/html`),
      append: `From:${shescape.escape(from)}`,
    },
  });
}
