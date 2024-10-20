import {t} from "@dashdoc/web-core";
import {Box, Icon, Link, LoadingWheel, Text} from "@dashdoc/web-ui";
import {IFrame} from "@dashdoc/web-ui";
import {useToggle} from "dashdoc-utils";
import React from "react";
import {useSelector} from "react-redux";
import {useHistory} from "react-router";
import {useDispatch} from "redux/hooks";
import {fetchReporting, selectReporting} from "redux/reducers/flow/reporting.slice";
import {selectSite} from "redux/reducers/flow/site.slice";
import {Site} from "types";

type Props = {
    slug: string;
};

export function Reporting({slug}: Props) {
    const history = useHistory();
    const site = useSelector(selectSite);

    return (
        <Box
            style={{
                display: "grid",
                gridTemplateRows: `min-content min-content 1fr`,
            }}
            p={5}
            height="100%"
        >
            <Box>
                <Link
                    onClick={() => {
                        history.push(`/flow/site/${slug}/`);
                    }}
                    data-testid="settings-back-link"
                >
                    <Icon name="thickArrowLeft" mr={2} />
                    {t("common.back")}
                </Link>
            </Box>
            {site ? <ReportingContainer site={site} /> : <LoadingWheel />}
        </Box>
    );
}

function ReportingContainer({site}: {site: Site}) {
    const dispatch = useDispatch();
    const {reportingData, loading} = useSelector(selectReporting);
    const reportingDataExpired =
        loading === "succeeded" &&
        reportingData !== null &&
        reportingData.expire_after < Date.now() / 1000;
    const [needToDispatch, , setDispatched] = useToggle(
        loading === "idle" || reportingDataExpired
    );
    const [iframeLoading, , setIframeLoaded] = useToggle(true);
    if (needToDispatch) {
        dispatch(fetchReporting({site: site.id}));
        setDispatched(); // Stop an infinite loop!
    }
    if (loading === "pending") {
        return <LoadingWheel />;
    } else if (loading === "failed" || reportingData === null) {
        return <Text>{t("common.error")}</Text>;
    } else if (!reportingData.iframe_url) {
        return <LoadingWheel />;
    }
    return (
        <>
            <IFrame
                src={reportingData.iframe_url + "#view=FitH"}
                height={window.innerHeight}
                onLoad={setIframeLoaded}
                download={false}
            />
            {iframeLoading && <LoadingWheel />}
        </>
    );
}
