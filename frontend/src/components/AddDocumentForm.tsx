'use client';

import {zodResolver} from '@hookform/resolvers/zod';
import {useEffect} from 'react';
import {useForm} from 'react-hook-form';
import {z} from 'zod';
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
                    .refine(noControlChars, {message: VALIDATION_MESSAGES.noControlChars}),
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
                .refine(noControlChars, {message: VALIDATION_MESSAGES.noControlChars}),
        ),
    folderId: z.union([z.number(), z.nan()]).optional().nullable(),
    description: optionalString(STRING_FIELD_MAX_LENGTH),
    fileName: optionalString(STRING_FIELD_MAX_LENGTH),
    mimeType: optionalString(STRING_FIELD_MAX_LENGTH),
    sizeBytes: z
        .union([
            z.number().int().nonnegative(),
            z.string().transform((s) => (s === '' ? undefined : Number(s))),
        ])
        .optional()
        .refine((v) => v === undefined || (typeof v === 'number' && !Number.isNaN(v) && v >= 0), {
            message: 'Must be a non-negative number',
        }),
    createdBy: optionalString(STRING_FIELD_MAX_LENGTH),
});

export type AddDocumentFormValues = z.infer<typeof schema>;

interface AddDocumentFormProps {
    defaultFolderId: number | null;
    onSubmit: (values: AddDocumentFormValues) => Promise<void>;
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
        formState: {errors, isSubmitting},
        reset,
    } = useForm<AddDocumentFormValues>({
        resolver: zodResolver(schema),
        defaultValues: {
            title: '',
            folderId: defaultFolderId,
            description: '',
            fileName: '',
            mimeType: '',
            sizeBytes: undefined,
            createdBy: ''
        },
    });

    useEffect(() => {
        if (isOpen)
            reset({
                title: '',
                folderId: defaultFolderId,
                description: '',
                fileName: '',
                mimeType: '',
                sizeBytes: undefined,
            });
    }, [isOpen, defaultFolderId, reset]);

    if (!isOpen) return null;

    const doSubmit = async (values: AddDocumentFormValues) => {
        const folderId =
            values.folderId !== undefined && values.folderId !== null && !Number.isNaN(values.folderId)
                ? values.folderId
                : null;
        await onSubmit({
            title: values.title.trim(),
            folderId,
            description: values.description?.trim() || undefined,
            fileName: values.fileName?.trim() || undefined,
            mimeType: values.mimeType?.trim() || undefined,
            sizeBytes:
                values.sizeBytes !== undefined ? Number(values.sizeBytes) : undefined,
            createdBy: values.createdBy,
        });
        reset();
    };

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
            role="dialog"
            aria-modal="true"
            aria-labelledby="add-document-title"
        >
            <div
                className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl dark:bg-zinc-900"
                onClick={(e) => e.stopPropagation()}
            >
                <h2
                    id="add-document-title"
                    className="text-lg font-semibold text-zinc-900 dark:text-zinc-100"
                >
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
                        <label
                            htmlFor="doc-title"
                            className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300"
                        >
                            Title
                        </label>
                        <input
                            id="doc-title"
                            type="text"
                            autoFocus
                            maxLength={TITLE_MAX_LENGTH}
                            {...register('title')}
                            className="w-full rounded border border-zinc-300 bg-white px-3 py-2 text-zinc-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100"
                            placeholder="Document title"
                            aria-invalid={!!errors.title}
                        />
                        {errors.title && (
                            <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.title.message}</p>
                        )}
                    </div>
                    <div>
                        <label
                            htmlFor="doc-description"
                            className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300"
                        >
                            Description (optional)
                        </label>
                        <textarea
                            id="doc-description"
                            rows={2}
                            maxLength={STRING_FIELD_MAX_LENGTH}
                            {...register('description')}
                            className="w-full rounded border border-zinc-300 bg-white px-3 py-2 text-zinc-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100"
                            placeholder="Description"
                            aria-invalid={!!errors.description}
                        />
                        {errors.description && (
                            <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.description.message}</p>
                        )}
                    </div>
                    <div>
                        <label
                            htmlFor="doc-filename"
                            className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300"
                        >
                            File name (optional)
                        </label>
                        <input
                            id="doc-filename"
                            type="text"
                            maxLength={STRING_FIELD_MAX_LENGTH}
                            {...register('fileName')}
                            className="w-full rounded border border-zinc-300 bg-white px-3 py-2 text-zinc-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100"
                            placeholder="e.g. report.pdf"
                            aria-invalid={!!errors.fileName}
                        />
                        {errors.fileName && (
                            <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.fileName.message}</p>
                        )}
                    </div>
                    <div>
                        <label
                            htmlFor="doc-createdBy"
                            className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300"
                        >
                            Created By (optional)
                        </label>
                        <input
                            id="doc-createdBy"
                            type="text"
                            maxLength={STRING_FIELD_MAX_LENGTH}
                            {...register('createdBy')}
                            className="w-full rounded border border-zinc-300 bg-white px-3 py-2 text-zinc-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100"
                            placeholder="e.g. John Green"
                            aria-invalid={!!errors.createdBy}
                        />
                        {errors.createdBy && (
                            <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.createdBy.message}</p>
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
                            {isSubmitting ? 'Creating…' : 'Create document'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
