import {t} from "@dashdoc/web-core";
import {Button, Icon} from "@dashdoc/web-ui";
import {useToggle} from "dashdoc-utils";
import React from "react";

import {AddTelematicModal} from "../../../transport/telematic/add-telematic-modal";

type Props = {
    onCreate: () => void;
};

export function AddTelematicAction({onCreate}: Props) {
    const [isModalOpen, openModal, closeModal] = useToggle();

    return (
        <>
            <Button
                ml={"auto"}
                style={{marginBottom: "1em"}}
                onClick={openModal}
                data-testid="settings-telematic-add-button"
            >
                <Icon name="add" mr={3} />
                {t("settings.addTelematic")}
            </Button>

            {isModalOpen && <AddTelematicModal onClose={closeModal} onCreation={onCreate} />}
        </>
    );
}
