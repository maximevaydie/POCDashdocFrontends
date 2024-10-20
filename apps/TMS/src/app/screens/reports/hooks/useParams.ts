import {useMemo} from "react";

export function useParams(match: {params?: {reportUid?: string}}) {
    const reportUid = useMemo(
        // @ts-ignore
        () => parseInt(match?.params?.reportUid),
        [match?.params?.reportUid]
    );

    return {reportUid};
}
