import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";

interface ScrabbbbbbleLogoProps {
  size?: string;
  withLink?: boolean;
}
export const ScrabbbbbbleLogo = ({
  size = "text-3xl",
  withLink = false,
}: ScrabbbbbbleLogoProps) => {
  const navigate = useNavigate();
  const className = cn(
    "tracking-tight font-bold",
    size,
    withLink ? "cursor-pointer" : ""
  );
  return (
    <h1
      className={className}
      onClick={() => withLink && navigate("/")}
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
