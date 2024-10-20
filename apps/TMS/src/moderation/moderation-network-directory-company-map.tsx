import {setupI18n} from "@dashdoc/web-core";
import {Box, Card, Flex, Icon, LoadingOverlay, Text, theme} from "@dashdoc/web-ui";
import {ThemeProvider} from "@emotion/react";
import styled from "@emotion/styled";
import Leaflet, {LatLngBounds} from "leaflet";
import {debounce} from "lodash";
import React, {useCallback, useMemo, useRef, useState} from "react";
import ReactDOM from "react-dom/client";

import {NetworkMapFilter} from "moderation/components/network/filters/NetworkMapFilter";
import {NetworkMap} from "moderation/components/network/NetworkMap";
import {NetworkMapLegend} from "moderation/components/network/NetworkMapLegend";
import {NetworkMapLoader} from "moderation/components/network/NetworkMapLoader";
import {NetworkMapPopUp} from "moderation/components/network/NetworkMapPopup";
import {DirectoryCompanySimple, NetworkMapPosition} from "moderation/network-map/types";

import {Api} from "./Api";
const DIRECTORY_COMPANY_SCHEMA_URL = "/directory-company/";
const DEFAULT_BOUNDS = {
    sw_x: 15.270996093750002,
    sw_y: 52.58963745123323,
    ne_x: -11.425781250000002,
    ne_y: 40.56381535432877,
};

