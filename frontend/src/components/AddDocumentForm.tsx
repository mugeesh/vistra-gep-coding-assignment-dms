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

const TITLE_MAX_LENGTH = FIELD_LIMITS.nameMaxLength;
const STRING_FIELD_MAX_LENGTH = FIELD_LIMITS.stringFieldMaxLength;

const optionalString = (maxLen: number) =>
    z
        .string()
        .optional()
        .transform((s) => (s == null || s === '' ? undefined : s.trim()))
        .pipe(
            z.union([
                z.undefined(),
                z
                    .string()
                    .max(maxLen, VALIDATION_MESSAGES.maxLength(maxLen))
                    .refine(noControlChars, { message: VALIDATION_MESSAGES.noControlChars }),
            ]),
        );

const schema = z.object({
    title: z
        .string()
        .transform((s) => s.trim())
        .pipe(
            z
                .string()
                .min(1, VALIDATION_MESSAGES.required('Title'))
                .max(TITLE_MAX_LENGTH, VALIDATION_MESSAGES.maxLength(TITLE_MAX_LENGTH))
                .refine(noControlChars, { message: VALIDATION_MESSAGES.noControlChars }),
        ),
    folderId: z.union([z.number(), z.nan()]).optional().nullable(),
    description: optionalString(STRING_FIELD_MAX_LENGTH),
    fileName: optionalString(STRING_FIELD_MAX_LENGTH),
    mimeType: optionalString(STRING_FIELD_MAX_LENGTH),
    sizeBytes: z
        .preprocess(
            (val) => (val === '' ? undefined : val),
            z.union([
                z.number().int().nonnegative(),
                z.string().transform((s) => (s === '' ? undefined : Number(s))),
            ])
        )
        .optional()
        .refine((v) => v === undefined || (typeof v === 'number' && !Number.isNaN(v) && v >= 0), {
            message: 'Must be a non-negative number',
        }),
    createdBy: optionalString(STRING_FIELD_MAX_LENGTH),
});

// Extract types for React Hook Form
type AddDocumentFormInput = z.input<typeof schema>;
type AddDocumentFormOutput = z.output<typeof schema>;

// The values passed to the parent onSubmit
export type AddDocumentFormValues = AddDocumentFormOutput;

interface AddDocumentFormProps {
    defaultFolderId: number | null;
    onSubmit: (values: AddDocumentFormOutput) => Promise<void>;
    onCancel: () => void;
    isOpen: boolean;
}

export function AddDocumentForm({
                                    defaultFolderId,
                                    onSubmit,
                                    onCancel,
                                    isOpen,
                                }: AddDocumentFormProps) {
    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
        reset,
    } = useForm<AddDocumentFormInput, any, AddDocumentFormOutput>({
        resolver: zodResolver(schema),
        defaultValues: {
            title: '',
            folderId: defaultFolderId,
            description: '',
            fileName: '',
            mimeType: '',
            sizeBytes: '',
            createdBy: ''
        },
    });

    // Reset only when modal opens to prevent loop
    useEffect(() => {
        if (isOpen) {
            reset({
                title: '',
                folderId: defaultFolderId,
                description: '',
                fileName: '',
                mimeType: '',
                sizeBytes: '',
                createdBy: ''
            });
        }
    }, [isOpen, defaultFolderId, reset]);

    if (!isOpen) return null;

    const doSubmit = async (data: AddDocumentFormOutput) => {
        await onSubmit(data);
        reset();
    };

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
            role="dialog"
            aria-modal="true"
        >
            <div
                className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl dark:bg-zinc-900"
                onClick={(e) => e.stopPropagation()}
            >
                <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
                    New document
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
                        <label className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">Title</label>
                        <input
                            type="text"
                            autoFocus
                            {...register('title')}
                            className="w-full rounded border border-zinc-300 bg-white px-3 py-2 text-zinc-900 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100"
                        />
                        {errors.title && <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>}
                    </div>

                    <div>
                        <label className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">Description</label>
                        <textarea
                            {...register('description')}
                            className="w-full rounded border border-zinc-300 bg-white px-3 py-2 text-zinc-900 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">File Name</label>
                            <input
                                type="text"
                                {...register('fileName')}
                                className="w-full rounded border border-zinc-300 bg-white px-3 py-2 text-zinc-900 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100"
                            />
                        </div>
                        <div>
                            <label className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">Size (Bytes)</label>
                            <input
                                type="text"
                                {...register('sizeBytes')}
                                className="w-full rounded border border-zinc-300 bg-white px-3 py-2 text-zinc-900 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">Created By</label>
                        <input
                            type="text"
                            {...register('createdBy')}
                            className="w-full rounded border border-zinc-300 bg-white px-3 py-2 text-zinc-900 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100"
                        />
                    </div>

                    <div className="flex justify-end gap-2">
                        <button type="reset" className="px-4 py-2 text-sm font-medium text-zinc-700 dark:text-zinc-300">Cancel</button>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="rounded bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
                        >
                            {isSubmitting ? 'Creating…' : 'Create document'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
