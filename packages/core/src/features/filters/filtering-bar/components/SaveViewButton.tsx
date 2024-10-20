import {t} from "@dashdoc/web-core";
import {IconButton, Modal, TextInput, TooltipWrapper} from "@dashdoc/web-ui";
import {useToggle} from "dashdoc-utils";
import React, {useState} from "react";

import {useDispatch} from "../../../../hooks/useDispatch";
import {createSettingsView} from "../../../../../../../react/Redux/reducers/settingsViewsReducer";

import type {GenericSettingsView} from "../genericSettingsViews.types";

type SaveViewButtonProps<TQuery = Record<string, any>> = {
    setSelectedView: (view: GenericSettingsView<TQuery>) => void;
    query: TQuery;
    defaultSettings: TQuery | undefined;
    viewCategory: string;
};

export function SaveViewButton<TQuery extends Record<string, any>>({
    setSelectedView,
    query,
    defaultSettings,
    viewCategory,
}: SaveViewButtonProps<TQuery>) {
    const [isModalDisplayed, open, close] = useToggle(false);
    const [name, setName] = useState("");
    const [error, setError] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const dispatch = useDispatch();
    return (
        <>
            <TooltipWrapper content={t("filter.saveView")}>
                <IconButton
                    name="save"
                    onClick={open}
                    data-testid="save-view-button"
                    ml={2}
                    color="grey.dark"
                />
            </TooltipWrapper>
            {isModalDisplayed && (
                <Modal
                    title={t("filter.saveView")}
                    onClose={close}
                    mainButton={{
                        children: t("common.save"),
                        onClick: handleSave,
                        disabled: submitting,
                    }}
                    secondaryButton={{}}
                    data-testid="save-view-modal"
                >
                    <TextInput
                        required
                        autoFocus
                        label={t("filter.viewLabel")}
                        value={name}
                        onChange={(value) => {
                            setName(value);
                            setError(value ? "" : t("common.field_required"));
                        }}
                        error={error}
                        data-testid="view-label-input"
                        onKeyDown={(event) => {
                            if (event.key === "Enter") {
                                handleSave();
                            }
                        }}
                    />
                </Modal>
            )}
        </>
    );
    async function handleSave() {
        if (!name) {
            setError(t("common.field_required"));
            return;
        }
        setSubmitting(true);
        try {
            const response = await dispatch(
                createSettingsView({
                    label: name,
                    category: viewCategory,
                    settings: {...(defaultSettings ?? {}), ...query},
                })
            );
            setSelectedView(response.payload);
        } catch (err) {
            return;
        } finally {
            setSubmitting(false);
        }
        setName("");
        close();
    }
}
