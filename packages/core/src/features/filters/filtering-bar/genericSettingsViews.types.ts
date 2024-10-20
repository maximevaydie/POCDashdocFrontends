export type GenericSettingsView<TSettings = Record<string, any>> = {
    pk: number;
    label: string;
    category: string;
    settings: TSettings;
};
