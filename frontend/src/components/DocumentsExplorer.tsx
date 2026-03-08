'use client';

import {useCallback, useEffect, useState} from 'react';
import type {ListItem, ItemsSortBy} from '@/types/api';
import {
    createDocument,
    createFolder,
    deleteDocument,
    deleteFolder,
    getItems,
    updateDocument,
    updateFolder,
} from '@/lib/api';
import type {AddDocumentFormValues} from './AddDocumentForm';
import type {AddFolderFormValues} from './AddFolderForm';
import {AddDocumentForm} from './AddDocumentForm';
import {AddFolderForm} from './AddFolderForm';
import {RenameModal} from './RenameModal';

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
        {parentId: null, breadcrumb: [{id: null, name: 'Root'}]},
    ]);
    const [currentIndex, setCurrentIndex] = useState(0);

    const [data, setData] = useState<{
        items: ListItem[];
        total: number;
        page: number;
        pageSize: number;
        totalPages: number;
    }>({items: [], total: 0, page: 1, pageSize: 10, totalPages: 1});

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [folderModalOpen, setFolderModalOpen] = useState(false);
    const [documentModalOpen, setDocumentModalOpen] = useState(false);

    const [search, setSearch] = useState('');
    const [searchDebounced, setSearchDebounced] = useState('');
    const [globalSearch, setGlobalSearch] = useState(false);

    const [sortBy, setSortBy] = useState<ItemsSortBy>('name');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
    const [pageSize, setPageSize] = useState(5);
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
    const breadcrumb = history[currentIndex]?.breadcrumb ?? [{id: null, name: 'Root'}];

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
        const newBreadcrumb = [...breadcrumb, {id: folderId, name: folderName}];
        setHistory((prev) => [...prev.slice(0, currentIndex + 1), {parentId: folderId, breadcrumb: newBreadcrumb}]);
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
            sizeBytes: values.sizeBytes,
            createdBy: values.createdBy?.trim() ?? '—',
        });
        setDocumentModalOpen(false);
        await loadItems();
    };

    const handleRename = async (value: string) => {
        if (!renameModal) return;
        try {
            if (renameModal.kind === 'folder') {
                await updateFolder(renameModal.id, {name: value.trim()});
            } else {
                await updateDocument(renameModal.id, {title: value.trim()});
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

    //checkbox

    // Inside DocumentsExplorer component
    const [selectedIds, setSelectedIds] = useState<number[]>([]);

// Toggle all rows in the current folder view
    const toggleSelectAll = () => {
        if (selectedIds.length === data.items.length && data.items.length > 0) {
            setSelectedIds([]);
        } else {
            setSelectedIds(data.items.map(item => item.id));
        }
    };

// Toggle a single document or folder row
    const toggleSelectRow = (id: number) => {
        setSelectedIds(prev =>
            prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
        );
    };

// Visual helpers for the header checkbox
    const isAllSelected = data.items.length > 0 && selectedIds.length === data.items.length;
    const isIndeterminate = selectedIds.length > 0 && selectedIds.length < data.items.length;

    // Generate page numbers for pagination
    const pageNumbers = [];
    for (let i = 1; i <= data.totalPages; i++) {
        pageNumbers.push(i);
    }

    return (
        <div className="flex min-h-screen flex-col bg-white">
            <header className="border-b bg-white px-6 py-4">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-bold text-gray-900">Documents</h1>
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

                <div className="mt-4 flex items-center gap-4">
                    <div className="relative w-64">
                        <input
                            type="text"
                            placeholder="Search..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full rounded-lg border border-gray-300 px-4 py-2 pr-10 text-sm
                   focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none
                   transition-colors duration-200"
                        />
                        <svg
                            className="absolute right-3 top-1/2 h-5 w-5 -translate-y-1/2 text-blue-600 pointer-events-none"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                            />
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
            </header>

            <main className="flex-1 overflow-hidden p-6">
                {error && (
                    <div className="mb-4 rounded bg-red-100 p-4 text-red-800">
                        {error}
                    </div>
                )}

                {loading ? (
                    <div className="flex h-64 items-center justify-center text-gray-500">Loading...</div>
                ) : data.items.length === 0 ? (
                    <div className="py-16 text-center text-gray-500 space-y-6">
                        <p className="text-lg">No items found in this folder</p>

                        {breadcrumb.length > 1 ? (
                            <button
                                onClick={() => goToHistoryIndex(currentIndex - 1)}
                                className="inline-flex items-center gap-2 rounded-lg bg-blue-50 px-5 py-2.5 text-blue-700 hover:bg-blue-100 hover:text-blue-800 font-medium transition-colors"
                            >
                                ← Up to {breadcrumb[breadcrumb.length - 2].name}
                            </button>
                        ) : (
                            <button
                                onClick={() => goToHistoryIndex(0)}
                                className="inline-flex items-center gap-2 rounded-lg bg-blue-50 px-5 py-2.5 text-blue-700 hover:bg-blue-100 hover:text-blue-800 font-medium transition-colors"
                            >
                                ← Back to Root
                            </button>
                        )}
                    </div>
                ) : (
                    <>
                        <div className="mb-4 flex items-center justify-between text-sm text-gray-600">
                            <div>
                                Showing <strong>{data.items.length}</strong> of <strong>{data.total}</strong> items
                            </div>
                        </div>
                        {/* Breadcraumb */}
                        <div className="mb-4 text-sm text-gray-600 flex justify-end">
                            {breadcrumb.map((crumb, idx) => (
                                <span key={crumb.id ?? 'root'}>
                                    {idx > 0 && <span className="mx-1.5 text-gray-400">/</span>}
                                    <button
                                        onClick={() => goToHistoryIndex(idx)}
                                        className="hover:underline font-medium"
                                    >
                                        {crumb.name}
                                    </button>
                                </span>
                            ))}
                        </div>
                        <div className="overflow-auto rounded-lg border">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-[#00144d] text-white">
                                <tr>
                                    <th className="px-6 py-4 text-left w-10">
                                        <div
                                            className="relative flex items-center justify-center cursor-pointer h-5 w-5 rounded border border-gray-400 bg-white"
                                            onClick={toggleSelectAll}
                                        >
                                            {isIndeterminate && (
                                                <div className="w-2.5 h-0.5 bg-[#00144d] rounded-sm"></div>
                                            )}

                                            {isAllSelected && (
                                                <svg className="w-3.5 h-3.5 text-[#00144d]" fill="currentColor" viewBox="0 0 20 20">
                                                    <path d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"/>
                                                </svg>
                                            )}
                                        </div>
                                    </th>
                                    <th
                                        className="cursor-pointer px-6 py-4 text-left font-medium group"
                                        onClick={() => toggleSort('name')}
                                    >
                                        <div className="flex items-center gap-1">
                                            Name
                                            <span className={`transition-colors ${sortBy === 'name' ? 'text-white' : 'text-gray-400 group-hover:text-white'}`}>
                                                    <svg className={`w-4 h-4 ${sortBy === 'name' && sortOrder === 'desc' ? 'rotate-180' : ''}`}
                                                        fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                                        d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12"/></svg>
                                            </span>
                                        </div>
                                    </th>
                                    <th className="px-6 py-4 text-left font-medium">Created by</th>
                                    <th
                                        className="cursor-pointer px-6 py-4 text-left font-medium group"
                                        onClick={() => toggleSort('createdAt')}
                                    >
                                        <div className="flex items-center gap-1">
                                            Date
                                            <span className="text-gray-400 group-hover:text-white transition-colors">
                                                <svg
                                                    className={`w-4 h-4 transition-transform ${sortBy === 'createdAt' && sortOrder === 'desc' ? 'rotate-180' : ''}`}
                                                    fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                                          d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12"/>
                                                </svg>
                                            </span>
                                        </div>
                                    </th>
                                    <th className="px-6 py-4 text-left font-medium">File size</th>
                                    <th className="px-6 py-4 text-left font-medium"></th>
                                </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200 bg-white">
                                {data.items.map((item) => (
                                    <tr key={item.id}
                                        className={`hover:bg-gray-50 ${selectedIds.includes(item.id) ? 'bg-blue-50/50' : ''}`}>
                                        <td className="px-6 py-4">
                                            <input
                                                type="checkbox"
                                                checked={selectedIds.includes(item.id)}
                                                onChange={() => toggleSelectRow(item.id)}
                                                className="h-4 w-4 rounded border-gray-300 accent-[#00144d] cursor-pointer"
                                            />
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                {item.kind === 'folder' ? (
                                                    /* Folder Icon  */
                                                    <svg className="w-6 h-6 text-orange-200" fill="currentColor"
                                                         viewBox="0 0 20 20">
                                                        <path
                                                            d="M2 6a2 2 0 012-2h5l2 2h5a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V6z"/>
                                                    </svg>
                                                ) : (
                                                    /* Document Icon */
                                                    <svg className="w-6 h-6 text-blue-400" fill="none"
                                                         stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round"
                                                              strokeWidth={2}
                                                              d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"/>
                                                    </svg>
                                                )}
                                                {item.kind === 'folder' ? (
                                                    <button onClick={() => navigateToFolder(item.id, item.name)}
                                                            className="font-medium text-gray-900 hover:text-blue-600">
                                                        {item.name}
                                                    </button>
                                                ) : (
                                                    <span
                                                        className="font-medium text-gray-900">{getItemName(item)}</span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-600">
                                            {item.createdBy || '—'}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-600">
                                            {formatDate(item.createdAt)}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-600">
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
                                                    className="rounded p-1.5 text-gray-500 hover:bg-gray-100"
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
                                                    className="rounded p-1.5 text-gray-500 hover:bg-red-50"
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

                        {data.totalPages > 1 && (
                            <div className="mt-6 flex items-center justify-between text-sm">
                                <label className="flex items-center gap-2">
                                    Show:
                                    <select
                                        value={pageSize}
                                        onChange={(e) => setPageSize(Number(e.target.value))}
                                        className="rounded border px-2 py-1"
                                    >
                                        {PAGE_SIZE_OPTIONS.map((size) => (
                                            <option key={size} value={size}>
                                                {size}
                                            </option>
                                        ))}
                                    </select>
                                    rows per page
                                </label>
                                <div className="flex gap-1">
                                    {page > 1 && (
                                        <button
                                            onClick={() => setPage(page - 1)}
                                            disabled={loading}
                                            className="rounded px-3 py-1 border hover:bg-gray-100"
                                        >
                                            &lt;
                                        </button>
                                    )}
                                    {Array.from({length: Math.min(5, data.totalPages)}, (_, i) => {
                                        const startPage = Math.max(1, page - 2);
                                        const num = startPage + i;
                                        if (num > data.totalPages) return null;
                                        return (
                                            <button
                                                key={num}
                                                onClick={() => setPage(num)}
                                                disabled={loading}
                                                className={`rounded px-3 py-1 ${num === page ? 'bg-blue-600 text-white' : 'border hover:bg-gray-100'}`}
                                            >
                                                {num}
                                            </button>
                                        );
                                    })}
                                    {page + 2 < data.totalPages && (
                                        <button
                                            onClick={() => setPage(page + 1)}
                                            disabled={page >= data.totalPages || loading}
                                            className="rounded px-3 py-1 border hover:bg-gray-100"
                                        >
                                            &gt;
                                        </button>
                                    )}
                                </div>
                            </div>
                        )}
                    </>
                )}
            </main>

            {/* Modals - unchanged */}
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
                    <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-2xl">
                        <h2 className="text-xl font-semibold">
                            Delete {deleteConfirm.kind}?
                        </h2>
                        <p className="mt-2 text-gray-600">
                            Are you sure you want to delete "{deleteConfirm.name}"? This cannot be undone.
                        </p>
                        <div className="mt-6 flex justify-end gap-3">
                            <button
                                onClick={() => setDeleteConfirm(null)}
                                className="rounded px-4 py-2 text-gray-700 hover:bg-gray-100"
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
