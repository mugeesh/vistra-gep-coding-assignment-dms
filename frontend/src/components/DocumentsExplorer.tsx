'use client';

import { useCallback, useEffect, useState } from 'react';
import type { ListItem, ItemsSortBy } from '@/types/api';
import {
    createDocument,
    createFolder,
    deleteDocument,
    deleteFolder,
    getItems,
    updateDocument,
    updateFolder,
} from '@/lib/api';
import type { AddDocumentFormValues } from './AddDocumentForm';
import type { AddFolderFormValues } from './AddFolderForm';
import { AddDocumentForm } from './AddDocumentForm';
import { AddFolderForm } from './AddFolderForm';
import { RenameModal } from './RenameModal';

interface BreadcrumbItem {
    id: number | null;
    name: string;
}

interface HistoryEntry {
    parentId: number | null;
    breadcrumb: BreadcrumbItem[];
}

const PAGE_SIZE_OPTIONS = [5, 10, 25, 50];
const SORT_OPTIONS: { value: ItemsSortBy; label: string }[] = [
    { value: 'name', label: 'Name' },
    { value: 'createdAt', label: 'Date created' },
    { value: 'size', label: 'File size' },
    { value: 'type', label: 'File type' },
];

function formatFileSize(bytes: number | null): string {
    if (bytes == null || bytes === 0) return '—';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatDate(iso: string): string {
    try {
        const d = new Date(iso);
        return d.toLocaleDateString('en-GB', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
        });
    } catch {
        return '—';
    }
}

function getItemName(item: ListItem): string {
    if (item.kind === 'folder') return item.name;
    return item.title || item.fileName || 'Untitled';
}

