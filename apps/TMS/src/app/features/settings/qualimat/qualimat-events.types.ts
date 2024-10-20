import {QualimatCleaningEvent, QualimatEvent} from "dashdoc-utils";

export type QualimatEventPost = {
    date: Date;
    category: QualimatEvent["category"];
    cleaning: CleaningQualimatEventPost;
    loading: LoadingQualimatEventPost;
    transportUid?: string;
};

export type CleaningQualimatEventPost = {
    method: QualimatCleaningEvent["details"]["cleaning"]["method"];
    detergent?: string;
    disinfectant?: string;
    washingNote?: File | undefined;
};

export type LoadingQualimatEventPost = {
    idtfNumber: string;
    loadType: string;
};
