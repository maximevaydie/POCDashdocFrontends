import {t} from "@dashdoc/web-core";
import {Flex} from "@dashdoc/web-ui";
import {useToggle} from "dashdoc-utils";
import React, {FunctionComponent, ReactNode, createContext, useContext} from "react";

import {Text} from "../../Components/Text";
import {IconButton} from "../button/IconButton";
import {Box} from "../layout/Box";

export type OpenPanelProps = {
    isOpened: boolean;
    open: () => void;
    close: () => void;
    width?: string;
};
export const OpenSidePanelContext = createContext<OpenPanelProps>({
    isOpened: true,
    open: () => {},
    close: () => {},
});

export const SidePanelProvider: FunctionComponent<{children: ReactNode; width?: string}> = ({
    children,
    width,
}) => {
    const [isOpened, open, close] = useToggle(false);
    return (
        <OpenSidePanelContext.Provider value={{isOpened, open, close, width}}>
            {children}
        </OpenSidePanelContext.Provider>
    );
};

export const OpenSidePanelInfoButton: FunctionComponent = () => {
    const {isOpened, open, close} = useContext(OpenSidePanelContext);
    return (
        <IconButton
            data-testid="open-side-panel-info-button"
            ml={2}
            onClick={isOpened ? close : open}
            name="info"
            label={t("common.informations")}
            color="blue.default"
        />
    );
};

export const SidePanel: FunctionComponent<{
    children: ReactNode;
    title?: string;
    isSticky?: boolean;
}> = ({title, isSticky, children}) => {
    const {isOpened, close, width} = useContext(OpenSidePanelContext);
    return isOpened ? (
        <Box p={4} width={width} borderLeft="2px solid" borderColor="grey.light">
            <Box position={isSticky ? "sticky" : undefined} top={"12px"}>
                {title && (
                    <Flex justifyContent="space-between" alignItems="center" mb={3} mt={3}>
                        <Text variant="title" color="grey.dark">
                            {title}
                        </Text>
                        <IconButton onClick={close} name="close" height="fit-content" />
                    </Flex>
                )}
                {children}
            </Box>
        </Box>
    ) : null;
};