export function DocumentsExplorer() {
    const [history, setHistory] = useState<HistoryEntry[]>([
        { parentId: null, breadcrumb: [{ id: null, name: 'Root' }] },
    ]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [data, setData] = useState<{
        items: ListItem[];
        total: number;
        page: number;
        pageSize: number;
        totalPages: number;
    }>({ items: [], total: 0, page: 1, pageSize: 10, totalPages: 1 });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [folderModalOpen, setFolderModalOpen] = useState(false);
    const [documentModalOpen, setDocumentModalOpen] = useState(false);
    const [search, setSearch] = useState('');
    const [searchDebounced, setSearchDebounced] = useState('');
    const [globalSearch, setGlobalSearch] = useState(false);
    const [sortBy, setSortBy] = useState<ItemsSortBy>('name');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
    const [pageSize, setPageSize] = useState(10);
    const [page, setPage] = useState(1);
    const [deleteConfirm, setDeleteConfirm] = useState<{
        kind: 'folder' | 'document';
        id: number;
        name: string;
    } | null>(null);
    const [renameModal, setRenameModal] = useState<{
        kind: 'folder' | 'document';
        id: number;
        name: string;
    } | null>(null);

    const currentParentId = history[currentIndex]?.parentId ?? null;
    const breadcrumb = history[currentIndex]?.breadcrumb ?? [{ id: null, name: 'Root' }];

    useEffect(() => {
        const timer = setTimeout(() => setSearchDebounced(search.trim()), 400);
        return () => clearTimeout(timer);
    }, [search]);

    const loadItems = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const result = await getItems({
                parentId: currentParentId,
                page,
                pageSize,
                sortBy,
                sortOrder,
                search: searchDebounced || undefined,
                globalSearch: globalSearch && !!searchDebounced ? true : undefined,
            });
            setData(result);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load items');
        } finally {
            setLoading(false);
        }
    }, [currentParentId, page, pageSize, sortBy, sortOrder, searchDebounced, globalSearch]);

    useEffect(() => {
        loadItems();
    }, [loadItems]);

    const navigateToFolder = (folderId: number, folderName: string) => {
        const newBreadcrumb = [...breadcrumb, { id: folderId, name: folderName }];
        setHistory((prev) => [...prev.slice(0, currentIndex + 1), { parentId: folderId, breadcrumb: newBreadcrumb }]);
        setCurrentIndex((prev) => prev + 1);
        setPage(1);
    };

    const handleCreateFolder = async (values: AddFolderFormValues) => {
        await createFolder({
            name: values.name.trim(),
            parentId: currentParentId,
        });
        setFolderModalOpen(false);
        loadItems();
    };

    const handleCreateDocument = async (values: AddDocumentFormValues) => {
        await createDocument({
            title: values.title.trim(),
            folderId: currentParentId,
            description: values.description?.trim(),
            fileName: values.fileName?.trim() || `${values.title.trim()}.pdf`,
            mimeType: values.mimeType?.trim() || 'application/pdf',
            sizeBytes: values.sizeBytes || 1024 * 42,
        });
        setDocumentModalOpen(false);
        loadItems();
    };

    const handleRename = async (value: string) => {
        if (!renameModal) return;
        try {
            if (renameModal.kind === 'folder') {
                await updateFolder(renameModal.id, { name: value.trim() });
            } else {
                await updateDocument(renameModal.id, { title: value.trim() });
            }
            setRenameModal(null);
            loadItems();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to rename');
        }
    };

    const handleDelete = async () => {
        if (!deleteConfirm) return;
        try {
            if (deleteConfirm.kind === 'folder') {
                await deleteFolder(deleteConfirm.id);
            } else {
                await deleteDocument(deleteConfirm.id);
            }
            setDeleteConfirm(null);
            loadItems();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to delete');
        }
    };

    const canGoBack = currentIndex > 0;
    const canGoForward = currentIndex < history.length - 1;

    return (
        <div className="flex min-h-screen flex-col bg-gray-50 dark:bg-gray-950">
            {/* Header */}
            <header className="border-b bg-white px-6 py-4 dark:border-gray-800 dark:bg-gray-900">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Documents</h1>
                    <div className="flex gap-4">
                        <button
                            onClick={() => setDocumentModalOpen(true)}
                            className="flex items-center gap-2 rounded bg-purple-600 px-4 py-2 text-sm font-medium text-white hover:bg-purple-700"
                        >
                            Upload files
                        </button>
                        <button
                            onClick={() => setFolderModalOpen(true)}
                            className="flex items-center gap-2 rounded bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
                        >
                            + Add new folder
                        </button>
                    </div>
                </div>

                {/* Breadcrumb + controls */}
                <div className="mt-4 flex flex-wrap items-center justify-between gap-4">
                    {/* Left side controls */}
                    <div className="flex flex-wrap items-center gap-4">
                        <input
                            type="search"
                            placeholder="Search..."
                            value={search}
                            onChange={(e) => {
                                setSearch(e.target.value);
                                setPage(1);
                            }}
                            className="w-64 rounded border border-gray-300 bg-white px-4 py-2 text-sm dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
                        />

                        <label className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                            <input
                                type="checkbox"
                                checked={globalSearch}
                                onChange={(e) => {
                                    setGlobalSearch(e.target.checked);
                                    setPage(1);
                                }}
                                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            />
                            Search in all folders
                        </label>

                        <label className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                            Sort by
                            <select
                                value={sortBy}
                                onChange={(e) => {
                                    setSortBy(e.target.value as ItemsSortBy);
                                    setPage(1);
                                }}
                                className="rounded border border-gray-300 bg-white px-3 py-1.5 text-sm dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
                            >
                                {SORT_OPTIONS.map((opt) => (
                                    <option key={opt.value} value={opt.value}>
                                        {opt.label}
                                    </option>
                                ))}
                            </select>
                        </label>

                        <button
                            onClick={() => {
                                setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'));
                                setPage(1);
                            }}
                            className="rounded border border-gray-300 bg-white px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300"
                        >
                            {sortOrder === 'asc' ? '↑ Asc' : '↓ Desc'}
                        </button>
                    </div>

                    {/* Right side pagination */}
                    <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
            <span>
              Showing {(data.page - 1) * data.pageSize + 1}–
                {Math.min(data.page * data.pageSize, data.total)} of {data.total}
            </span>

                        <label className="flex items-center gap-2">
                            Show
                            <select
                                value={pageSize}
                                onChange={(e) => {
                                    setPageSize(Number(e.target.value));
                                    setPage(1);
                                }}
                                className="rounded border border-gray-300 bg-white px-3 py-1.5 text-sm dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
                            >
                                {PAGE_SIZE_OPTIONS.map((size) => (
                                    <option key={size} value={size}>
                                        {size}
                                    </option>
                                ))}
                            </select>
                            per page
                        </label>

                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setPage((p) => Math.max(1, p - 1))}
                                disabled={page <= 1}
                                className="rounded border border-gray-300 px-3 py-1.5 disabled:opacity-50 dark:border-gray-700 dark:bg-gray-800"
                            >
                                Previous
                            </button>
                            <span className="px-2">
                {page} / {data.totalPages || 1}
              </span>
                            <button
                                onClick={() => setPage((p) => Math.min(data.totalPages || 1, p + 1))}
                                disabled={page >= data.totalPages}
                                className="rounded border border-gray-300 px-3 py-1.5 disabled:opacity-50 dark:border-gray-700 dark:bg-gray-800"
                            >
                                Next
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            {/* Main content */}
            <main className="flex-1 overflow-auto p-6">
                {error && (
                    <div className="mb-4 rounded bg-red-100 p-3 text-red-800 dark:bg-red-900/30 dark:text-red-200">
                        {error}
                    </div>
                )}

                {loading ? (
                    <div className="flex h-64 items-center justify-center text-gray-500 dark:text-gray-400">
                        Loading...
                    </div>
                ) : data.items.length === 0 ? (
                    <div className="py-16 text-center text-gray-500 dark:text-gray-400">
                        No items found
                    </div>
                ) : (
                    <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700">
                        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                            <thead className="bg-blue-700 text-white">
                            <tr>
                                <th className="w-10 px-6 py-4 text-left font-medium">Name</th>
                                <th className="px-6 py-4 text-left font-medium">Created by</th>
                                <th className="px-6 py-4 text-left font-medium">Date</th>
                                <th className="px-6 py-4 text-left font-medium">File size</th>
                                <th className="w-24 px-6 py-4"></th>
                            </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 bg-white dark:divide-gray-700 dark:bg-gray-900">
                            {data.items.map((item) => (
                                <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            {item.kind === 'folder' ? (
                                                <span className="text-2xl">📁</span>
                                            ) : (
                                                <span className="text-2xl">📄</span>
                                            )}
                                            {item.kind === 'folder' ? (
                                                <button
                                                    onClick={() => navigateToFolder(item.id, item.name)}
                                                    className="font-medium text-blue-600 hover:underline dark:text-blue-400"
                                                >
                                                    {item.name}
                                                </button>
                                            ) : (
                                                <span className="font-medium text-gray-900 dark:text-gray-100">
                            {getItemName(item)}
                          </span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300">
                                        John Green
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300">
                                        {formatDate(item.createdAt)}
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300">
                                        {item.kind === 'folder' ? '—' : formatFileSize(item.sizeBytes)}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex justify-end gap-2">
                                            <button
                                                onClick={() =>
                                                    setRenameModal({
                                                        kind: item.kind,
                                                        id: item.id,
                                                        name: getItemName(item),
                                                    })
                                                }
                                                className="rounded p-1.5 text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
                                                title="Rename"
                                            >
                                                ✏️
                                            </button>
                                            <button
                                                onClick={() =>
                                                    setDeleteConfirm({
                                                        kind: item.kind,
                                                        id: item.id,
                                                        name: getItemName(item),
                                                    })
                                                }
                                                className="rounded p-1.5 text-gray-500 hover:bg-red-50 dark:text-gray-400 dark:hover:bg-red-900/30"
                                                title="Delete"
                                            >
                                                🗑️
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </main>

            {/* Modals */}
            <AddFolderForm
                defaultParentId={currentParentId}
                isOpen={folderModalOpen}
                onCancel={() => setFolderModalOpen(false)}
                onSubmit={handleCreateFolder}
            />

            <AddDocumentForm
                defaultFolderId={currentParentId}
                isOpen={documentModalOpen}
                onCancel={() => setDocumentModalOpen(false)}
                onSubmit={handleCreateDocument}
            />

            {renameModal && (
                <RenameModal
                    isOpen={true}
                    kind={renameModal.kind}
                    currentName={renameModal.name}
                    onCancel={() => setRenameModal(null)}
                    onSave={handleRename}
                />
            )}

            {deleteConfirm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
                    <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-2xl dark:bg-gray-900">
                        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                            Delete {deleteConfirm.kind}?
                        </h2>
                        <p className="mt-2 text-gray-600 dark:text-gray-300">
                            Are you sure you want to delete "{deleteConfirm.name}"? This cannot be undone.
                        </p>
                        <div className="mt-6 flex justify-end gap-3">
                            <button
                                onClick={() => setDeleteConfirm(null)}
                                className="rounded px-4 py-2 text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleDelete}
                                className="rounded bg-red-600 px-4 py-2 text-white hover:bg-red-700"
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
