export const ptStorage = {
	myId: (roomCode: string | undefined) => {
		if (!roomCode) {
			return null;
		}

		return localStorage.getItem(`ptId:${roomCode}`);
	}
};