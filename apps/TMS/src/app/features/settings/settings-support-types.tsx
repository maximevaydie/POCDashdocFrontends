import {t} from "@dashdoc/web-core";
import {Box, Button, Flex, Icon} from "@dashdoc/web-ui";
import {LoadingRow} from "@dashdoc/web-ui";
import {css} from "@emotion/react";
import {SupportType, useToggle} from "dashdoc-utils";
import React, {useCallback, useEffect} from "react";

import {
    fetchDeleteSupportType,
    fetchSearchSupportType,
} from "app/redux/actions/company/support-types";
import {useDispatch, useSelector} from "app/redux/hooks";
import {SUPPORT_TYPES_QUERY_NAME} from "app/types/constants";

import AddSupportTypeModal from "./add-support-type-modal";

function SettingsSupportTypes() {
    const [isModalOpen, openModal, closeModal] = useToggle(false);

    const dispatch = useDispatch();
    const supportTypes: SupportType[] = useSelector((state) => {
        // @ts-ignore
        return Object.values(state.entities["support-types"] ?? {});
    });
    const isLoading = useSelector((state) => state.searches[SUPPORT_TYPES_QUERY_NAME]?.loading);

    const noItems = supportTypes?.length === 0 && !isLoading;

    const retrieveSupportTypes = useCallback(() => {
        dispatch(fetchSearchSupportType());
    }, [dispatch]);

    const handleArchiveClick = useCallback(
        async (supportType: SupportType) => {
            const confirmation = confirm(
                t("settings.confirmArchiveSupportType", {name: supportType.name})
            );
            if (confirmation) {
                // Archive is a soft delete
                await dispatch(fetchDeleteSupportType(supportType.uid));
                retrieveSupportTypes();
            }
        },
        [dispatch, retrieveSupportTypes]
    );

    const renderNoItems = () => {
        return (
            <div className="no-shipment-list ">
                <h4 className="text-center">{t("settings.noSupportTypes")}</h4>
            </div>
        );
    };

    const renderSupportType = (supportType: SupportType) => {
        return (
            <tr key={supportType.uid} data-testid={`support-types-row-${supportType.uid}`}>
                <td>{supportType.name}</td>
                <td>{supportType.remote_id}</td>
                <td>
                    <Button
                        variant="plain"
                        data-testid="support-type-archive-button"
                        onClick={() => handleArchiveClick(supportType)}
                    >
                        {t("common.archive")}
                    </Button>
                </td>
            </tr>
        );
    };

    useEffect(() => {
        retrieveSupportTypes();
    }, []);

    return (
        <Flex flexDirection="column">
            <Box mb={2}>
                <h4 data-testid="settings-support-types">{t("settings.supportTypes")}</h4>
            </Box>
            <Flex justifyContent="flex-end" mb={4}>
                <Button onClick={openModal} data-testid="settings-supports-add-button">
                    <Icon mr={1} name="add" />
                    {t("components.addSupportType")}
                </Button>
            </Flex>
            <Box width="100%" id="scroll-listener" data-testid="settings-supports-table">
                <table
                    className="table table-hover shipments-table"
                    data-testid="support-types-table"
                >
                    <thead>
                        <tr>
                            <th>{t("common.name")}</th>
                            <th>
                                {t("supportType.internalReference", undefined, {capitalize: true})}
                            </th>
                            <th
                                css={css`
                                    width: 105px;
                                `}
                            >
                                {t("common.actions")}
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {supportTypes?.map(renderSupportType)}
                        {isLoading && <LoadingRow colSpan={4} />}
                    </tbody>
                </table>

                {noItems && renderNoItems()}
            </Box>
            {isModalOpen && (
                <AddSupportTypeModal onClose={closeModal} onSubmit={retrieveSupportTypes} />
            )}
        </Flex>
    );
}

export default SettingsSupportTypes;
