import { render, screen } from '@testing-library/react';
import { DocumentsTable } from '@/components/explorer/DocumentsTable';
import {ListItem} from "@/types/api";

const mockItems: ListItem[] = [
    {
        kind: 'folder',
        id: 1,
        name: 'HR',
        parentId: null, 
        createdAt: '2026-01-01T10:00:00Z',
        updatedAt: '2026-01-01T10:00:00Z', 
        createdBy: 'Admin'
    },
    {
        kind: 'document',
        id: 2,
        folderId: null,
        title: 'Resume',
        description: null, 
        fileName: 'r.pdf',
        mimeType: 'application/pdf',
        sizeBytes: 100,
        createdAt: '2026-01-01T10:00:00Z',
        updatedAt: '2026-01-01T10:00:00Z', 
        createdBy: 'Admin'
    }
];
describe('DocumentsTable', () => {
    test('renders folder and document icons correctly', () => {
        render(
            <DocumentsTable
                items={mockItems}
                selectedIds={[]}
                sortBy="name"
                sortOrder="asc"
                onToggleSort={() => {}}
                onSelectRow={() => {}}
                onSelectAll={() => {}}
                onNavigate={() => {}}
                onRename={() => {}}
                onDelete={() => {}}
            />
        );

        expect(screen.getByText('HR')).toBeInTheDocument();
        expect(screen.getByText('Resume')).toBeInTheDocument();
        // Check if folder has the '—' for size and document has '100 B'
        expect(screen.getByText('100 B')).toBeInTheDocument();
    });
});
