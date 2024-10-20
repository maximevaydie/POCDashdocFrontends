import {useFeatureFlag} from "@dashdoc/web-common";
import {t} from "@dashdoc/web-core";
import {
    Box,
    Callout,
    Flex,
    Icon,
    Modal,
    ModeTypeSelector,
    Select,
    SimpleOption,
    Text,
    TextInput,
    TooltipWrapper,
} from "@dashdoc/web-ui";
import {PredefinedLoadCategory, PricingMetricKey} from "dashdoc-utils";
import React, {FC, ReactNode, useMemo, useState} from "react";

import {PricingMetricSelect} from "app/features/pricing/pricing-metrics/PricingMetricsSelect";
import {LinesTypeInfo} from "app/features/pricing/tariff-grids/modals/LinesTypeInfo";
import {tariffGridService} from "app/features/pricing/tariff-grids/tariffGrid.service";
import {getLoadCategoryOptions} from "app/features/transport/load/load-form/load-form.helpers";
import useCompanyIsQualimat from "app/hooks/useCompanyIsQualimat";
import {getMetricDisplayUnit} from "app/services/invoicing";
import {loadService} from "app/services/transport";

import {TariffGrid, TariffGridLinesType, TariffGridOwnerType} from "../types";

import {modalService} from "./modal.service";

type CreationModalProps = {
    ownerType: TariffGridOwnerType;
    onClose: () => unknown;
    afterCreation: (tariffGrid: TariffGrid) => unknown;
};

export function CreationModal({ownerType, onClose, afterCreation}: CreationModalProps) {
    const hasPurchaseTariffGridsEnabled = useFeatureFlag("purchaseTariffGrids");

    const [isLoading, setIsLoading] = useState(false);
    const [name, setName] = useState("");
    const [loadCategory, setLoadCategory] = useState<SimpleOption<PredefinedLoadCategory> | null>(
        null
    );
    const [pricingMetric, setPricingMetric] = useState<SimpleOption<PricingMetricKey> | null>(
        null
    );

    const [linesType, setLinesType] = useState<TariffGridLinesType | null>(null);

    const isQualimat = useCompanyIsQualimat();

    const loadCategoryOptions = useMemo(() => getLoadCategoryOptions({isQualimat}), [isQualimat]);

    const isMainButtonDisabled = useMemo(
        () => isLoading || name === "" || loadCategory === null || linesType === null,
        [isLoading, name, loadCategory, linesType]
    );

    const allowedMetrics = useMemo(() => {
        if (loadCategory) {
            return ORDERED_ALLOWED_PRICING_METRIC.filter((metric) =>
                loadService.isValid(loadCategory.value, metric)
            );
        }

        return ORDERED_ALLOWED_PRICING_METRIC;
    }, [loadCategory]);

    return (
        <Modal
            title={t(
                !hasPurchaseTariffGridsEnabled
                    ? "tariffGrids.CreationModalTitle"
                    : ownerType === TariffGridOwnerType.CARRIER
                      ? "tariffGrids.CreationModalTitleCarrier"
                      : "tariffGrids.CreationModalTitleShipper"
            )}
            mainButton={{
                disabled: isMainButtonDisabled,
                "data-testid": "tariff-grid-creation-modal-create-tariff-grid-button",
                onClick: handleConfirm,
            }}
            secondaryButton={{
                onClick: onClose,
            }}
            onClose={onClose}
            minWidth="900px"
        >
            <Callout mb={4}>
                <Text>{t("tariffGrids.CreationHelp")}</Text>
            </Callout>
            <Flex flexDirection="row" style={{gap: "20px"}}>
                <Flex flexDirection="column" flexGrow={1} style={{gap: "10px"}}>
                    <Text variant="h1">{t("tariffGrids.GeneralCreationSetting")}</Text>
                    <TextInput
                        required={true}
                        data-testid={"tariff-grid-creation-modal-name-input"}
                        label={t("tariffGrids.TariffGridName")}
                        value={name}
                        onChange={(newValue) => {
                            setName(newValue);
                        }}
                    />
                    <Text variant="h1">{t("tariffGrids.OtherCreationSetting")}</Text>
                    <Text style={{fontWeight: "bold"}}>
                        {t("tariffGrids.LoadCreationSetting")}
                    </Text>
                    <Select<SimpleOption<PredefinedLoadCategory>, false>
                        isClearable={false}
                        required={true}
                        data-testid={"tariff-grid-creation-modal-load-category-input"}
                        label={t("tariffGrids.LoadCategory")}
                        value={loadCategory}
                        options={loadCategoryOptions}
                        onChange={(resp) => setLoadCategory(resp)}
                    />
                    {loadCategory?.value && (
                        <PricingMetricSelect
                            required
                            label={t("tariffGrids.PricingMetrics")}
                            dataTestId={"tariff-grid-creation-modal-pricing-metric-input"}
                            value={pricingMetric}
                            allowedMetrics={allowedMetrics}
                            customSort={local_compare_pricing_metric}
                            onChange={(newPricingMetric) => {
                                setPricingMetric(newPricingMetric);
                            }}
                        />
                    )}
                    <Text variant="h1">
                        {t("tariffGrids.LinesTypeSection", undefined, {capitalize: true})}
                    </Text>
                    <ModeTypeSelector<TariffGridLinesType>
                        modeList={[
                            {
                                value: "distance_range_in_km",
                                label: tariffGridService.getLinesTypeLabel("distance_range_in_km"),
                                icon: "distanceRange",
                            },
                            {
                                value: "zones",
                                label: tariffGridService.getLinesTypeLabel("zones"),
                                icon: "mapsMarker",
                            },
                        ]}
                        currentMode={linesType}
                        setCurrentMode={setLinesType}
                    />
                    {linesType && <LinesTypeInfo linesType={linesType} />}
                </Flex>
                <Box
                    minWidth="500px"
                    width="500px"
                    border="1px solid"
                    borderColor="grey.light"
                    borderRadius={1}
                    p={4}
                >
                    <Help
                        linesType={linesType}
                        pricingMetric={pricingMetric?.value ?? null}
                        stepText={
                            t("tariffGrids.GoodSteps", undefined, {capitalize: true}) +
                            (loadCategory === null ? "" : " (" + loadCategory.label + ")")
                        }
                        cellText={t("tariffGrids.YourPrices", undefined, {capitalize: true})}
                        displayPriceHelper={pricingMetric !== null}
                        displayLineHelper={linesType !== null}
                        displayColumnHelper={loadCategory !== null}
                    />
                </Box>
            </Flex>
        </Modal>
    );

    async function handleConfirm() {
        setIsLoading(true);
        if (
            loadCategory === null ||
            loadCategory.value === undefined ||
            pricingMetric === null ||
            linesType === null ||
            pricingMetric.value === undefined
        ) {
            setIsLoading(false);
            return;
        }
        const tariffGrid = await modalService.create({
            name,
            owner_type: ownerType,
            loadCategory: loadCategory.value,
            pricingMetric: pricingMetric.value,
            lines_type: linesType,
            status: "active",
        });
        setIsLoading(false);
        afterCreation(tariffGrid);
    }
}

