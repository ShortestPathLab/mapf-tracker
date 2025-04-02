import { Box, Button, useTheme } from "@mui/material";
import { debounce } from "lodash";
import { useMemo, useState } from "react";
import {
  PrismLight as SyntaxHighlighter,
  SyntaxHighlighterProps,
} from "react-syntax-highlighter";
import json from "react-syntax-highlighter/dist/esm/languages/prism/json";
import yaml from "react-syntax-highlighter/dist/esm/languages/prism/yaml";
import {
  oneDark,
  oneLight,
} from "react-syntax-highlighter/dist/esm/styles/prism";
import csvWithHeading from "./csvWithHeading";
import { Scroll } from "./dialog/Scrollbars";

SyntaxHighlighter.registerLanguage("csv-with-heading", csvWithHeading);
SyntaxHighlighter.registerLanguage("json", json);
SyntaxHighlighter.registerLanguage("yaml", yaml);

interface CodeBlockProps {
  children?: string;
  language?: string;
}

export const CodeBlock = ({
  children,
  language,
  ...rest
}: CodeBlockProps & SyntaxHighlighterProps) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";
  const [isCopied, setIsCopied] = useState(false);
  const fn = useMemo(
    () => debounce(() => setIsCopied(false), 2000, { trailing: true }),
    [setIsCopied]
  );
  return (
    <Box
      sx={{
        position: "relative",
      }}
    >
      <Scroll x>
        <SyntaxHighlighter
          {...rest}
          customStyle={{
            borderRadius: theme.shape.borderRadius,
            overflow: "visible",
            minWidth: "fit-content",
            paddingRight: 72,
            ...rest.customStyle,
          }}
          language={language}
          style={{ ...(isDark ? oneDark : oneLight), ...rest.style }}
        >
          {children}
        </SyntaxHighlighter>
      </Scroll>
      <Box sx={{ position: "absolute", top: 20, right: 12 }}>
        <Button
          size="small"
          sx={{ minWidth: 0, px: 1, py: 0.5 }}
          variant="contained"
          onClick={() => {
            navigator?.clipboard?.writeText(children);
            setIsCopied(true);
            fn();
          }}
        >
          {isCopied ? "Copied" : "Copy"}
        </Button>
      </Box>
    </Box>
  );
};
