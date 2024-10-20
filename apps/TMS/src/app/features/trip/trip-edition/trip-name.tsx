import {t} from "@dashdoc/web-core";
import {Text, TextInput} from "@dashdoc/web-ui";
import React, {useState} from "react";
import {useDispatch} from "react-redux";

import {useExtendedView} from "app/hooks/useExtendedView";
import {fetchSetTripName} from "app/redux/actions/trips";

type Props = {
    tripUid: string;
    tripName?: string;
    disabled?: boolean;
};
export function TripName({tripUid, tripName = "", disabled}: Props) {
    const [name, setName] = useState<string>(tripName);
    const dispatch = useDispatch();
    const {extendedView} = useExtendedView();

    const saveTripName = () => {
        if (name !== tripName) {
            dispatch(fetchSetTripName(name, tripUid, extendedView));
        }
    };

    return (
        <>
            <Text variant="h1" mb={3}>
                {t("trip.nameInput")}
            </Text>
            <TextInput
                value={name}
                onChange={setName}
                onBlur={saveTripName}
                label={t("trip.nameInput")}
                disabled={disabled}
                data-testid="trip-name-input"
            />
        </>
    );
}