const ORDERED_ALLOWED_PRICING_METRIC: PricingMetricKey[] = [
    // "FLAT", // don't allow flat since flat prices can be set directly in the grid
    // "DISTANCE_IN_KM", //We don't allow this one because it creates confusion with the distance in the zone
    "LOADED_WEIGHT_IN_TONNE",
    "UNLOADED_WEIGHT_IN_TONNE",
    "LOADED_WEIGHT_IN_KG",
    "UNLOADED_WEIGHT_IN_KG",
    "LOADED_QUANTITY",
    "UNLOADED_QUANTITY",
    "LOADED_LINEAR_METERS",
    "UNLOADED_LINEAR_METERS",
    "LOADED_VOLUME_IN_M3",
    "UNLOADED_VOLUME_IN_M3",
    "LOADED_VOLUME_IN_LITRE",
    "UNLOADED_VOLUME_IN_LITRE",
    "LOADED_STERES",
    "UNLOADED_STERES",
    "DURATION_IN_HOUR",
    "DURATION_IN_MINUTE",
];

const local_compare_pricing_metric = (
    a: SimpleOption<PricingMetricKey>,
    b: SimpleOption<PricingMetricKey>
) => {
    if (
        !ORDERED_ALLOWED_PRICING_METRIC.includes(a.value) ||
        !ORDERED_ALLOWED_PRICING_METRIC.includes(b.value)
    ) {
        return a.label.localeCompare(b.label);
    }
    return (
        ORDERED_ALLOWED_PRICING_METRIC.indexOf(a.value) -
        ORDERED_ALLOWED_PRICING_METRIC.indexOf(b.value)
    );
};

