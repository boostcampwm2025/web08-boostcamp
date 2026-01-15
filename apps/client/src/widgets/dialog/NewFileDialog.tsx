import { Button, Input, Label } from "@/shared/ui";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/shared/ui/dialog";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/shared/ui/select";
import { DialogTrigger } from "@radix-ui/react-dialog";
import { useState, type ChangeEvent, type FormEvent } from "react";

type NewFileDialogProps = {
	onSubmit: (filename: string, ext: string) => Promise<void>;
	children: React.ReactNode;
};
type ExtType = "js" | "ts" | "jsx" | "tsx" | "html" | "css";

export function NewFileDialog({ onSubmit, children }: NewFileDialogProps) {

	const [open, setOpen] = useState(false);
	const [filename, setFilename] = useState("");
	const [helperMessage, setHelperMessage] = useState("");
	const [extname, setExtname] = useState<ExtType | undefined>(undefined);

	const errorPass = (): boolean => {
		if (filename.trim().length === 0) {
			setHelperMessage("파일 이름을 입력해주세요.");
			return false;
		}

		if (!extname) {
			setHelperMessage("파일 확장자를 정해주세요.");
			return false;
		}

		return true;
	};

	const clear = () => {
		setFilename("");
		setHelperMessage("");
		setOpen(false);
	}

	const handleChangeFilename = (ev: ChangeEvent<HTMLInputElement>) => {
    setFilename(ev.target.value);
  };

	const handleChangeExtname = (value: string) => setExtname(value as ExtType);
	const handleOnSubmit = (ev: FormEvent) => {
		ev.preventDefault();
		if (!errorPass()) {
			return;
		}

		onSubmit(filename, extname!);
		clear();
	};

  return (
		<Dialog onOpenChange={setOpen} open={open}>
			<DialogTrigger asChild>
				{ children }
			</DialogTrigger>
			<DialogContent className="sm:max-w-md">
				<form onSubmit={handleOnSubmit}>
					<DialogHeader>
						<DialogTitle>새 파일</DialogTitle>
						<DialogDescription>
							파일의 이름을 입력해서 새 파일을 만들어보세요
						</DialogDescription>
					</DialogHeader>
					<div className="flex items-center space-x-2 mt-2 mb-2">
						<Label htmlFor="filename" className="sr-only">
							파일명
						</Label>
						<Input
							id="filename"
							defaultValue={filename}
							onChange={handleChangeFilename}
							className="h-9"
						/>
						<Select value={extname} onValueChange={handleChangeExtname}>
							<SelectTrigger className="w-45">
								<SelectValue placeholder="확장자 선택" />
							</SelectTrigger>
							<SelectContent className="bg-white">
								<SelectGroup>
									<SelectLabel>확장자</SelectLabel>
									<SelectItem value="js">.js</SelectItem>
									<SelectItem value="ts">.ts</SelectItem>
									<SelectItem value="jsx">.jsx</SelectItem>
									<SelectItem value="tsx">.tsx</SelectItem>
									<SelectItem value="html">.html</SelectItem>
									<SelectItem value="css">.css</SelectItem>
								</SelectGroup>
							</SelectContent>
						</Select>
					</div>
					{helperMessage && <p className="text-[12px] text-destructive text-red-500">{helperMessage}</p>}
					<DialogFooter className="sm:justify-start">
						<Button type="submit" variant="default" size="sm">
							생성
						</Button>
						<DialogClose asChild>
							<Button type="button" variant="secondary" size="sm">
								닫기
							</Button>
						</DialogClose>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	)
}