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

    // Debounce search
    useEffect(() => {
        const timer = setTimeout(() => setSearchDebounced(search.trim()), 400);
        return () => clearTimeout(timer);
    }, [search]);

    // Reset page when filters/sort/parent changes
    useEffect(() => {
        setPage(1);
    }, [currentParentId, sortBy, sortOrder, pageSize, searchDebounced, globalSearch]);

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
    };

    const goToHistoryIndex = (targetIndex: number) => {
        if (targetIndex < 0 || targetIndex >= history.length) return;
        setCurrentIndex(targetIndex);
    };

    const handleCreateFolder = async (values: AddFolderFormValues) => {
        await createFolder({
            name: values.name.trim(),
            parentId: currentParentId,
            createdBy: values.createdBy.trim(),
        });
        setFolderModalOpen(false);
        await loadItems();
    };

    const handleCreateDocument = async (values: AddDocumentFormValues) => {
        await createDocument({
            title: values.title.trim(),
            folderId: currentParentId,
            description: values.description?.trim(),
            fileName: values.fileName?.trim() || `${values.title.trim()}.pdf`,
            mimeType: values.mimeType?.trim() || 'application/pdf',
            sizeBytes: values.sizeBytes,           // now allowed to be undefined
            createdBy: values.createdBy?.trim() ?? '—',
        });
        setDocumentModalOpen(false);
        await loadItems();
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
            await loadItems();
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
            await loadItems();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to delete');
        }
    };

    const toggleSort = (field: ItemsSortBy) => {
        if (sortBy === field) {
            setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
        } else {
            setSortBy(field);
            setSortOrder('asc');
        }
    };

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

                {/* Navigation + Breadcrumb + Filters */}
                <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    {/* Left: Navigation + Breadcrumb */}
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-6">
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => goToHistoryIndex(currentIndex - 1)}
                                disabled={currentIndex <= 0}
                                className="flex h-9 w-9 items-center justify-center rounded border disabled:opacity-50 dark:border-gray-700"
                            >
                                ←
                            </button>
                            <button
                                onClick={() => goToHistoryIndex(currentIndex + 1)}
                                disabled={currentIndex >= history.length - 1}
                                className="flex h-9 w-9 items-center justify-center rounded border disabled:opacity-50 dark:border-gray-700"
                            >
                                →
                            </button>
                            <button
                                onClick={() => goToHistoryIndex(0)}
                                disabled={currentIndex === 0}
                                className="flex h-9 w-9 items-center justify-center rounded border disabled:opacity-50 dark:border-gray-700"
                            >
                                🏠
                            </button>
                        </div>

                        <div className="flex min-w-0 flex-1 items-center gap-1.5 overflow-x-auto text-sm">
                            {breadcrumb.map((crumb, idx) => (
                                <span key={crumb.id ?? 'root'} className="flex items-center">
                  {idx > 0 && <span className="mx-1.5 text-gray-400">/</span>}
                                    <button
                                        onClick={() => goToHistoryIndex(idx)}
                                        className={`hover:underline ${
                                            idx === currentIndex ? 'font-semibold' : 'text-blue-600 dark:text-blue-400'
                                        }`}
                                    >
                    {crumb.name}
                  </button>
                </span>
                            ))}
                        </div>
                    </div>

                    {/* Right: Search + filters */}
                    <div className="flex flex-wrap items-center gap-4">
                        <div className="relative min-w-[220px] flex-1">
                            <input
                                type="text"
                                placeholder="Search documents..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="w-full rounded-lg border px-4 py-2 pl-10 text-sm focus:border-blue-500 focus:ring-1 dark:border-gray-700 dark:bg-gray-800"
                            />
                            <svg className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </div>

                        <label className="flex items-center gap-2 text-sm">
                            <input
                                type="checkbox"
                                checked={globalSearch}
                                onChange={(e) => setGlobalSearch(e.target.checked)}
                                className="h-4 w-4 rounded border-gray-300 text-blue-600"
                            />
                            Search all folders
                        </label>
                    </div>
                </div>
            </header>

            {/* Main content */}
            <main className="flex-1 overflow-hidden p-6">
                {error && (
                    <div className="mb-4 rounded bg-red-100 p-4 text-red-800 dark:bg-red-900/30 dark:text-red-200">
                        {error}
                    </div>
                )}

                {loading ? (
                    <div className="flex h-64 items-center justify-center text-gray-500">Loading...</div>
                ) : data.items.length === 0 ? (
                    <div className="py-16 text-center text-gray-500 dark:text-gray-400">
                        No items found in this folder
                    </div>
                ) : (
                    <>
                        <div className="mb-4 flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
                            <div>
                                Showing <strong>{data.items.length}</strong> of <strong>{data.total}</strong> items
                            </div>
                            <div className="flex items-center gap-3">
                                <label className="flex items-center gap-2">
                                    Show:
                                    <select
                                        value={pageSize}
                                        onChange={(e) => setPageSize(Number(e.target.value))}
                                        className="rounded border px-2 py-1 dark:border-gray-700 dark:bg-gray-800"
                                    >
                                        {PAGE_SIZE_OPTIONS.map((size) => (
                                            <option key={size} value={size}>
                                                {size}
                                            </option>
                                        ))}
                                    </select>
                                </label>
                            </div>
                        </div>

                        <div className="overflow-auto rounded-lg border dark:border-gray-700">
                            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                <thead className="bg-blue-700 text-white">
                                <tr>
                                    <th
                                        className="cursor-pointer px-6 py-4 text-left font-medium hover:bg-blue-800"
                                        onClick={() => toggleSort('name')}
                                    >
                                        Name {sortBy === 'name' && (sortOrder === 'asc' ? '↑' : '↓')}
                                    </th>
                                    <th className="px-6 py-4 text-left font-medium">Created by</th>
                                    <th
                                        className="cursor-pointer px-6 py-4 text-left font-medium hover:bg-blue-800"
                                        onClick={() => toggleSort('createdAt')}
                                    >
                                        Date {sortBy === 'createdAt' && (sortOrder === 'asc' ? '↑' : '↓')}
                                    </th>
                                    <th
                                        className="cursor-pointer px-6 py-4 text-left font-medium hover:bg-blue-800"
                                        onClick={() => toggleSort('size')}
                                    >
                                        File size {sortBy === 'size' && (sortOrder === 'asc' ? '↑' : '↓')}
                                    </th>
                                    <th className="w-32 px-6 py-4 text-right font-medium">Actions</th>
                                </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200 bg-white dark:divide-gray-700 dark:bg-gray-900">
                                {data.items.map((item) => (
                                    <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                {item.kind === 'folder' ? <span className="text-2xl">📁</span> : <span className="text-2xl">📄</span>}
                                                {item.kind === 'folder' ? (
                                                    <button
                                                        onClick={() => navigateToFolder(item.id, item.name)}
                                                        className="font-medium text-blue-600 hover:underline dark:text-blue-400"
                                                    >
                                                        {item.name}
                                                    </button>
                                                ) : (
                                                    <span className="font-medium text-gray-900 dark:text-gray-100">{getItemName(item)}</span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300">
                                            {item.createdBy || '—'}
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

                        {/* Pagination */}
                        {data.totalPages > 1 && (
                            <div className="mt-6 flex items-center justify-between text-sm">
                                <button
                                    disabled={page === 1 || loading}
                                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                                    className="rounded border px-4 py-2 disabled:opacity-50 dark:border-gray-700"
                                >
                                    Previous
                                </button>

                                <span>
                  Page <strong>{page}</strong> of <strong>{data.totalPages}</strong>
                </span>

                                <button
                                    disabled={page === data.totalPages || loading}
                                    onClick={() => setPage((p) => p + 1)}
                                    className="rounded border px-4 py-2 disabled:opacity-50 dark:border-gray-700"
                                >
                                    Next
                                </button>
                            </div>
                        )}
                    </>
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
                        <h2 className="text-xl font-semibold">
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
