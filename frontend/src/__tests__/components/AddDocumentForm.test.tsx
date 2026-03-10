import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { AddFolderForm } from '@/components/forms/AddFolderForm';

describe('AddFolderForm', () => {
    const mockSubmit = jest.fn();

    test('shows error when folder name is empty', async () => {
        render(
            <AddFolderForm
                isOpen={true}
                defaultParentId={null}
                onSubmit={mockSubmit}
                onCancel={() => {}}
            />
        );

        fireEvent.click(screen.getByText(/Create folder/i));

        await waitFor(() => {
            //
            expect(screen.getByText(/Name is required/i)).toBeInTheDocument();
        });
        expect(mockSubmit).not.toHaveBeenCalled();
    });
});
