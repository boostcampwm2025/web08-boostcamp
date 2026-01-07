import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/shared/ui/dialog";
import { Button } from "@/shared/ui/button";

interface CreateRoomDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateRoomDialog({
  open,
  onOpenChange,
}: CreateRoomDialogProps) {
  const handleQuickStart = () => {
    console.log("Quick Start clicked");
    // Add your room creation logic here
  };

  const handleCustom = () => {
    console.log("Custom clicked");
    // Add your custom room creation logic here
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex flex-col items-center justify-center">
        <DialogHeader className="text-center sm:text-center items-center">
          <DialogTitle>방 만들기</DialogTitle>
          <DialogDescription></DialogDescription>
        </DialogHeader>
        <div className="flex flex-col items-center gap-0 w-full">
          <div className="bg-white focus-within:bg-black w-full flex justify-center transition-colors">
            <Button
              onClick={handleQuickStart}
              size="lg"
              autoFocus
              className="bg-transparent text-black focus:text-white transition-all font-mono text-lg px-8"
            >
              Quick Start
            </Button>
          </div>
          <div className="bg-transparent focus-within:bg-black w-full flex justify-center transition-colors">
            <Button
              onClick={handleCustom}
              size="lg"
              disabled
              className="bg-transparent text-gray-800 focus-within:text-white transition-all font-mono text-lg px-8"
            >
              Custom
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
