import { Box, Typography } from "@mui/material";
import type { ReactNode } from "react";

interface ChatMarkdownProps {
  content: string;
}

type Block =
  | { type: "paragraph"; lines: string[] }
  | { type: "unordered-list"; items: string[] }
  | { type: "ordered-list"; items: string[] };

const orderedListPattern = /^\d+\.\s+/;
const unorderedListPattern = /^[-*]\s+/;

function renderInline(text: string): ReactNode[] {
  const result: ReactNode[] = [];
  const pattern = /(\*\*[^*]+\*\*|\*[^*]+\*)/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null = pattern.exec(text);

  while (match) {
    if (match.index > lastIndex) {
      result.push(text.slice(lastIndex, match.index));
    }

    const token = match[0];

    if (token.startsWith("**") && token.endsWith("**")) {
      result.push(
        <Box component="strong" key={`${match.index}-strong`} sx={{ fontWeight: 700 }}>
          {token.slice(2, -2)}
        </Box>,
      );
    } else if (token.startsWith("*") && token.endsWith("*")) {
      result.push(
        <Box component="em" key={`${match.index}-em`} sx={{ fontStyle: "italic" }}>
          {token.slice(1, -1)}
        </Box>,
      );
    } else {
      result.push(token);
    }

    lastIndex = match.index + token.length;
    match = pattern.exec(text);
  }

  if (lastIndex < text.length) {
    result.push(text.slice(lastIndex));
  }

  return result;
}

function parseBlocks(content: string): Block[] {
  const lines = content.split("\n");
  const blocks: Block[] = [];
  let paragraphLines: string[] = [];

  const flushParagraph = () => {
    if (paragraphLines.length > 0) {
      blocks.push({ type: "paragraph", lines: paragraphLines });
      paragraphLines = [];
    }
  };

  let index = 0;

  while (index < lines.length) {
    const line = lines[index].trimEnd();
    const trimmed = line.trim();

    if (trimmed.length === 0) {
      flushParagraph();
      index += 1;
      continue;
    }

    if (orderedListPattern.test(trimmed)) {
      flushParagraph();
      const items: string[] = [];

      while (index < lines.length && orderedListPattern.test(lines[index].trim())) {
        items.push(lines[index].trim().replace(orderedListPattern, ""));
        index += 1;
      }

      blocks.push({ type: "ordered-list", items });
      continue;
    }

    if (unorderedListPattern.test(trimmed)) {
      flushParagraph();
      const items: string[] = [];

      while (index < lines.length && unorderedListPattern.test(lines[index].trim())) {
        items.push(lines[index].trim().replace(unorderedListPattern, ""));
        index += 1;
      }

      blocks.push({ type: "unordered-list", items });
      continue;
    }

    paragraphLines.push(trimmed);
    index += 1;
  }

  flushParagraph();
  return blocks;
}

export function ChatMarkdown({ content }: ChatMarkdownProps) {
  const blocks = parseBlocks(content);

  return (
    <Box>
      {blocks.map((block, blockIndex) => {
        if (block.type === "paragraph") {
          return (
            <Typography
              key={`paragraph-${blockIndex}`}
              variant="body1"
              sx={{ "& + &": { mt: 1.25 } }}
            >
              {block.lines.map((line, lineIndex) => (
                <Box component="span" key={`line-${blockIndex}-${lineIndex}`}>
                  {renderInline(line)}
                  {lineIndex < block.lines.length - 1 && <br />}
                </Box>
              ))}
            </Typography>
          );
        }

        if (block.type === "ordered-list") {
          return (
            <Box
              key={`ordered-${blockIndex}`}
              component="ol"
              sx={{ my: 0.5, pl: 3, "& li + li": { mt: 0.5 } }}
            >
              {block.items.map((item, itemIndex) => (
                <Box component="li" key={`ordered-item-${blockIndex}-${itemIndex}`}>
                  <Typography component="span" variant="body1">
                    {renderInline(item)}
                  </Typography>
                </Box>
              ))}
            </Box>
          );
        }

        return (
          <Box
            key={`unordered-${blockIndex}`}
            component="ul"
            sx={{ my: 0.5, pl: 3, "& li + li": { mt: 0.5 } }}
          >
            {block.items.map((item, itemIndex) => (
              <Box component="li" key={`unordered-item-${blockIndex}-${itemIndex}`}>
                <Typography component="span" variant="body1">
                  {renderInline(item)}
                </Typography>
              </Box>
            ))}
          </Box>
        );
      })}
    </Box>
  );
}