export function DirectoryCompanyMap() {
    const [companies, setCompanies] = useState<DirectoryCompanySimple[]>([]);
    const [hasLoadedResults, setHasLoadedResults] = useState<boolean>(false);
    const [numberOfCompaniesForThisBounds, setNumberOfCompaniesForThisBounds] =
        useState<number>(0);
    const prevBoundsRef = useRef<LatLngBounds>();
    const prevParamsRef = useRef<string>();

    const initialBounds = new Leaflet.LatLngBounds(
        new Leaflet.LatLng(DEFAULT_BOUNDS.sw_y, DEFAULT_BOUNDS.sw_x),
        new Leaflet.LatLng(DEFAULT_BOUNDS.ne_y, DEFAULT_BOUNDS.ne_x)
    );

    const positions: NetworkMapPosition[] = useMemo(() => {
        return companies.map((company: DirectoryCompanySimple) => {
            return {
                latlng: new Leaflet.LatLng(company.latitude, company.longitude),
                company,
                key: company.id,
            } as NetworkMapPosition;
        });
    }, [companies]);

    const updateCompanies = useCallback((bounds: LatLngBounds, params?: string) => {
        setHasLoadedResults(false);

        if (prevBoundsRef.current && prevBoundsRef.current.equals(bounds) && params == undefined) {
            setHasLoadedResults(true);
            return;
        }
        prevBoundsRef.current = bounds;
        if (params == undefined) {
            params = prevParamsRef.current;
        } else {
            prevParamsRef.current = params;
        }

        const buildQuery = () => {
            const sw = bounds.getSouthWest();
            const ne = bounds.getNorthEast();

            // latitude__lte, latitude__gte, longitude__lte, longitude__gte

            const params_build = params ? `&${params}` : "";

            let query = `?latitude__lte=${ne.lat}&latitude__gte=${sw.lat}&longitude__lte=${ne.lng}&longitude__gte=${sw.lng}${params_build}`;

            // Check if invited_companies is present in params
            if (params && params.includes("invited_companies")) {
                // If invited_companies is present, return the query without ordering to avoid a distinc on group by error
                return query + "&has_loggable_managers=true";
            } else {
                // If invited_companies is not present, add ordering=denomination
                return query + "&ordering=denomination";
            }
        };

        Api.get(DIRECTORY_COMPANY_SCHEMA_URL + buildQuery(), {apiVersion: "web"}).then(
            (response: {count: number; results: DirectoryCompanySimple[]}) => {
                setNumberOfCompaniesForThisBounds(response.count);
                setCompanies(response.results);
                setHasLoadedResults(true);
            }
        );
    }, []);

    const [actualCompany, setActualCompany] = useState<DirectoryCompanySimple>();
    const [leftPanelOpen, setLeftPanelOpen] = useState<boolean>(false);

    return (
        <GlobalContainer display={"flex"} height={"93vh"}>
            <CompanyContainer
                flex={leftPanelOpen ? 2 : 1}
                backgroundColor={"grey.white"}
                borderRadius={2}
                padding={3}
                margin={3}
                boxShadow={"large"}
                display={"flex"}
                flexDirection={"column"}
                justifyContent={"space-between"}
                overflowX={"hidden"}
                overflowY={"auto"}
            >
                <Flex
                    flexDirection={"column"}
                    alignItems="center"
                    justifyContent={"center"}
                    height={"100%"}
                >
                    {actualCompany ? (
                        <NetworkMapPopUp directoryCompany={actualCompany} open={leftPanelOpen} />
                    ) : (
                        <>
                            <Icon name={"info"} color="grey.dark" size={50} />
                            <Text
                                textAlign={"center"}
                                fontSize={3}
                                fontWeight={500}
                                color="grey.dark"
                            >
                                {"No company selected"}
                            </Text>
                        </>
                    )}
                </Flex>
            </CompanyContainer>
            <SeparatorBox
                width={20}
                display={"flex"}
                alignItems={"center"}
                justifyContent={"center"}
            >
                <Icon
                    name={leftPanelOpen ? "arrowLeft" : "arrowRight"}
                    size={12}
                    color="grey.dark"
                    style={{cursor: "pointer"}}
                    onClick={() => {
                        setLeftPanelOpen(!leftPanelOpen);
                    }}
                />
            </SeparatorBox>
            <MapContainer flex={3} display={"flex"} flexDirection={"column"}>
                <Box padding={3}>
                    <NetworkMapFilter
                        actualBounds={prevBoundsRef.current || initialBounds}
                        updateCompanies={updateCompanies}
                    />
                </Box>
                <Card
                    flex={4}
                    position={"relative"}
                    backgroundColor={"grey.white"}
                    borderRadius={2}
                    margin={3}
                    boxShadow={"large"}
                >
                    <LegendContainer>
                        <NetworkMapLegend />
                    </LegendContainer>
                    <NetworkMapLoader numberOfResults={numberOfCompaniesForThisBounds} />

                    {!hasLoadedResults && <LoadingOverlay />}
                    <NetworkMap
                        positions={positions}
                        zoomControl={true}
                        scrollWheelZoom={true}
                        setActualCompany={setActualCompany}
                        updateCompanies={updateCompanies}
                    />
                </Card>
            </MapContainer>
        </GlobalContainer>
    );
}

const GlobalContainer = styled(Box)`
    flex-direction: row;
    z-index: 1;
    position: relative;
    @media (max-width: 1300px) {
        flex-direction: column-reverse;
    }
`;

const LegendContainer = styled(Box)`
    position: absolute;
    bottom: 10px;
    left: 10px;
    z-index: 10000;
`;

const CompanyContainer = styled(Flex)`
    transition: all 0.5s ease-in-out;
    @media (max-width: 1300px) {
        overflow: auto;
    }
`;

const MapContainer = styled(Box)`
    @media (max-width: 1300px) {
        flex: 2;
    }
`;

const SeparatorBox = styled(Box)`
    @media (max-width: 1300px) {
        display: none;
    }
`;

const debouncedRender = debounce(() => {
    const dom = document.getElementById("directory-company-map");
    if (dom) {
        const root = ReactDOM.createRoot(dom);
        root.render(
            <ThemeProvider theme={theme}>
                <DirectoryCompanyMap />
            </ThemeProvider>
        );
    }
}, 250);

setupI18n().then(() => {
    debouncedRender();
});
