export function extname(name: string): string {
  const lastDot = name.trim().lastIndexOf(".");

  if (lastDot === -1) {
		return "";
	}

	return name.trim().substring(lastDot + 1).toLowerCase();
}

export function purename(name: string): string {
	const lastDot = name.trim().lastIndexOf(".");

  if (lastDot === -1) {
		return "";
	}

	return name.trim().substring(0, lastDot);
}