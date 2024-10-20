import {RootState} from "app/redux/reducers/index";

export const getMiddayTimeFormatted = ({connectors: {absenceManagerConnector}}: RootState) =>
    absenceManagerConnector != null ? "13:00" : "12:00";

export const getMiddayTime = ({connectors: {absenceManagerConnector}}: RootState) =>
    absenceManagerConnector != null ? 13 : 12;

export const getAbsencePlannerConnector = ({connectors: {absenceManagerConnector}}: RootState) =>
    absenceManagerConnector?.data_source === "absence_planner";
