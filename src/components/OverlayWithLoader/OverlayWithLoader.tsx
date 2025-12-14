import { cn } from "@/lib/utils";
import { PropsWithChildren } from "react";
interface Props extends PropsWithChildren {
  className?: string;
}
export const OverlayWithLoader = ({ children, className }: Props) => {
  return (
    <div
      className={cn(
        "absolute inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center rounded-lg",
        className
      )}
    >
      <div className="flex flex-col items-center gap-2 h-full justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        {children}
      </div>
    </div>
  );
};
