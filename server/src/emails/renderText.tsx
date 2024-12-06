import { Text } from "@react-email/components";
import React from "react";
import { ReactNode } from "react";

export const renderText = (text: ReactNode, secondary?: boolean) => (
  <Text
    className={`text-left ${
      secondary ? "text-[#666666]" : "text-black"
    } text-[14px] mb-[24px]`}
  >
    {text}
  </Text>
);
export const renderItem = (label: ReactNode, value: ReactNode) => (
  <Text className="text-left text-[#666666] text-[14px] leading-[24px]">
    {label}
    <br />
    <span className="text-black">{value}</span>
  </Text>
);
