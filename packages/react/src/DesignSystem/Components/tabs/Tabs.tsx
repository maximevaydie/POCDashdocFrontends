import React, {FunctionComponent, ReactNode, useState} from "react";

import {Box, BoxProps} from "../../Elements/layout/Box";
import {Flex} from "../../Elements/layout/Flex";

import {CustomTab} from "./CustomTab";
import {DefaultTab} from "./DefaultTab";

export type TabsProps = BoxProps & {
    tabs: Array<{label: ReactNode; content: ReactNode; testId?: string}>;
    actionButton?: ReactNode;
    initialActiveTab?: number;
    forceRenderTabPanels?: boolean;
    hideHeaderWhenSingleTab?: boolean;
    clickableTab?: (index: number) => boolean;
    onTabChanged?: (index: number) => void | boolean;
};

export const Tabs: FunctionComponent<TabsProps> = ({
    tabs,
    actionButton,
    initialActiveTab = 0,
    forceRenderTabPanels = false,
    hideHeaderWhenSingleTab = false,
    clickableTab = () => true,
    onTabChanged,
    ...otherProps
}) => {
    const [activeTab, setActiveTab] = useState(initialActiveTab);

    let tabContentToRender = tabs.length > activeTab ? tabs[activeTab].content : null;
    if (forceRenderTabPanels) {
        tabContentToRender = (
            <>
                {tabs.map((tab, index) => (
                    <Box
                        key={index}
                        display={index === activeTab ? "flex" : "none"}
                        flexDirection="column"
                        height="inherit"
                        maxHeight="inherit"
                        overflow="hidden"
                    >
                        {tab.content}
                    </Box>
                ))}
            </>
        );
    }

    return (
        <Flex height="100%" flexDirection="column" flexGrow={1}>
            <Flex
                borderBottom="1px solid"
                borderColor="grey.light"
                justifyContent="space-between"
                {...otherProps}
            >
                {((hideHeaderWhenSingleTab && tabs.length > 1) || !hideHeaderWhenSingleTab) && (
                    <Flex>
                        {tabs.map((tab, index) => {
                            const TabComponent =
                                typeof tab.label === "string" ? DefaultTab : CustomTab;
                            return (
                                <TabComponent
                                    key={index}
                                    index={index}
                                    onClick={() => handleTabChange(index)}
                                    testId={tab.testId}
                                    active={activeTab === index}
                                >
                                    {tab.label}
                                </TabComponent>
                            );
                        })}
                    </Flex>
                )}
                {actionButton}
            </Flex>
            {tabContentToRender}
        </Flex>
    );

    function handleTabChange(index: number) {
        if (clickableTab(index)) {
            if (!onTabChanged || onTabChanged(index) !== false) {
                setActiveTab(index);
            }
        }
    }
};
