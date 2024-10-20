/* eslint-disable react/no-find-dom-node */
import {AddressModal} from "@dashdoc/web-common";
import {Box, Button, Flex, Icon, LoadingWheel, theme} from "@dashdoc/web-ui";
import {css} from "@emotion/react";
import {Address} from "dashdoc-utils";
import React, {MouseEvent, useState} from "react";

const childrenWrapper = css`
    position: absolute;
    top: 0;
    bottom: 0;
    right: 0;
    left: 0;
    padding: 4px 5px;
    &:hover {
        outline: 1px solid ${theme.colors.blue.default};
    }
`;

type Props = {
    address: Address;
    onSave: (address: Address, callback: Function) => void;
    onDelete: (address: Address, callback: Function) => Promise<void>;
    children: React.ReactNode;
};

type EditAddressPopoverState = {
    isOpen: boolean;
    showButtons: boolean;
    isLoading: boolean;
};

export function EditAddressPopover({address, onSave, onDelete, children}: Props) {
    const [{isOpen, showButtons, isLoading}, setState] = useState<EditAddressPopoverState>(() => ({
        isOpen: false,
        showButtons: false,
        isLoading: false,
    }));

    return (
        <React.Fragment>
            {isOpen && (
                <AddressModal
                    companyBrowsable
                    address={address}
                    onClose={() => setState((prev) => ({...prev, isOpen: false}))}
                    onSave={handleUpdateAddress}
                    onDelete={handleDeleteAddress}
                />
            )}
            <Box
                onMouseEnter={handleOnMouseEnter}
                onMouseLeave={handleOnMouseLeave}
                onClick={(e) => clickDefaultAction(e)}
                css={childrenWrapper}
            >
                {(showButtons || isOpen) && (
                    <Box position="absolute" top={1} right={1}>
                        <Button
                            variant="secondary"
                            onClick={handleOpenPopover}
                            data-testid="edit-popover-open-button"
                            paddingX={2}
                            paddingY={1}
                        >
                            <Icon name="edit" />
                        </Button>
                    </Box>
                )}
                {children}
            </Box>

            {isLoading && (
                <Flex p={3} textAlign="center" zIndex="loadingOverlay">
                    <LoadingWheel small />
                </Flex>
            )}
        </React.Fragment>
    );

    function clickDefaultAction(event: MouseEvent) {
        event.preventDefault();
        event.stopPropagation();
    }

    function handleUpdateAddress(address: Address) {
        setState((pev) => ({...pev, isLoading: true}));
        onSave(address, () => {
            setState((pev) => ({...pev, isOpen: false, isLoading: false}));
        });
    }

    function handleDeleteAddress() {
        setState((pev) => ({...pev, isLoading: true}));
        onDelete(address, () => {
            setState((pev) => ({...pev, isOpen: false, isLoading: false}));
        });
    }

    function handleOnMouseEnter() {
        setState((pev) => ({...pev, showButtons: true}));
    }

    function handleOnMouseLeave() {
        setState((pev) => ({...pev, showButtons: false}));
    }

    function handleOpenPopover(event: MouseEvent) {
        clickDefaultAction(event);
        setState((pev) => ({...pev, isOpen: true}));
    }
}
