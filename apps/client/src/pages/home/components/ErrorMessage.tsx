interface ErrorMessageProps {
  message?: string;
}

export function ErrorMessage({ message }: ErrorMessageProps) {
  return (
    <div className="w-full">
      <p
        className={`wrap-break-words text-center text-lg whitespace-pre-line text-red-500 ${
          message ? 'visible' : 'invisible'
        }`}
      >
        {message || '\u00A0'}
      </p>
    </div>
  );
}
