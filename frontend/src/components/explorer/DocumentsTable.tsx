'use client';

import { useState, useEffect, useRef } from 'react';
import { ListItem, ItemsSortBy } from '@/types/api';
import { IndeterminateCheckbox } from "@/components/ui/IndeterminateCheckbox";
import { sortItems, getItemName } from "@/lib/sorting";

interface DocumentsTableProps {
    items: ListItem[];
    selectedIds: number[];
    sortBy: ItemsSortBy;
    sortOrder: 'asc' | 'desc';
    onToggleSort: (field: ItemsSortBy) => void;
    onSelectRow: (id: number) => void;
    onSelectAll: () => void;
    onNavigate: (id: number, name: string) => void;
    onRename: (item: ListItem) => void;
    onDelete: (item: ListItem) => void;
}

export function formatFileSize(bytes: number | null): string {
    if (bytes == null || bytes === 0) return '—';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function formatDate(iso: string): string {
    try {
        const d = new Date(iso);
        return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
    } catch { return '—'; }
}

export function DocumentsTable({
                                   items,
                                   selectedIds,
                                   sortBy,
                                   sortOrder,
                                   onToggleSort,
                                   onSelectRow,
                                   onSelectAll,
                                   onNavigate,
                                   onRename,
                                   onDelete
                               }: Readonly<DocumentsTableProps>) {
    const isAllSelected = items.length > 0 && selectedIds.length === items.length;
    const isIndeterminate = selectedIds.length > 0 && selectedIds.length < items.length;

    const [openMenuId, setOpenMenuId] = useState<number | null>(null);
    const menuRef = useRef<HTMLDivElement>(null);

    const toggleMenu = (id: number) => {
        setOpenMenuId(prev => prev === id ? null : id);
    };

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node) && openMenuId !== null) {
                setOpenMenuId(null);
            }
        };
        document.addEventListener('mousedown', handleClickOutside); // Use mousedown to capture before click
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [openMenuId]);

    return (
        <div className="overflow-auto rounded-lg border border-gray-200 shadow-sm">
            <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-[#00144d] text-white">
                <tr>
                    <th className="px-6 py-4 text-left w-10">
                        <IndeterminateCheckbox
                            checked={isAllSelected}
                            indeterminate={isIndeterminate}
                            onClick={onSelectAll}
                        />
                    </th>
                    <th className="cursor-pointer px-6 py-4 text-left font-medium group" onClick={() => onToggleSort('name')}>
                        <div className="flex items-center gap-1">
                            Name
                            <span className={`transition-colors ${sortBy === 'name' ? 'text-white' : 'text-gray-400 group-hover:text-white'}`}>
                                <svg className={`w-4 h-4 ${sortBy === 'name' && sortOrder === 'desc' ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12" />
                                </svg>
                            </span>
                        </div>
                    </th>
                    <th className="px-6 py-4 text-left font-medium">Created by</th>
                    <th className="cursor-pointer px-6 py-4 text-left font-medium group" onClick={() => onToggleSort('createdAt')}>
                        <div className="flex items-center gap-1">
                            Date
                            <span className={`transition-colors ${sortBy === 'createdAt' ? 'text-white' : 'text-gray-400 group-hover:text-white'}`}>
                                <svg className={`w-4 h-4 ${sortBy === 'createdAt' && sortOrder === 'desc' ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12" />
                                </svg>
                            </span>
                        </div>
                    </th>
                    <th className="px-6 py-4 text-left font-medium">File size</th>
                    <th className="w-24 px-6 py-4"></th>
                </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">

                {sortItems(items, sortBy, sortOrder).map((item) => (
                    <tr
                        key={`${item.kind}-${item.id}`}
                        className={`hover:bg-gray-50 transition-colors ${selectedIds.includes(item.id) ? 'bg-blue-50/50' : ''}`}
                    >
                        <td className="px-6 py-4">
                            <input
                                type="checkbox"
                                checked={selectedIds.includes(item.id)}
                                onChange={() => onSelectRow(item.id)}
                                className="h-4 w-4 rounded border-gray-300 accent-[#00144d] cursor-pointer"
                            />
                        </td>
                        <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                                {item.kind === 'folder' ? (
                                    <svg className="w-6 h-6 text-orange-200" fill="currentColor" viewBox="0 0 20 20">
                                        <path d="M2 6a2 2 0 012-2h5l2 2h5a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" />
                                    </svg>
                                ) : (
                                    <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                                    </svg>
                                )}
                                {item.kind === 'folder' ? (
                                    <button onClick={() => onNavigate(item.id, item.name)} className="font-medium text-gray-900 hover:text-blue-600">
                                        {item.name}
                                    </button>
                                ) : (
                                    <span className="font-medium text-gray-900">{getItemName(item)}</span>
                                )}
                            </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">{item.createdBy || '—'}</td>
                        <td className="px-6 py-4 text-sm text-gray-600">{formatDate(item.createdAt)}</td>
                        <td className="px-6 py-4 text-sm text-gray-600">{item.kind === 'folder' ? '—' : formatFileSize(item.sizeBytes)}</td>
                        <td className="px-6 py-4 text-right relative">
                            <button
                                onClick={() => toggleMenu(item.id)}
                                className="p-1 text-gray-400 hover:text-gray-600"
                                title="More options"
                            >
                                ⋯
                            </button>
                            {openMenuId === item.id && (
                                <div
                                    ref={menuRef}
                                    className="absolute right-0 mt-2 w-32 bg-white border border-gray-200 rounded shadow-lg z-10"
                                >
                                    <button
                                        onClick={() => {
                                            onRename(item);
                                            setOpenMenuId(null);
                                        }}
                                        className="block w-full px-4 py-2 text-left text-sm hover:bg-gray-100"
                                    >
                                        Rename
                                    </button>
                                    <button
                                        onClick={() => {
                                            onDelete(item);
                                            setOpenMenuId(null);
                                        }}
                                        className="block w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-gray-100"
                                    >
                                        Delete
                                    </button>
                                </div>
                            )}
                        </td>
                    </tr>
                ))}
                </tbody>
            </table>
        </div>
    );
}
