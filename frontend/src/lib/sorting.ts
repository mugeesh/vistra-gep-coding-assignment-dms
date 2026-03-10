import {ItemsSortBy, ListItem} from "@/types/api";

export function  getItemName(item: ListItem): string {
    if (item.kind === 'folder') return item.name;
    return item.title || item.fileName || 'Untitled';
}

export function sortItems(
    items: ListItem[],
    sortBy: ItemsSortBy,
    sortOrder: 'asc' | 'desc'
): ListItem[] {
    return [...items].sort((a, b) => {
        // Handle Name Sorting with ABC -> 123 logic
        if (sortBy === 'name') {
            const nameA = getItemName(a).toLowerCase();
            const nameB = getItemName(b).toLowerCase();

            const aIsAlpha = /^[a-z]/.test(nameA);
            const bIsAlpha = /^[a-z]/.test(nameB);

            if (aIsAlpha && !bIsAlpha) return sortOrder === 'asc' ? -1 : 1;
            if (!aIsAlpha && bIsAlpha) return sortOrder === 'asc' ? 1 : -1;

            return sortOrder === 'asc'
                ? nameA.localeCompare(nameB)
                : nameB.localeCompare(nameA);
        }

        // Handle other columns (Date, Size) using standard comparison
        const valA = a[sortBy as keyof ListItem] ?? '';
        const valB = b[sortBy as keyof ListItem] ?? '';

        if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
        if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
        return 0;
    });
}
