interface ErrorMessageProps {
  message: string;
}

export function ErrorMessage({ message }: ErrorMessageProps) {
  if (!message) return null;

  return (
    <div className="-mt-2 min-h-5 w-full">
      <p className="wrap-break-words text-center font-mono text-sm text-red-500">
        {message}
      </p>
    </div>
  );
}
