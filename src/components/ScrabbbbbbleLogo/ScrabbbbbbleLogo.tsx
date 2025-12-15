import { cn } from "@/lib/utils";

interface ScrabbbbbbleLogoProps {
  size?: string;
}
export const ScrabbbbbbleLogo = ({
  size = "text-3xl",
}: ScrabbbbbbleLogoProps) => {
  const className = cn("tracking-tight font-bold", size);
  return (
    <h1
      className={className}
      style={{
        textShadow:
          "3px 3px 0px rgba(0, 0, 0, 0.2), 6px 6px 0px rgba(30, 30, 30, 0.80)",
        WebkitBackgroundClip: "text",

        WebkitTextFillColor: "transparent",
        backgroundClip: "text",
      }}
    >
      scrabbbbbble
    </h1>
  );
};
