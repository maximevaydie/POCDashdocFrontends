import React from "react";

/**
 *
 * @deprecated - Use LoadingOverlay from @dashdoc/web-ui/beta/Loading/NewLoadingOverlay instead
 */

export const LoadingOverlay = () => {
    return (
        <div className="loading-overlay">
            <i className="fa fa-spin fa-circle-notch fa-2x loading-overlay-wheel" />
        </div>
    );
};
