"use client";

import { useText } from "@/cms/CmsProvider";
import { splitList } from "@/cms/useSiteLists";
import { Tag } from "../ui/Primitives";

/**
 * The tool chips on technology card `index` (1-based), read from the
 * comma-separated `stack.N.items` field. Renders the `<li>`s only, so the
 * caller keeps its own `<ul>` styling.
 */
export function StackTags({ index }: { index: number }) {
  const items = splitList(useText(`stack.${index}.items`));
  return (
    <>
      {items.map((item, i) => (
        <li key={i}>
          <Tag>{item}</Tag>
        </li>
      ))}
    </>
  );
}
