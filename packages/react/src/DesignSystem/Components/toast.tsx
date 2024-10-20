import {theme} from "@dashdoc/web-ui";
import styled from "@emotion/styled";
import React from "react";
import {
    ToastContainer as DefaultToastContainer,
    Slide,
    toast,
    ToastContainerProps,
} from "react-toastify";

import "react-toastify/dist/ReactToastify.css";

const StyledToastContainer = styled(DefaultToastContainer)`
    .Toastify__toast-container {
    }
    .Toastify__toast {
        min-height: 50px;
    }
    .Toastify__toast--error {
        background-color: ${theme.colors.red.default};
    }
    .Toastify__toast--warning {
    }
    .Toastify__toast--success {
        background-color: ${theme.colors.green.default};
    }
    .Toastify__toast-body {
    }
    .Toastify__progress-bar {
    }
`;

export const ToastContainer = (props: ToastContainerProps) => (
    <StyledToastContainer
        autoClose={3000}
        draggable={false}
        transition={Slide}
        hideProgressBar
        position="bottom-left"
        newestOnTop
        {...props}
    />
);

// TODO use Web UI components (Text, Icon, etc.)
export {toast};
