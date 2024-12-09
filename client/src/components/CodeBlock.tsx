import { useTheme } from "@mui/material";
import { PrismLight as SyntaxHighlighter } from "react-syntax-highlighter";
import json from "react-syntax-highlighter/dist/esm/languages/prism/json";
import yaml from "react-syntax-highlighter/dist/esm/languages/prism/yaml";
import {
  oneDark,
  oneLight,
} from "react-syntax-highlighter/dist/esm/styles/prism";
import csvWithHeading from "./csvWithHeading";

SyntaxHighlighter.registerLanguage("csv-with-heading", csvWithHeading);
SyntaxHighlighter.registerLanguage("json", json);
SyntaxHighlighter.registerLanguage("yaml", yaml);

interface CodeBlockProps {
  children?: string;
  language?: string;
}

export const CodeBlock = ({ children, language }: CodeBlockProps) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";
  return (
    <SyntaxHighlighter language={language} style={isDark ? oneDark : oneLight}>
      {children}
    </SyntaxHighlighter>
  );
};
