import z from "zod";

export const fatal = (ctx: z.RefinementCtx, msg: string) => {
  ctx.addIssue({
    code: z.ZodIssueCode.custom,
    message: msg,
    fatal: true,
  });
  return z.NEVER;
};
