import {createSelector} from "@dashdoc/web-common";

import {RootState} from "../reducers";

const getEntitiesSelector = ({entities}: RootState) => entities;

export const getEntities = createSelector(getEntitiesSelector, (entities) => entities);

// TODO migrate entities selectors here and use reselect
export {
    getAddressesList,
    getCompaniesList,
    getContactsList,
    getExportsList,
    getFullTransport,
    getInvoicesList,
    getManagersList,
    getSiteSchedulerSharedActivitiesList,
    getTrailersList,
    getTransportsList,
    getTripsList,
    getTruckersList,
    getTruckerStatsList,
    getUnplannedSegmentsList,
    getVehiclesList,
} from "../reducers";
