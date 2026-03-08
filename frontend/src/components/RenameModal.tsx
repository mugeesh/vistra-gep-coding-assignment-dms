'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import {
  FIELD_LIMITS,
  VALIDATION_MESSAGES,
  noControlChars,
} from '@/lib/validation';

const RENAME_MAX_LENGTH = FIELD_LIMITS.nameMaxLength;

const schema = z.object({
  name: z
    .string()
    .transform((s) => s.trim())
    .pipe(
      z
        .string()
        .min(1, VALIDATION_MESSAGES.required('Name'))
        .max(RENAME_MAX_LENGTH, VALIDATION_MESSAGES.maxLength(RENAME_MAX_LENGTH))
        .refine(noControlChars, { message: VALIDATION_MESSAGES.noControlChars }),
    ),
});

export type RenameFormValues = z.infer<typeof schema>;

interface RenameModalProps {
  isOpen: boolean;
  kind: 'folder' | 'document';
  currentName: string;
  onCancel: () => void;
  onSave: (value: string) => Promise<void>;
}

export function RenameModal({
  isOpen,
  kind,
  currentName,
  onCancel,
  onSave,
}: RenameModalProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<RenameFormValues>({
    resolver: zodResolver(schema),
    defaultValues: { name: currentName },
  });

  useEffect(() => {
    if (isOpen) {
      reset({ name: currentName });
    }
  }, [isOpen, currentName, reset]);

  if (!isOpen) return null;

  const label = kind === 'folder' ? 'Folder name' : 'Document title';
  const title = kind === 'folder' ? 'Rename folder' : 'Rename document';

  const doSubmit = async (values: RenameFormValues) => {
    await onSave(values.name.trim());
    onCancel();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      role="dialog"
      aria-modal="true"
      aria-labelledby="rename-modal-title"
    >
      <div
        className="w-full max-w-sm rounded-lg bg-white p-6 shadow-xl dark:bg-zinc-900"
        onClick={(e) => e.stopPropagation()}
      >
        <h2
          id="rename-modal-title"
          className="text-lg font-semibold text-zinc-900 dark:text-zinc-100"
        >
          {title}
        </h2>
        <form onSubmit={handleSubmit(doSubmit)} className="mt-4 space-y-4">
          <div>
            <label
              htmlFor="rename-input"
              className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300"
            >
              {label}
            </label>
            <input
              id="rename-input"
              type="text"
              autoFocus
              maxLength={RENAME_MAX_LENGTH}
              {...register('name')}
              className="w-full rounded border border-zinc-300 bg-white px-3 py-2 text-zinc-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100"
              placeholder={label}
              aria-invalid={!!errors.name}
            />
            {errors.name && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                {errors.name.message}
              </p>
            )}
          </div>
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={onCancel}
              className="rounded px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {isSubmitting ? 'Saving…' : 'Save'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
