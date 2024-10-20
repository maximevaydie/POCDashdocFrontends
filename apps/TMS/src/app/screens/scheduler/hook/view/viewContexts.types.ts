export type ViewContext = {
    viewPk: number | undefined;
    selectViewPk: (view: number | undefined) => void;
};
