'use client';

const PAGE_SIZE_OPTIONS = [5, 10, 25, 50];

interface PaginationProps {
    currentPage: number;
    totalPages: number;
    pageSize: number;
    totalItems: number;
    itemsOnPage: number;
    onPageChange: (page: number) => void;
    onPageSizeChange: (size: number) => void;
}

export function Pagination({
                               currentPage,
                               totalPages,
                               pageSize,
                               totalItems,
                               itemsOnPage,
                               onPageChange,
                               onPageSizeChange
                           }: PaginationProps) {
    if (totalPages <= 1 && totalItems <= PAGE_SIZE_OPTIONS[0]) return null;

    return (
        <div className="mt-6 flex flex-col sm:flex-row items-center justify-between text-sm text-gray-600 gap-4">
            <div className="flex items-center gap-4">
                <span>Showing <strong>{itemsOnPage}</strong> of <strong>{totalItems}</strong> items</span>
                <label className="flex items-center gap-2">
                    Show:
                    <select
                        value={pageSize}
                        onChange={(e) => onPageSizeChange(Number(e.target.value))}
                        className="rounded border border-gray-300 px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    >
                        {PAGE_SIZE_OPTIONS.map((size) => (
                            <option key={size} value={size}>{size}</option>
                        ))}
                    </select>
                    rows per page
                </label>
            </div>

            {totalPages > 1 && (
                <div className="flex items-center gap-1">
                    <button
                        onClick={() => onPageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                        className="px-3 py-1 border rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        &lt;
                    </button>

                    {Array.from({length: totalPages}, (_, i) => i + 1).map((num) => {
                        // Logic to show only a subset of pages if totalPages is very large
                        if (totalPages > 7 && Math.abs(num - currentPage) > 2 && num !== 1 && num !== totalPages) {
                            if (num === 2 || num === totalPages - 1) return <span key={num}>...</span>;
                            return null;
                        }

                        return (
                            <button
                                key={num}
                                onClick={() => onPageChange(num)}
                                className={`px-3 py-1 rounded border transition-colors ${
                                    num === currentPage
                                        ? 'bg-blue-600 text-white border-blue-600'
                                        : 'hover:bg-gray-100 border-gray-300'
                                }`}
                            >
                                {num}
                            </button>
                        );
                    })}

                    <button
                        onClick={() => onPageChange(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        className="px-3 py-1 border rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        &gt;
                    </button>
                </div>
            )}
        </div>
    );
}
