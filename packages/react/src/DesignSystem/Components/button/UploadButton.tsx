import React, {InputHTMLAttributes, useCallback, useImperativeHandle, useRef} from "react";

import {StyledButton, StyledInputSpecificProps} from "../input/input2/StyledInput";

import {ButtonProps} from "./Button";

// Needed to retrieve `target.files`
export interface HTMLInputEvent extends React.ChangeEvent {
    target: HTMLInputElement & EventTarget;
}

type UploadButtonProps = Omit<ButtonProps, "onClick"> &
    Omit<InputHTMLAttributes<HTMLInputElement>, "type" | "onChange"> &
    StyledInputSpecificProps & {
        onFileChange: (files: FileList, meta: HTMLInputEvent) => void;
        deferFormSubmission?: boolean;
        buttonDataTestId?: string;
    };

export type HandleUploadButton = {
    resetInput: () => void;
};

const _UploadButton: React.ForwardRefRenderFunction<HandleUploadButton, UploadButtonProps> = (
    props,
    forwardedRef
) => {
    const {
        buttonDataTestId,
        onFileChange,
        children,
        variant,
        size,
        severity,
        tracking,
        width,
        justifyContent,
        flexDirection,
        alignItems,
        deferFormSubmission,
        error,
        warning,
        success,
        withLabel,
        withLeftIcon,
        withRightIcon,
        position,
        ...inputProps
    } = props;

    useImperativeHandle(forwardedRef, () => ({
        resetInput: () => {
            // @ts-ignore
            inputRef.current.value = "";
        },
    }));

    const inputRef = useRef(null);

    const handleChange = useCallback(
        (event: HTMLInputEvent) => {
            // @ts-ignore
            onFileChange(event.target.files, event);
        },
        [onFileChange]
    );

    const handleButtonClicked = useCallback(() => {
        // @ts-ignore
        inputRef.current.click();
    }, [inputRef.current]);

    return (
        <StyledButton
            {...{
                variant,
                size,
                severity,
                tracking,
                width,
                justifyContent,
                flexDirection,
                alignItems,
                error,
                warning,
                success,
                withLabel,
                withLeftIcon,
                withRightIcon,
                position,
            }}
            data-testid={buttonDataTestId}
            onClick={handleButtonClicked}
            type={deferFormSubmission ? "button" : "submit"}
            textAlign="start"
        >
            <input
                {...inputProps}
                ref={inputRef}
                type="file"
                style={{display: "none"}}
                onChange={handleChange}
            />
            {children}
        </StyledButton>
    );
};

export const UploadButton = React.forwardRef(_UploadButton);
