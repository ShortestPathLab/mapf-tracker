import {
  Body,
  CodeInline,
  Container,
  Font,
  Head,
  Heading,
  Hr,
  Html,
  Tailwind,
} from "@react-email/components";
import { startCase } from "lodash";
import React from "react";
import { renderItem, renderLink, renderText } from "./renderText";
import { footerText } from "./footerText";

export type Props = {
  name?: string;
  apiKey?: string;
  status: string;
  comments: string;
};

ReviewOutcome.PreviewProps = {
  name: "John Doe",
  apiKey: Array(32)
    .fill("")
    .map(() => String.fromCharCode(Math.floor(Math.random() * 26) + 97))
    .join(""),
  status: "approved",
  comments: "No comment",
} as Props;

export default function ReviewOutcome({
  name,
  apiKey,
  status,
  comments,
}: Props) {
  return (
    <Html>
      <Head>
        <Font
          fontFamily="Inter Tight"
          fallbackFontFamily="Arial"
          webFont={{
            url: "https://fonts.gstatic.com/s/intertight/v7/NGSwv5HMAFg6IuGlBNMjxLsH8ag.woff2",
            format: "woff2",
          }}
          fontWeight={500}
          fontStyle="normal"
        />
      </Head>
      <Tailwind>
        <Body className="bg-white my-auto mx-auto font-sans px-2">
          <Container className="border border-solid border-[#eaeaea] rounded my-[40px] mx-auto p-[20px] max-w-[465px]">
            <Heading className="text-black text-[24px] font-normal text-center p-0 my-[30px] mx-0">
              Your submission key request has been reviewed
            </Heading>
            {renderText(`Hello ${name || "user"},`)}
            {renderText(
              <>
                Thank you for using MAPF Tracker. The following is the outcome
                of your request review:
              </>
            )}
            {renderItem("Outcome", startCase(status))}
            {status === "approved" &&
              renderItem(
                "Your submission key",
                <>
                  <CodeInline>{apiKey}</CodeInline>
                  <br />
                  {renderLink("Use your key", process.env.EMAIL_CALLBACK)}
                </>
              )}
            {comments && renderItem("Comments", comments)}
            <Hr className="border border-solid border-[#eaeaea] my-[26px] mx-0 w-full" />
            {renderText(footerText, true)}
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
}
