import { useState, useEffect, useCallback } from 'react';
import { getItems } from '@/lib/api-client';
import { ItemsSortBy, PaginatedItemsResponse } from '@/types/api';

export function useDocuments(currentParentId: number | null, searchDebounced: string, globalSearch: boolean) {
    const [data, setData] = useState<PaginatedItemsResponse>({
        items: [],
        total: 0,
        page: 1,
        pageSize: 5,
        totalPages: 1
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [sortBy, setSortBy] = useState<ItemsSortBy>('name');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
    const [pageSize, setPageSize] = useState(5);
    const [page, setPage] = useState(1);

    // Reset page when context changes
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

    return {
        data,
        loading,
        error,
        setError,
        page,
        setPage,
        pageSize,
        setPageSize,
        sortBy,
        setSortBy,
        sortOrder,
        setSortOrder,
        loadItems
    };
}
