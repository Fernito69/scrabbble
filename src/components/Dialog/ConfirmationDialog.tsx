import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "../ui/button";

interface Props {
  onAccept: () => void;
  isDisabled?: boolean;
  title?: string;
  description?: string;
  triggerElement: React.ReactNode;
}
export const ConfirmationDialog = ({
  onAccept,
  isDisabled,
  description,
  title,
  triggerElement,
}: Props) => {
  return (
    <Dialog>
      <DialogTrigger disabled={isDisabled} asChild>
        {triggerElement}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          {title != null && <DialogTitle>{title}</DialogTitle>}
          {description != null && (
            <DialogDescription>{description}</DialogDescription>
          )}
        </DialogHeader>
        <DialogFooter className="sm:justify-end">
          <DialogClose asChild>
            <Button type="button" variant="secondary">
              Cancel
            </Button>
          </DialogClose>
          <DialogClose asChild>
            <Button type="submit" variant="destructive" onClick={onAccept}>
              Accept
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
