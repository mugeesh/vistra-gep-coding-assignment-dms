'use client';

interface IndeterminateCheckboxProps {
    checked: boolean;
    indeterminate: boolean;
    onClick: () => void;
    className?: string;
}

export function IndeterminateCheckbox({
                                          checked,
                                          indeterminate,
                                          onClick,
                                          className = ""
                                      }: IndeterminateCheckboxProps) {
    return (
        <div
            onClick={(e) => {
                e.stopPropagation();
                onClick();
            }}
            className={`flex h-5 w-5 cursor-pointer items-center justify-center rounded border border-gray-400 bg-white transition-colors hover:border-blue-500 ${className}`}
        >
            {indeterminate && !checked && (
                <div className="h-0.5 w-2.5 rounded-sm bg-[#00144d]" />
            )}

            {checked && (
                <svg className="h-3.5 w-3.5 text-[#00144d]" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" />
                </svg>
            )}
        </div>
    );
}
