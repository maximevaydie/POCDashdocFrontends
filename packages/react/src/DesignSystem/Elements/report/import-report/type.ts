import {TranslationKeys} from "@dashdoc/web-core";

type ImportedEntity = {
    name: TranslationKeys;
    details: string[];
};
type NotImportedEntityDetail = {
    lineNumber: number;
    identifier: string;
    errorDetails: string | {[key: string]: string};
};
type NotImportedEntity = {
    name: TranslationKeys;
    details: NotImportedEntityDetail[];
};
export type ImportReportType = {
    importedEntities: ImportedEntity[];
    notImportedEntities: NotImportedEntity[];
};
