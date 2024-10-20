import {apiService} from "@dashdoc/web-common";
import {t} from "@dashdoc/web-core";
import {Button} from "@dashdoc/web-ui";
import {useToggle} from "dashdoc-utils";
import React from "react";

import {SubcontractSubmit} from "app/features/transportation-plan/types";
import {SearchQuery} from "app/redux/reducers/searches";

import {BulkSubcontractModal} from "./components/BulkSubcontractModal";

type Props = {
    query: SearchQuery;
    disabled: boolean;
    onSubcontracted: () => void;
    onClose: () => void;
};

export function SubcontractBulkAction({query, disabled, onSubcontracted, onClose}: Props) {
    const [isModalOpen, openModal, closeModal] = useToggle();
    const [isSubmitting, setIsSubmitting, setIsSubmitted] = useToggle();
    return (
        <>
            <Button
                variant="primary"
                disabled={disabled || isSubmitting}
                onClick={openModal}
                data-testid="mass-charter-button"
            >
                {t("chartering.actions.charter")}
            </Button>
            {isModalOpen && (
                <BulkSubcontractModal
                    query={query}
                    isSubmitting={isSubmitting}
                    onClose={() => {
                        closeModal();
                        onClose();
                    }}
                    onSubcontract={handleSubcontract}
                />
            )}
        </>
    );

    async function handleSubcontract(values: SubcontractSubmit) {
        try {
            setIsSubmitting();
            await apiService.Transports.bulkSubcontract(query, values, {
                apiVersion: "v4",
            });
            onSubcontracted();
        } finally {
            setIsSubmitted();
        }
    }
}