const HelpTooltip: FC<{
    title: ReactNode;
    helpText: ReactNode;
    illustration?: ReactNode;
    placement?: "top" | "right" | "bottom" | "left";
}> = ({placement, title, helpText, illustration}) => {
    if (illustration === undefined) {
        return (
            <TooltipWrapper
                content={
                    <Flex width={200} flexDirection={"column"}>
                        <Text>{title}</Text>
                        <Text variant="subcaption">{helpText}</Text>
                    </Flex>
                }
                placement={placement}
                boxProps={{display: "inline"}}
            >
                <Icon name="questionCircle" color="blue.default" />
            </TooltipWrapper>
        );
    }

    return (
        <TooltipWrapper
            content={
                <Flex minWidth={200} flexDirection={"row"}>
                    <Flex flexDirection={"column"} width={200} marginRight={2}>
                        <Text>{title}</Text>
                        <Flex flexGrow={1} flexDirection={"column"} justifyContent={"center"}>
                            <Text variant="subcaption">{helpText}</Text>
                        </Flex>
                    </Flex>
                    <Flex>{illustration}</Flex>
                </Flex>
            }
            placement={placement}
            boxProps={{display: "inline"}}
        >
            <Icon name="questionCircle" color="blue.default" />
        </TooltipWrapper>
    );
};

function HandwrittenText({children}: {children: ReactNode}) {
    return (
        <Text fontFamily={"handwritten"} fontSize={5} color="grey.dark" fontWeight="400">
            {children}
        </Text>
    );
}

const helpZoneText = (zoneId: number) => {
    return `${t("tariffGrids.HelpZoneText")} ${zoneId}`;
};

const distanceRangeText = (distance: number) => {
    return `➝ ${distance} km`;
};

const lineHelperTexts = (
    linesType: TariffGridLinesType | null
): [string, string, string, string] => {
    if (linesType === "zones") {
        return [helpZoneText(35), helpZoneText(44), helpZoneText(75), helpZoneText(95)];
    }
    if (linesType === "distance_range_in_km") {
        return [
            distanceRangeText(25),
            distanceRangeText(75),
            distanceRangeText(150),
            distanceRangeText(500),
        ];
    }
    return ["", "", "", ""];
};

const columnHelperTexts = (
    columnUnit: string
): Readonly<[string, string, string, string, string]> => {
    const unitlessList = ["➝ 5", "➝ 10", "➝ 20", "➝ 50", "➝ 100"] as const;
    if (columnUnit === "") {
        return unitlessList;
    }
    return unitlessList.map((unitless) => `${unitless} ${columnUnit}`) as [
        string,
        string,
        string,
        string,
        string,
    ];
};

