// Web equivalent of apps/mobile's modules/shared/components/error-message.tsx — same
// single-vs-list rendering rule, styled with the dashboard's own destructive color token instead
// of a hardcoded red.
type ErrorMessageProps = {
  message?: string | string[];
  fallback: string;
};

export function ErrorMessage({ message, fallback }: ErrorMessageProps) {
  if (Array.isArray(message) && message.length > 1) {
    return (
      <ul className="mb-2 flex flex-col gap-1 rounded-lg border border-destructive/50 bg-destructive/10 p-3">
        {message.map((item, index) => (
          <li key={index} className="flex gap-2 text-sm text-destructive">
            <span>•</span>
            <span className="flex-1">{item}</span>
          </li>
        ))}
      </ul>
    );
  }

  const singleMessage = Array.isArray(message) ? message[0] : message;

  return (
    <div className="mb-2 rounded-lg border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">
      {singleMessage || fallback}
    </div>
  );
}
