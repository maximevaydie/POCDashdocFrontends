import {useEffect, useState} from "react";
import {z} from "zod";

const LOCAL_STORAGE_ITEM_KEY = "creditNoteListColumns";

const creditNoteColumnsSchema = z.array(z.string());

type UseCreditNoteListColumns = z.infer<typeof creditNoteColumnsSchema>;

/**
 * Save the selected columns in the local storage.
 * TODO: save it in DB instead
 */
export const useCreditNoteListColumns = (initialColumns: UseCreditNoteListColumns) => {
    const [selectedColumns, setSelectedColumns] = useState<UseCreditNoteListColumns>(() => {
        const rawSavedColumns = localStorage.getItem(LOCAL_STORAGE_ITEM_KEY);
        const validation = creditNoteColumnsSchema.safeParse(
            rawSavedColumns ? JSON.parse(rawSavedColumns) : null
        );
        if (validation.success) {
            return validation.data;
        }
        return initialColumns;
    });

    useEffect(() => {
        localStorage.setItem(LOCAL_STORAGE_ITEM_KEY, JSON.stringify(selectedColumns));
    }, [selectedColumns]);

    return {selectedColumns, setSelectedColumns};
};
