import {updateCompanySettings, useDispatch} from "@dashdoc/web-common";
import {getConnectedCompany} from "@dashdoc/web-common";
import {t} from "@dashdoc/web-core";
import {Button, Flex, RichTextEditor} from "@dashdoc/web-ui";
import {convertFromHTML, convertToHTML} from "draft-convert";
import {EditorState} from "draft-js";
import React, {FunctionComponent, useState} from "react";

import {useSelector} from "app/redux/hooks";

export const SettingsContract: FunctionComponent = () => {
    const connectedCompany = useSelector(getConnectedCompany);
    const dispatch = useDispatch();
    // @ts-ignore
    const custom_contract = connectedCompany.settings.contract_html;

    const [useCustomContract, setUseCustomContract] = useState(!!custom_contract);
    const [editorState, setEditorState] = useState(
        custom_contract
            ? // @ts-ignore
              EditorState.createWithContent(convertFromHTML(custom_contract))
            : EditorState.createEmpty()
    );

    const handleSubmit = async () => {
        let new_contract = "";
        if (useCustomContract) {
            // @ts-ignore
            new_contract = convertToHTML(editorState.getCurrentContent());
        }

        await dispatch(
            updateCompanySettings({
                companyId: connectedCompany?.pk as number,
                settings: {
                    contract_html: new_contract,
                },
            })
        );
    };

    return (
        <div>
            <div className="radio">
                <label>
                    <input
                        onChange={() => setUseCustomContract(false)}
                        type="radio"
                        checked={!useCustomContract}
                        data-testid="settings-contract-default"
                    />
                    {t("settings.useDefaultContract")}
                </label>
            </div>
            <div className="radio">
                <label>
                    <input
                        onChange={() => setUseCustomContract(true)}
                        type="radio"
                        checked={useCustomContract}
                        data-testid="settings-contract-own"
                    />
                    {t("settings.useCustomContract")}
                </label>
            </div>
            {useCustomContract && (
                <RichTextEditor
                    onChange={setEditorState}
                    editorState={editorState}
                    placeholder={t("settings.enterCustomContract")}
                />
            )}
            <Flex justifyContent="flex-end">
                <Button onClick={handleSubmit} data-testid="settings-contract-save">
                    {t("common.save")}
                </Button>
            </Flex>
        </div>
    );
};
