import { ArticleLayout, Prose } from "layout";
import { ReactNode } from "react";

export function createArticlePage({
  key,
  title,
  icon,
  content,
  description,
}: {
  key: string;
  title: string;
  icon: ReactNode;
  content: ReactNode;
  description: string;
}) {
  return {
    label: title,
    value: key,
    icon,
    content: (
      <ArticleLayout
        title={title}
        subtitle={description}
        path={[
          { name: "Home", url: "/" },
          { name: "Docs", url: "/docs" },
        ]}
      >
        <Prose>{content}</Prose>
      </ArticleLayout>
    ),
    description,
  };
}
