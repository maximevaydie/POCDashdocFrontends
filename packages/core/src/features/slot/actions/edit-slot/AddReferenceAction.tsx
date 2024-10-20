import {t} from "@dashdoc/web-core";
import {Flex, Icon, Text} from "@dashdoc/web-ui";
import {useToggle} from "dashdoc-utils";
import React from "react";

import {EditReferenceModal} from "./modals/EditReferenceModal";
type Props = {references: string[]; slotId: number};

export function AddReferenceAction({references, slotId}: Props) {
    const [show, setShow, setHide] = useToggle(false);

    return (
        <>
            <Flex
                alignItems="center"
                style={{
                    cursor: "pointer",
                }}
                data-testid="add-reference"
            >
                <Icon svgWidth="16px" svgHeight="16px" name="add" mr={1} color="blue.default" />
                <Text ml={2} color="blue.default" onClick={setShow} width="fit-content">
                    {t("common.addReferences")}
                </Text>
            </Flex>

            {show && (
                <EditReferenceModal
                    title={t("common.addReferences")}
                    references={references}
                    slotId={slotId}
                    onClose={setHide}
                    onSubmit={setHide}
                    data-testid="testId"
                />
            )}
        </>
    );
}
