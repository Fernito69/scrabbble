import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";
import { PropsWithChildren } from "react";
interface Props extends PropsWithChildren {
  className?: string;
  hideLoader?: boolean;
}
export const OverlayWithLoader = ({
  children,
  className,
  hideLoader = false,
}: Props) => {
  return (
    <div
      className={cn(
        "absolute inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center rounded-lg",
        className
      )}
    >
      <div className="flex flex-col items-center gap-2 h-full justify-center">
        <div className="flex flex-col gap-4 relative min-h-[200px] items-center justify-center">
          {!hideLoader && (
            <Loader2 className="h-12 w-12 animate-spin text-blue-400" />
          )}
        </div>
        {children}
      </div>
    </div>
  );
};
