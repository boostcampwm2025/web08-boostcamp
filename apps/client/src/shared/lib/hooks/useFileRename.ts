import { socket } from "@/shared/api/socket";
import { SOCKET_EVENTS } from "@codejam/common";
import { useState } from "react";
import { toast } from "sonner";

export type FileResult = {
	error: false;
} | {
	error: true;
	type: "ext" | "duplicate";
	message?: string;
};

export function useFileRename(roomCode: string | null) {
  const [isDuplicated, setIsDuplicated] = useState(false);

	if (!roomCode) {
		throw new Error("Invalid roomCode");
	}

	const handleShowModal = (result: FileResult): boolean => {
		if (!result.error) {
			setIsDuplicated(false);
			return true;
		}

		if (result.type === "duplicate") {
			setIsDuplicated(true);
		}

		if (result.message) {
			toast.error(result.message);
		}

		return false;
	};

	const handleCheckRename = (filename: string): Promise<boolean> => {
		return new Promise((resolve) => {
			socket.emit(SOCKET_EVENTS.CHECK_FILENAME, {
				roomCode,
				filename,
			}, (response: FileResult) => {
				resolve(handleShowModal(response));
			});
		});
	};

	return {
		isDuplicated,
		setIsDuplicated,
		handleCheckRename,
	};
}
