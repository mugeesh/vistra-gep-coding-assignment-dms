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

const NAME_MAX_LENGTH = FIELD_LIMITS.nameMaxLength;
const CREATED_BY_MAX_LENGTH = 100; // adjust as needed or move to FIELD_LIMITS

const schema = z.object({
    name: z
        .string()
        .transform((s) => s.trim())
        .pipe(
            z
                .string()
                .min(1, VALIDATION_MESSAGES.required('Name'))
                .max(NAME_MAX_LENGTH, VALIDATION_MESSAGES.maxLength(NAME_MAX_LENGTH))
                .refine(noControlChars, { message: VALIDATION_MESSAGES.noControlChars }),
        ),
    parentId: z.union([z.number(), z.nan()]).optional().nullable(),
    createdBy: z
        .string()
        .transform((s) => s.trim())
        .pipe(
            z
                .string()
                .min(1, VALIDATION_MESSAGES.required('Created by'))
                .max(CREATED_BY_MAX_LENGTH, VALIDATION_MESSAGES.maxLength(CREATED_BY_MAX_LENGTH))
                .refine(noControlChars, { message: VALIDATION_MESSAGES.noControlChars }),
        )
        .optional()
        .default('-'),
});

// Separate input & output types — this is the key
type AddFolderFormInput = z.input<typeof schema>;
type AddFolderFormOutput = z.output<typeof schema>;

// The type you pass to onSubmit
export type AddFolderFormValues = AddFolderFormOutput;

interface AddFolderFormProps {
    defaultParentId: number | null;
    onSubmit: (values: AddFolderFormValues) => Promise<void>;
    onCancel: () => void;
    isOpen: boolean;
}

export function AddFolderForm({
                                  defaultParentId,
                                  onSubmit,
                                  onCancel,
                                  isOpen,
                              }: AddFolderFormProps) {
    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
        reset,
    } = useForm<AddFolderFormInput, any, AddFolderFormOutput>({
        resolver: zodResolver(schema),
        defaultValues: {
            name: '',
            parentId: defaultParentId,
            createdBy: '',           // input allows empty → will become '-' after validation
        },
    });

    useEffect(() => {
        if (isOpen) {
            reset({
                name: '',
                parentId: defaultParentId,
                createdBy: '',
            });
        }
    }, [isOpen, defaultParentId, reset]);

    if (!isOpen) return null;

    const doSubmit = async (values: AddFolderFormOutput) => {
        const parentId =
            values.parentId !== undefined &&
            values.parentId !== null &&
            !Number.isNaN(values.parentId)
                ? values.parentId
                : null;

        await onSubmit({
            name: values.name,
            parentId,
            createdBy: values.createdBy,   // guaranteed to be string (thanks to default('-'))
        });

        reset();
    };

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
            role="dialog"
            aria-modal="true"
            aria-labelledby="add-folder-title"
        >
            <div
                className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl dark:bg-zinc-900"
                onClick={(e) => e.stopPropagation()}
            >
                <h2 id="add-folder-title" className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
                    New folder
                </h2>

                <form
                    onSubmit={handleSubmit(doSubmit)}
                    onReset={() => {
                        reset();
                        onCancel();
                    }}
                    className="mt-4 space-y-4"
                >
                    <div>
                        <label
                            htmlFor="folder-name"
                            className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300"
                        >
                            Name
                        </label>
                        <input
                            id="folder-name"
                            type="text"
                            autoFocus
                            maxLength={NAME_MAX_LENGTH}
                            {...register('name')}
                            className="w-full rounded border border-zinc-300 bg-white px-3 py-2 text-zinc-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100"
                            placeholder="Folder name"
                            aria-invalid={!!errors.name}
                        />
                        {errors.name && (
                            <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                                {errors.name?.message}
                            </p>
                        )}
                    </div>

                    <div>
                        <label
                            htmlFor="created-by"
                            className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300"
                        >
                            Created by
                        </label>
                        <input
                            id="created-by"
                            type="text"
                            maxLength={CREATED_BY_MAX_LENGTH}
                            {...register('createdBy')}
                            className="w-full rounded border border-zinc-300 bg-white px-3 py-2 text-zinc-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100"
                            placeholder="Your name"
                            aria-invalid={!!errors.createdBy}
                        />
                        {errors.createdBy && (
                            <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                                {errors.createdBy?.message}
                            </p>
                        )}
                    </div>

                    <div className="flex justify-end gap-2">
                        <button
                            type="reset"
                            className="rounded px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="rounded bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
                        >
                            {isSubmitting ? 'Creating…' : 'Create folder'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
