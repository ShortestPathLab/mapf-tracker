import {
  Body,
  Container,
  Font,
  Head,
  Heading,
  Hr,
  Html,
  Tailwind,
} from "@react-email/components";
import { entries, startCase } from "lodash";
import { Infer, Request } from "models";
import React from "react";
import { renderItem, renderText } from "./renderText";
import { footerText } from "./footerText";

export type Props = Infer<typeof Request>;

RequestConfirmation.PreviewProps = {} as Props;

export default function RequestConfirmation(args: Props) {
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
              We have received your request
            </Heading>
            {entries(args)
              .filter(([, v]) => typeof v === "string")
              .map(([k, v]) =>
                renderItem(startCase(k), (v as string) || "None")
              )}
            <Hr className="border border-solid border-[#eaeaea] my-[26px] mx-0 w-full" />
            {renderText(footerText, true)}
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
}
