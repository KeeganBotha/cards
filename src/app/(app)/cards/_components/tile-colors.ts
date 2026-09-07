import type { CardColor } from "../_data/cards.schemas";

// Static class strings so Tailwind sees every utility. null → slate (default).
export const TILE_CLASS: Record<CardColor, string> = {
  RED: "bg-tile-red",
  ORANGE: "bg-tile-orange",
  YELLOW: "bg-tile-yellow",
  GREEN: "bg-tile-green",
  TEAL: "bg-tile-teal",
  BLUE: "bg-tile-blue",
  INDIGO: "bg-tile-indigo",
  PURPLE: "bg-tile-purple",
  PINK: "bg-tile-pink",
  SLATE: "bg-tile-slate",
};

export const COLOR_LABELS: Record<CardColor, string> = {
  RED: "Red",
  ORANGE: "Orange",
  YELLOW: "Yellow",
  GREEN: "Green",
  TEAL: "Teal",
  BLUE: "Blue",
  INDIGO: "Indigo",
  PURPLE: "Purple",
  PINK: "Pink",
  SLATE: "Slate",
};

export const tileClass = (color: CardColor | null) =>
  `${TILE_CLASS[color ?? "SLATE"]} text-tile-foreground`;
