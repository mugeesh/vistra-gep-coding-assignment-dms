import { formatFileSize, formatDate } from '@/components/explorer/DocumentsTable';

describe('Formatting Utils', () => {
    test('formatFileSize correctly converts bytes', () => {
        expect(formatFileSize(500)).toBe('500 B');
        expect(formatFileSize(1024 * 1.5)).toBe('1.5 KB');
        expect(formatFileSize(1024 * 1024 * 2.5)).toBe('2.5 MB');
        expect(formatFileSize(0)).toBe('—');
    });

    test('formatDate returns UK format', () => {
        const iso = '2026-03-10T10:00:00Z';
        expect(formatDate(iso)).toBe('10 Mar 2026');
    });
});
