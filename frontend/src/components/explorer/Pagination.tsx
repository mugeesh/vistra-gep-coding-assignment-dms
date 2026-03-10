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
                           }: Readonly<PaginationProps>) {
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
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => onPageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                        className="text-gray-600 hover:text-blue-600 disabled:opacity-50 disabled:cursor-not-allowed">
                        &lt;
                    </button>

                    {Array.from({length: totalPages}, (_, i) => i + 1).map((num) => {
                        // Logic to show only a subset of pages if totalPages is very large
                        if (totalPages > 7 && Math.abs(num - currentPage) > 2 && num !== 1 && num !== totalPages) {
                            if (num === 2 || num === totalPages - 1) return <span key={num} className="text-gray-600">...</span>;
                            return null;
                        }
                        return (
                            <button
                                key={num}
                                onClick={() => onPageChange(num)}
                                className={`text-sm transition-colors ${
                                    num === currentPage ? 'font-bold text-blue-600' : 'text-gray-600 hover:text-blue-600'
                                }`}
                            >{num}&nbsp;
                            </button>
                        );
                    })}

                    <button
                        onClick={() => onPageChange(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        className="text-gray-600 hover:text-blue-600 disabled:opacity-50 disabled:cursor-not-allowed" // No border/bg
                    >
                        &gt;
                    </button>
                </div>
            )}
        </div>
    );
}
