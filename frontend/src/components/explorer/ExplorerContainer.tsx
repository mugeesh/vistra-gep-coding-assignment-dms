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
} from '@/lib/api-client';
import type {AddDocumentFormValues} from '@/components';
import type {AddFolderFormValues} from '@/components';
import {AddDocumentForm} from '@/components';
import {AddFolderForm} from '@/components';
import {RenameModal} from '../ui/RenameModal';
import {Pagination} from "@/components/explorer/Pagination";
import {DocumentsTable} from "@/components/explorer/DocumentsTable";

interface BreadcrumbItem {
    id: number | null;
    name: string;
}

interface HistoryEntry {
    parentId: number | null;
    breadcrumb: BreadcrumbItem[];
}

export function ExplorerContainer() {
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
        setSelectedIds([]);
    }, [currentParentId, sortBy, sortOrder, pageSize, searchDebounced, globalSearch]);

    const loadItems = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const result = await getItems({
                parentId: currentParentId,
                page, // This uses the 'page' state
                pageSize, // This MUST use the 'pageSize' state
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
        let isMounted = true;
        const executeLoad = async () => {
            try {
                await loadItems();
                if (isMounted) {
                    setSelectedIds([]);
                }
            } catch (err) {
                if (isMounted) console.error("Load error:", err);
            }
        };
        executeLoad();
        return () => {
            isMounted = false;
        };
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

    // Inside ExplorerContainer component
    const [selectedIds, setSelectedIds] = useState<number[]>([]);


    // Generate page numbers for pagination
    const pageNumbers = [];
    for (let i = 1; i <= data.totalPages; i++) {
        pageNumbers.push(i);
    }

    const handleToggleSort = (field: ItemsSortBy) => {
        setSortOrder(sortBy === field && sortOrder === 'asc' ? 'desc' : 'asc');
        setSortBy(field);
    };

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
                        <input id="search"
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

                <div className="mb-4 text-sm text-gray-600 flex justify-end">
                    {breadcrumb.map((crumb, idx) => (
                        <span key={crumb.id ?? 'root'}>
            {idx > 0 && <span className="mx-1.5 text-gray-400">/</span>}
                            <button
                                onClick={() => goToHistoryIndex(idx)}
                                className={`hover:underline transition-colors ${
                                    idx === currentIndex ? 'font-bold text-gray-900' : 'text-blue-600'
                                }`}
                            >
                {crumb.name}
            </button>
        </span>
                    ))}
                </div>
                {loading ? (
                    <div className="flex h-64 items-center justify-center text-gray-500">Loading...</div>
                ) : (
                    <>
                        <DocumentsTable
                            items={data.items}
                            selectedIds={selectedIds}
                            sortBy={sortBy}
                            sortOrder={sortOrder}
                            onToggleSort={handleToggleSort}
                            onSelectRow={(id) => setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id])}
                            onSelectAll={() => setSelectedIds(selectedIds.length === data.items.length ? [] : data.items.map(i => i.id))}
                            onNavigate={navigateToFolder}
                            onRename={(item) => setRenameModal({
                                kind: item.kind,
                                id: item.id,
                                name: item.kind === 'folder' ? item.name : (item.title || 'Untitled')
                            })}
                            onDelete={(item) => setDeleteConfirm({
                                kind: item.kind,
                                id: item.id,
                                name: item.kind === 'folder' ? item.name : (item.title || 'Untitled')
                            })}
                        />
                        <Pagination
                            currentPage={page}
                            totalPages={data.totalPages}
                            pageSize={pageSize} // Pass the state
                            totalItems={data.total}
                            itemsOnPage={data.items.length}
                            onPageChange={(p) => setPage(p)}
                            onPageSizeChange={(s) => {
                                setPageSize(s);
                                setPage(1);
                            }}
                        />
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
