import { RadixButton as Button } from '@codejam/ui';
import {
  RadixDialog as Dialog,
  DialogClose,
  RadixDialogContent as DialogContent,
  RadixDialogDescription as DialogDescription,
  RadixDialogFooter as DialogFooter,
  RadixDialogHeader as DialogHeader,
  RadixDialogTitle as DialogTitle,
  RadixDialogTrigger as DialogTrigger,
} from '@codejam/ui';
import { RadixInput as Input } from '@codejam/ui';
import { RadixLabel as Label } from '@codejam/ui';

type ShareDialogProps = {
  children: React.ReactNode;
};

export function ShareDialog({ children }: ShareDialogProps) {
  return (
    <Dialog>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Share Link</DialogTitle>
          <DialogDescription>
            현재 페이지의 링크를 복사하여 다른 사람에게 공유해보세요.
          </DialogDescription>
        </DialogHeader>
        <div className="flex items-center space-x-2">
          <div className="grid flex-1 gap-2">
            <Label htmlFor="link" className="sr-only">
              Link
            </Label>
            <Input
              id="link"
              defaultValue={window.location.href}
              readOnly
              className="h-9"
            />
          </div>
        </div>
        <DialogFooter className="sm:justify-start">
          <DialogClose asChild>
            <Button type="button" variant="secondary" size="sm">
              Close
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
