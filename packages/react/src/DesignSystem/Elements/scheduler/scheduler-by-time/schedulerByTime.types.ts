export type ResizeData = {
    onResizeDone: (itemUid: string, type: string, endDate: Date) => void;
    isResizable: (itemUid: string, type: string, resizable?: boolean) => boolean;
};