const Help: FC<{
    linesType: TariffGridLinesType | null;
    stepText: string;
    cellText: string;
    pricingMetric: PricingMetricKey | null;
    displayPriceHelper: boolean;
    displayLineHelper: boolean;
    displayColumnHelper: boolean;
}> = ({
    linesType,
    stepText,
    cellText,
    pricingMetric,
    displayColumnHelper,
    displayLineHelper,
    displayPriceHelper,
}) => {
    let column_unit: string = "";
    let cell_unit: string | null = null;
    if (pricingMetric !== null) {
        column_unit = getMetricDisplayUnit(pricingMetric) ?? "";
        cell_unit = column_unit === "" ? "€" : `€/${column_unit}`;
    }

    const linesText =
        linesType !== null
            ? tariffGridService.getLinesTypeLabel(linesType)
            : t("tariffGrids.LinesTypeSection", undefined, {capitalize: true});

    const [line1, line2, line3, line4] = lineHelperTexts(linesType);

    const [column1, column2, column3, column4, column5] = columnHelperTexts(column_unit);

    return (
        <Box width="446px" height="393px" position={"relative"}>
            <svg width="446" height="393" viewBox="0 0 446 393" fill="none">
                <foreignObject x="205" y="0" width="225" height="200">
                    <HandwrittenText>{stepText}</HandwrittenText>
                </foreignObject>

                <rect x="0.5" y="74.5" width="434" height="24" fill="#DFE3E8" stroke="#C4CDD5" />
                <rect x="0.5" y="98.5" width="69" height="214" fill="#F4F6F8" stroke="#C4CDD5" />
                <line x1="83" y1="133.5" x2="417" y2="133.5" stroke="#DFE3E8" />
                <line x1="83" y1="241.5" x2="311" y2="241.5" stroke="#DFE3E8" />
                <line x1="83" y1="169.5" x2="376" y2="169.5" stroke="#DFE3E8" />
                <line x1="83" y1="277.5" x2="240" y2="277.5" stroke="#DFE3E8" />
                <line x1="83" y1="205.5" x2="349" y2="205.5" stroke="#DFE3E8" />
                <line x1="356.5" y1="108" x2="356.5" y2="185" stroke="#DFE3E8" />
                <line x1="158.5" y1="108" x2="158.5" y2="304" stroke="#DFE3E8" />
                <line x1="290.5" y1="108" x2="290.5" y2="235" stroke="#DFE3E8" />
                <line x1="92.5" y1="108" x2="92.5" y2="304" stroke="#DFE3E8" />
                <line x1="224.5" y1="108" x2="224.5" y2="270" stroke="#DFE3E8" />
                <g clipPath="url(#clip0_313_20364)">
                    <path
                        d="M178.537 20.3962C168.664 18.0529 155.798 19.1085 146.598 23.0278C130.943 29.7011 117.793 43.5527 112.339 59.7675C111.518 53.6575 110.696 47.5475 109.875 41.4404C109.621 39.5492 106.766 40.3593 107.015 42.2248C108.085 50.1746 109.153 58.1188 110.222 66.0671C110.387 67.2894 111.957 67.3322 112.699 66.7189C119.359 61.2265 126.021 55.7341 132.683 50.2417C134.158 49.0251 132.049 46.9385 130.585 48.1466C125.415 52.4067 120.247 56.6697 115.076 60.9356C119.995 46.0928 131.532 33.7801 145.434 26.8216C153.576 22.7468 162.814 20.8471 171.889 21.8112C176.232 22.2733 182.812 24.4852 186.5 26.8213C189.621 28.7981 194.457 31.5191 194.5 35.4998C194.52 37.4109 196.227 37.886 196.207 35.9735C196.116 27.312 185.755 22.1077 178.537 20.3962Z"
                        fill="#C4CDD5"
                    />
                </g>
                <g transform="translate(50)">
                    <path
                        d="M76.5374 372.604C66.6636 374.947 53.7982 373.891 44.5976 369.972C28.9433 363.299 15.7935 349.447 10.3396 333.233C9.51805 339.342 8.69654 345.452 7.87503 351.56C7.62116 353.451 4.76585 352.641 5.01544 350.775C6.08511 342.825 7.15336 334.881 8.2216 326.933C8.38705 325.711 9.95733 325.668 10.699 326.281C17.3595 331.773 24.0214 337.266 30.6833 342.758C32.158 343.975 30.0486 346.061 28.5853 344.853C23.4152 340.593 18.2466 336.33 13.0765 332.064C17.9956 346.907 29.5323 359.22 43.4338 366.178C51.5761 370.253 60.8138 372.153 69.8889 371.189C74.2318 370.727 80.8118 368.515 84.5 366.179C87.6206 364.202 92.4572 361.481 92.5 357.5C92.52 355.589 94.2269 355.114 94.2069 357.027C94.1156 365.688 83.7555 370.892 76.5374 372.604Z"
                        fill="#C4CDD5"
                    />
                    <foreignObject x="101" y="345" width="330" height="200">
                        <HandwrittenText>{linesText}</HandwrittenText>
                    </foreignObject>
                </g>
                <g transform="translate(27,8)">
                    <path
                        d="M308.163 259.992C294.81 258.622 281.668 254.677 271.058 246.209C263.325 240.035 257.73 231.636 254.305 222.407C251.845 215.782 250.555 208.721 250.174 201.675C250.084 200.026 250.03 198.35 250.053 196.681C247.795 200.681 245.544 204.697 243.069 208.548C242.17 209.947 239.928 208.649 240.835 207.24C244.282 201.876 247.297 196.186 250.501 190.671C251.015 189.783 252.2 189.887 252.735 190.671C256.476 196.136 260.216 201.602 263.957 207.07C264.902 208.451 262.658 209.744 261.721 208.376C258.699 203.961 255.68 199.548 252.658 195.131C251.978 205.321 254.181 216.241 258.301 225.388C261.898 233.373 267.42 240.392 274.481 245.599C284.238 252.789 296.237 256.179 308.163 257.401C309.807 257.571 309.823 260.16 308.163 259.992Z"
                        fill="#C4CDD5"
                    />
                    <foreignObject x="321" y="245" width="110" height="200">
                        <HandwrittenText>{cellText}</HandwrittenText>
                    </foreignObject>
                </g>

                {/* line helpers*/}
                {displayLineHelper && (
                    <>
                        <foreignObject x="7" y="140" width="100" height="50">
                            <Text variant="caption" color="grey.dark">
                                {line1}
                            </Text>
                        </foreignObject>
                        <foreignObject x="7" y="175" width="100" height="50">
                            <Text variant="caption" color="grey.dark">
                                {line2}
                            </Text>
                        </foreignObject>
                        <foreignObject x="7" y="210" width="100" height="50">
                            <Text variant="caption" color="grey.dark">
                                {line3}
                            </Text>
                        </foreignObject>
                        <foreignObject x="7" y="248" width="100" height="50">
                            <Text variant="caption" color="grey.dark">
                                {line4}
                            </Text>
                        </foreignObject>
                    </>
                )}

                {/* column helpers*/}
                {displayColumnHelper && (
                    <>
                        <foreignObject x="53" y="75" width="100" height="50">
                            <Text
                                variant="caption"
                                color="grey.dark"
                                position="absolute"
                                right={"0px"}
                            >
                                {column1}
                            </Text>
                        </foreignObject>
                        <foreignObject x="119" y="75" width="100" height="50">
                            <Text
                                variant="caption"
                                color="grey.dark"
                                position="absolute"
                                right={"0px"}
                            >
                                {column2}
                            </Text>
                        </foreignObject>
                        <foreignObject x="187" y="75" width="100" height="50">
                            <Text
                                variant="caption"
                                color="grey.dark"
                                position="absolute"
                                right={"0px"}
                            >
                                {column3}
                            </Text>
                        </foreignObject>
                        <foreignObject x="250" y="75" width="100" height="50">
                            <Text
                                variant="caption"
                                color="grey.dark"
                                position="absolute"
                                right={"0px"}
                            >
                                {column4}
                            </Text>
                        </foreignObject>
                        <foreignObject x="310" y="75" width="100" height="50">
                            <Text
                                variant="caption"
                                color="grey.dark"
                                position="absolute"
                                right={"0px"}
                            >
                                {column5}
                            </Text>
                        </foreignObject>
                    </>
                )}
                {/* price unit*/}

                {displayPriceHelper && (
                    <>
                        <foreignObject x="53" y="175" width="100" height="50">
                            <Text
                                variant="caption"
                                color="grey.dark"
                                position="absolute"
                                right={"0px"}
                            >
                                {cell_unit}
                            </Text>
                        </foreignObject>
                        <foreignObject x="119" y="175" width="100" height="50">
                            <Text
                                variant="caption"
                                color="grey.dark"
                                position="absolute"
                                right={"0px"}
                            >
                                {cell_unit}
                            </Text>
                        </foreignObject>
                        <foreignObject x="187" y="175" width="100" height="50">
                            <Text
                                variant="caption"
                                color="grey.dark"
                                position="absolute"
                                right={"0px"}
                            >
                                {cell_unit}
                            </Text>
                        </foreignObject>
                        <foreignObject x="250" y="175" width="100" height="50">
                            <Text
                                variant="caption"
                                color="grey.dark"
                                position="absolute"
                                right={"0px"}
                            >
                                {cell_unit}
                            </Text>
                        </foreignObject>
                    </>
                )}
                <defs>
                    <clipPath id="clip0_313_20364">
                        <rect width="87" height="87" fill="white" transform="translate(107)" />
                    </clipPath>
                </defs>
            </svg>

            {displayPriceHelper && (
                <Box position={"absolute"} top={"180px"} left={"237px"} display={"inline"}>
                    <HelpTooltip
                        placement="bottom"
                        title={t("tariffGrids.PriceUnitTooltipTitle")}
                        helpText={t("tariffGrids.priceUnitHelpText")}
                    />
                </Box>
            )}

            {displayColumnHelper && (
                <Box position={"absolute"} top={"78px"} left={"440px"} display={"inline"}>
                    <HelpTooltip
                        placement="left"
                        title={t("tariffGrids.LoadsStepTooltipTitle")}
                        helpText={t("tariffGrids.LoadsStepHelpText")}
                    />
                </Box>
            )}
        </Box>
    );
};
