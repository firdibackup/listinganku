'use client';

import { useId } from 'react';
import type { InputHTMLAttributes, TextareaHTMLAttributes, ReactNode } from 'react';

export interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label?: string;
  hint?: string;
  error?: string;
  textarea?: boolean;
  rows?: number;
  suffix?: ReactNode;
}

export function Input({
  label,
  hint,
  error,
  textarea = false,
  rows = 3,
  suffix,
  required,
  className = '',
  id,
  ...rest
}: InputProps) {
  const generated = useId();
  const fieldId = id ?? generated;
  const hintId = `${fieldId}-hint`;
  const errorId = `${fieldId}-error`;
  const describedBy = [error ? errorId : null, !error && hint ? hintId : null].filter(Boolean).join(' ') || undefined;

  const shared = {
    id: fieldId,
    className: 'ds-field__input',
    'aria-invalid': error ? true : undefined,
    'aria-describedby': describedBy,
    required,
  };

  return (
    <div className={['ds-field', error ? 'ds-field--error' : '', className].filter(Boolean).join(' ')}>
      {label ? (
        <label className="ds-field__label" htmlFor={fieldId}>
          {label}
          {required ? (
            <span className="ds-field__required" aria-hidden="true">
              •
            </span>
          ) : null}
        </label>
      ) : null}
      <div className="ds-field__control">
        {textarea ? (
          <textarea rows={rows} {...shared} {...(rest as unknown as TextareaHTMLAttributes<HTMLTextAreaElement>)} />
        ) : (
          <input {...shared} {...rest} />
        )}
        {suffix ? <span className="ds-field__suffix">{suffix}</span> : null}
      </div>
      {error ? (
        <span id={errorId} className="ds-field__error">
          {error}
        </span>
      ) : hint ? (
        <span id={hintId} className="ds-field__hint">
          {hint}
        </span>
      ) : null}
    </div>
  );
}
