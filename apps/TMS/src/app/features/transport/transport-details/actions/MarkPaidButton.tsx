import {t} from "@dashdoc/web-core";
import {Button, Icon} from "@dashdoc/web-ui";
import React from "react";
import {useDispatch} from "react-redux";

import {fetchSetTransportsStatusPaid} from "app/redux/actions";
type Props = {
    transportUid: string;
    isLoading: boolean;
    isDeleted: boolean;
    isStatusButtonLoading: boolean;
    setIsStatusButtonLoading: (value: boolean) => void;
};
export function MarkPaidButton({
    transportUid,
    isLoading,
    isDeleted,
    isStatusButtonLoading,
    setIsStatusButtonLoading,
}: Props) {
    const dispatch = useDispatch();
    return (
        <Button
            ml={2}
            data-testid="mark-paid-button"
            onClick={(e) => {
                e.preventDefault();
                handleMarkPaid();
            }}
            loading={isStatusButtonLoading}
            disabled={isDeleted || isLoading}
        >
            <Icon name="check" mr={2} />
            {t("components.markPaid")}
        </Button>
    );

    async function handleMarkPaid() {
        setIsStatusButtonLoading(true);
        let filters: any = {};
        filters.uid__in = transportUid;
        await dispatch(fetchSetTransportsStatusPaid(filters));
        try {
            await dispatch(fetchSetTransportsStatusPaid(filters));
        } finally {
            setIsStatusButtonLoading(false);
        }
    }
}
