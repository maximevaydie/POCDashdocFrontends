import {
    getCompanySetting,
    getConnectedCompanyId,
    updateCompanySettings,
} from "@dashdoc/web-common";
import {t} from "@dashdoc/web-core";
import {Box, Button, Flex, RichTextEditor, Text} from "@dashdoc/web-ui";
import {convertFromHTML, convertToHTML} from "draft-convert";
import {EditorState} from "draft-js";
import React, {FunctionComponent, useState} from "react";

import {useDispatch, useSelector} from "app/redux/hooks";

type SettingsTransportOrderProps = {};

export const SettingsTransportOrderObservations: FunctionComponent<
    SettingsTransportOrderProps
> = () => {
    const dispatch: (query: any) => Promise<any> = useDispatch();
    const transportOrderObservations = useSelector((state) =>
        getCompanySetting(state, "transport_order_observations")
    );
    const [editorState, setEditorState] = useState(
        transportOrderObservations
            ? // @ts-ignore
              EditorState.createWithContent(convertFromHTML(transportOrderObservations))
            : EditorState.createEmpty()
    );

    const companyPk = useSelector(getConnectedCompanyId);
    const handleSubmit = async () => {
        const observations = convertToHTML(editorState.getCurrentContent());
        await dispatch(
            updateCompanySettings({
                companyId: companyPk as number,
                settings: {
                    transport_order_observations: observations,
                },
            })
        );
    };

    const onChangeEditorState = (editorState: any) => {
        setEditorState(editorState);
    };

    return (
        <Box p={1}>
            <Text mb={2} variant="title">
                {t("settings.charterConfirmation")}
            </Text>
            <Text mb={1} variant="h1">
                {t("common.informations")}
            </Text>
            <Text mb={3} variant="caption" fontStyle="italic">
                {t("settings.charterConfirmationObservationsNote")}
            </Text>
            <RichTextEditor
                onChange={onChangeEditorState}
                editorState={editorState}
                placeholder={t("settings.transportOrderObservationsPlaceholder")}
            />
            <Flex mt={4} justifyContent="flex-end">
                <Button
                    type="button"
                    onClick={handleSubmit}
                    mr={2}
                    data-testid="settings-transport-order-observations-save"
                >
                    {t("common.save")}
                </Button>
            </Flex>
        </Box>
    );
};
