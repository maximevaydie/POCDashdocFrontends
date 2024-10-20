import {t} from "@dashdoc/web-core";
import {Box, Modal, Text, theme} from "@dashdoc/web-ui";
import {getItemAsAList} from "dashdoc-utils";
import React from "react";

type Props = {
    onClose: () => void;
    reference?: string;
};

export function ViewReferenceListModal(props: Props) {
    const {reference, onClose} = props;
    const referenceList = getItemAsAList(reference);

    const renderReference = (ref: string) => {
        if (!ref) {
            return null;
        }
        return (
            <Box style={{backgroundColor: theme.colors.grey.ultralight}}>
                <Text
                    style={{
                        padding: theme.space[1],
                        marginBottom: theme.space[1],
                        borderRadius: theme.radii[1],
                    }}
                >
                    {ref}
                </Text>
            </Box>
        );
    };
    return (
        <Modal
            title={t("common.references")}
            onClose={onClose}
            mainButton={{onClick: onClose, children: t("common.close")}}
            secondaryButton={null}
        >
            <div style={{wordWrap: "break-word"}}>
                {referenceList.map((reference: string) => renderReference(reference))}
            </div>
        </Modal>
    );
}
