import React, {useEffect, useRef} from "react";

interface IFrameProps {
    onLoad?: () => void;
    download: boolean;
    src: string;
    height?: number | string;
}

export const IFrame: React.FunctionComponent<IFrameProps> = React.memo(function IFrame({
    onLoad,
    download,
    src,
    height,
}) {
    const iframe = useRef<HTMLIFrameElement>(null);
    const interval = useRef<number>(null);

    useEffect(() => {
        if (onLoad) {
            iframe.current?.addEventListener("load", onLoad);
        }
        if (download) {
            // @ts-ignore
            interval.current = window.setInterval(handleInterval, 100);
        }
    }, []);

    const handleInterval = () => {
        if (!iframe.current) {
            clearInterval(interval.current ?? undefined);
            return;
        }
        var iframeDoc = iframe.current.contentDocument || iframe.current?.contentWindow?.document;
        if (iframeDoc?.readyState === "complete") {
            onLoad?.();
            clearInterval(interval.current ?? undefined);
        }
    };

    let computedHeight = height ?? window.innerHeight * 0.8;
    if (download) {
        computedHeight = 0;
    }

    return (
        <iframe
            id="pdf-frame"
            ref={(f) => {
                // @ts-ignore
                iframe.current = f;
            }}
            frameBorder={"0"}
            width={"100%"}
            height={computedHeight}
            src={src}
            onLoad={onLoad}
        />
    );
});
