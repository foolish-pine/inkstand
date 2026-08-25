export function TextareaField({
  label,
  name,
  rows = 16,
  defaultValue,
  hint,
  errors,
}: {
  label: string;
  name: string;
  rows?: number;
  defaultValue?: string;
  hint?: string;
  errors: string[] | undefined;
}) {
  const hintId = hint ? `${name}-hint` : undefined;
  const errorId = errors && errors.length > 0 ? `${name}-error` : undefined;
  const describedBy = [hintId, errorId].filter((id) => id !== undefined);

  return (
    <div>
      <label htmlFor={name} className="text-muted block text-xs tracking-wider">
        {label}
      </label>
      <textarea
        id={name}
        name={name}
        rows={rows}
        defaultValue={defaultValue}
        aria-invalid={errors && errors.length > 0 ? true : undefined}
        aria-describedby={
          describedBy.length > 0 ? describedBy.join(" ") : undefined
        }
        className="border-rule focus:border-accent aria-invalid:border-seal mt-2 w-full resize-y border-2 bg-transparent p-3 font-mono text-sm leading-relaxed transition-colors outline-none"
      />
      {hint && (
        <p id={hintId} className="text-muted mt-2 text-xs">
          {hint}
        </p>
      )}
      {errors && errors.length > 0 && (
        <ul id={errorId}>
          {errors.map((error) => (
            <li className="text-seal mt-2 text-xs" key={error}>
              {error}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
