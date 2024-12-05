import { Box, useTheme } from "@mui/material";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import {
  oneLight,
  oneDark,
} from "react-syntax-highlighter/dist/esm/styles/prism";

interface CodeBlockProps {
  children?: string;
  language?: string;
}

export const CodeBlock = ({ children, language }: CodeBlockProps) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";
  return (
    <Box
      component="code"
      sx={{
        whiteSpace: "pre-wrap",
      }}
    >
      <SyntaxHighlighter
        language={language}
        style={isDark ? oneDark : oneLight}
      >
        {children}
      </SyntaxHighlighter>
    </Box>
  );
};
