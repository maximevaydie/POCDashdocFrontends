import {LoadingWheel} from "@dashdoc/web-ui";
import {IFrame} from "@dashdoc/web-ui";
import {useToggle} from "dashdoc-utils";
import React from "react";

import {utilsService} from "../../../../../../services/utils.service";

type Props = {
    url: string;
    onLoaded: () => void;
};

export function DocumentViewer({url, onLoaded}: Props) {
    const download = utilsService.isDownload(url);
    const [iframeLoading, , setIframeLoaded] = useToggle(true);
    return (
        <>
            <IFrame src={url + "#view=FitH"} download={download} onLoad={handleLoad} />
            {iframeLoading && <LoadingWheel />}
        </>
    );

    function handleLoad() {
        setIframeLoaded();
        if (download) {
            setTimeout(onLoaded, 1000);
        }
    }
}
