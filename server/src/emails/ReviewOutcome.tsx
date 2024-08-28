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
  Text,
} from "@react-email/components";
import { startCase } from "lodash";
import React from "react";
import { ReactNode } from "react";

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
  const renderText = (text: ReactNode, secondary?: boolean) => (
    <Text
      className={`text-left ${
        secondary ? "text-[#666666]" : "text-black"
      } text-[14px] mb-[24px]`}
    >
      {text}
    </Text>
  );
  const renderItem = (label: ReactNode, value: ReactNode) => (
    <Text className="text-left text-[#666666] text-[14px] leading-[24px]">
      {label}
      <br />
      <span className="text-black">{value}</span>
    </Text>
  );
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
                <CodeInline>{apiKey}</CodeInline>
              )}
            {comments && renderItem("Comments", comments)}
            <Hr className="border border-solid border-[#eaeaea] my-[26px] mx-0 w-full" />
            {renderText(
              <>
                This email was sent from an automated service. If you have any
                questions or concerns, please reply to this email to get in
                touch with the MAPF Tracker team.
              </>,
              true
            )}
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
}
