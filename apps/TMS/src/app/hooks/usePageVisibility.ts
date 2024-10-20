import {useEffect, useState} from "react";

const isDocumentVisible = () => document.visibilityState === "visible";

export function usePageVisibility() {
    const [isVisible, setIsVisible] = useState(isDocumentVisible());
    const onVisibilityChange = () => setIsVisible(isDocumentVisible());

    useEffect(() => {
        document.addEventListener("visibilitychange", onVisibilityChange, false);

        return () => document.removeEventListener("visibilitychange", onVisibilityChange);
    });

    return isVisible;
}
