import type { BackgroundId } from "@/data/backgrounds";
import type { PageKey } from "@/lib/cms";
import { HeroBackdrop } from "../showcase/HeroBackdrop";

/**
 * Section environment for inner pages. A thin alias over `HeroBackdrop` so
 * every page draws its background through the same registry.
 */
export function AmbientField({
  background = "dark-hero-02",
  page,
  scrim = "left",
  priority = false,
  className,
}: {
  background?: BackgroundId;
  page?: PageKey;
  scrim?: "left" | "center" | "none";
  priority?: boolean;
  className?: string;
}) {
  return (
    <HeroBackdrop
      background={background}
      page={page}
      scrim={scrim}
      priority={priority}
      className={className}
    />
  );
}
