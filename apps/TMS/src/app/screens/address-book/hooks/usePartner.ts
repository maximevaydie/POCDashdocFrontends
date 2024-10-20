import {PartnerDetailOutput, fetchPartner} from "@dashdoc/web-common";
import {Logger} from "@dashdoc/web-core";
import {useEffect, useState} from "react";
import {useDispatch} from "react-redux";
import {createSelector} from "reselect";

import {useSelector} from "app/redux/hooks";
import {RootState} from "app/redux/reducers";

export function usePartner(pk: number) {
    const dispatch = useDispatch();
    const [loading, setLoading] = useState<boolean>(true);
    const getPartner = createSelector(
        ({entities}: RootState) => {
            return entities.partnerDetails;
        },
        (partnerDetails) => {
            if (partnerDetails?.[pk]) {
                return partnerDetails[pk];
            } else {
                return null;
            }
        }
    );
    const partner = useSelector(getPartner) as PartnerDetailOutput | null;
    useEffect(() => {
        const fetch = async () => {
            try {
                setLoading(true);
                await dispatch(fetchPartner(pk));
            } catch (e) {
                Logger.error(e);
            } finally {
                setLoading(false);
            }
        };
        fetch();
    }, [pk, dispatch]);

    return {
        partner,
        loading,
    };
}
