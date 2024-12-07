import { exec } from "./exec";
import { Shescape } from "shescape";

const shescape = new Shescape({
  shell: true,
});

export function mail(from: string, to: string, subject: string, body: string) {
  console.log(shescape.quote(body));
  exec(`echo ${shescape.quote(body)} | mail`, {
    params: [shescape.escape(to)],
    args: {
      subject: shescape.quote(`${subject}\nContent-Type: text/html`),
      append: `from:${shescape.escape(from)}`,
    },
  });
}
