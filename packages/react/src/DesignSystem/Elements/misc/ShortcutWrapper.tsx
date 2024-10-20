import {Button, ButtonProps, Text, TooltipPlacement, TooltipWrapper} from "@dashdoc/web-ui";
import React, {
    FunctionComponent,
    ReactNode,
    useCallback,
    useEffect,
    useRef,
    useState,
} from "react";

export type ShortcutWrapperProps = {
    shortcutKeyCodes?: Array<string>; // event.code
    tooltipLabel?: string;
    tooltipPlacement?: TooltipPlacement;
    isShortcutDisabled?: boolean;
    onShortcutPressed?: (event: Event) => void;
    children?: ReactNode;
};

const getKeyCode = (code: string) => {
    if (code.includes("Meta") && navigator.platform.includes("Mac")) {
        return "Control";
    }

    return (
        ["Shift", "Control", "Meta", "Alt"].find((specialKey) => code.includes(specialKey)) || code
    );
};
export const ShortcutWrapper: FunctionComponent<ShortcutWrapperProps> = ({
    shortcutKeyCodes,
    tooltipLabel,
    tooltipPlacement = "top",
    isShortcutDisabled,
    onShortcutPressed,
    children,
}) => {
    const [pressedKeyCodes, setPressedKeyCodes] = useState<Array<string>>([]);
    const [event, setEvent] = useState<Event>();

    const handleKeypressDown = useCallback(
        (localEvent: KeyboardEvent) => {
            if (localEvent.repeat) {
                return;
            }

            if (!isShortcutDisabled && localEvent.code) {
                setEvent(localEvent);
                setPressedKeyCodes((previousKeyCodes) => {
                    const keyCode = getKeyCode(localEvent.code);
                    if (!previousKeyCodes.includes(keyCode)) {
                        return [...previousKeyCodes, keyCode];
                    }
                    return previousKeyCodes;
                });
            } else {
                // @ts-ignore
                setEvent(null);
                setPressedKeyCodes([]);
            }
        },
        [isShortcutDisabled]
    );
    const handleKeypressUp = useCallback((localEvent: KeyboardEvent) => {
        if (localEvent.code) {
            setPressedKeyCodes([]);
        }
    }, []);

    useEffect(() => {
        document.addEventListener("keydown", handleKeypressDown, false);
        document.addEventListener("keyup", handleKeypressUp, false);
        return () => {
            document.removeEventListener("keydown", handleKeypressDown, false);
            document.removeEventListener("keyup", handleKeypressUp, false);
        };
    }, [handleKeypressDown, handleKeypressUp]);

    useEffect(() => {
        if (
            !isShortcutDisabled &&
            shortcutKeyCodes &&
            shortcutKeyCodes.length === pressedKeyCodes.length &&
            shortcutKeyCodes.every((code) => pressedKeyCodes.includes(code))
        ) {
            event?.preventDefault();
            // @ts-ignore
            onShortcutPressed?.(event);
        }
    }, [pressedKeyCodes]);

    return tooltipLabel !== undefined ? (
        <TooltipWrapper
            // nosemgrep react-dangerouslysetinnerhtml
            content={<Text dangerouslySetInnerHTML={{__html: tooltipLabel}}></Text>}
            placement={tooltipPlacement}
        >
            {children}
        </TooltipWrapper>
    ) : (
        <>{children}</>
    );
};

export type ButtonWithShortcutProps = ButtonProps &
    Omit<ShortcutWrapperProps, "onShortcutPressed">;
export const ButtonWithShortcut: FunctionComponent<ButtonWithShortcutProps> = ({
    shortcutKeyCodes,
    tooltipPlacement,
    tooltipLabel,
    isShortcutDisabled,
    ...buttonProps
}) => {
    const ref = useRef(null);
    return (
        <ShortcutWrapper
            onShortcutPressed={() => {
                // @ts-ignore
                ref?.current?.click();
            }}
            tooltipPlacement={tooltipPlacement}
            shortcutKeyCodes={shortcutKeyCodes}
            tooltipLabel={tooltipLabel}
            isShortcutDisabled={isShortcutDisabled}
        >
            <Button buttonRef={ref} {...buttonProps} />
        </ShortcutWrapper>
    );
};
