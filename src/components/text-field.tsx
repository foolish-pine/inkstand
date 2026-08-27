import {
  type HTMLAttributes,
  type HTMLInputTypeAttribute,
  type HTMLInputAutoCompleteAttribute,
} from "react";

export function TextField({
  label,
  name,
  type,
  inputMode,
  autoComplete,
  defaultValue,
  hint,
  errors,
}: {
  label: string;
  name: string;
  type: HTMLInputTypeAttribute;
  inputMode?: HTMLAttributes<HTMLElement>["inputMode"];
  autoComplete?: HTMLInputAutoCompleteAttribute;
  defaultValue?: string;
  hint?: string;
  errors: string[] | undefined;
}) {
  const hintId = hint ? `${name}-hint` : undefined;
  const errorId = errors && errors.length > 0 ? `${name}-error` : undefined;

  return (
    <div>
      <label htmlFor={name} className="text-muted block text-xs tracking-wider">
        {label}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        inputMode={inputMode}
        autoComplete={autoComplete}
        defaultValue={defaultValue}
        aria-invalid={errors && errors.length > 0 ? true : undefined}
        aria-describedby={
          [hintId, errorId].filter((i) => i !== undefined).length > 0
            ? [hintId, errorId].filter((i) => i !== undefined).join(" ")
            : undefined
        }
        className="border-rule focus:border-accent aria-invalid:border-seal mt-2 w-full border-b-2 bg-transparent pb-2 text-base transition-colors outline-none"
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
