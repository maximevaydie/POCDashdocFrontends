import {TrackedLink, useTimezone} from "@dashdoc/web-common";
import {t} from "@dashdoc/web-core";
import {
    Box,
    Checkbox,
    DatePicker,
    Flex,
    Icon,
    LoadingWheel,
    Modal,
    NumberInput,
    Table,
    Text,
    TooltipWrapper,
} from "@dashdoc/web-ui";
import {DayOfWeek, DaysOfWeek, DaysOfWeekPicker} from "@dashdoc/web-ui";
import styled from "@emotion/styled";
import {formatDate, parseAndZoneDate, useToggle, zoneDateToISO} from "dashdoc-utils";
import {addDays, differenceInDays} from "date-fns";
import React, {useCallback, useEffect, useState} from "react";

import {useSelector} from "app/redux/hooks";
import {getFullTransport} from "app/redux/selectors";
import {
    DuplicationParams,
    DuplicationPreviewTransportNumber,
    massDuplicateTransportPreview,
    Period,
} from "app/services/transport";

const WeekDayValue: {[day in DayOfWeek]: number} = {
    monday: 0,
    tuesday: 1,
    wednesday: 2,
    thursday: 3,
    friday: 4,
    saturday: 5,
    sunday: 6,
};

const StyledNumberInput = styled(NumberInput)`
    width: 50px;
    padding-right: 2px;
    padding-left: 2px;
    margin: 5px;
`;

type TransportMultipleDuplicationModalProps = {
    onClose: () => void;
    onSubmit: (params: DuplicationParams) => Promise<Response>;
    transportNumber: number;
    transportUid: string;
};

function TransportMultipleDuplicationModal({
    onClose,
    onSubmit,
    transportNumber,
    transportUid,
}: TransportMultipleDuplicationModalProps) {
    const timezone = useTimezone();
    const [isLoading, load, unload] = useToggle();
    const [keepHours, setKeepHours] = useState(false);
    const [keepTruckerAndPlates, setKeepTruckerAndPlates] = useState(true);
    const [beginDate, setBeginDate] = useState(new Date());
    const [endDate, setEndDate] = useState(new Date());
    const [period, setPeriod] = useState<Period>("weeks");
    const [includeWeekEnd, setIncludeWeekEnd] = useState(false);
    const [duplicateEveryX, setDuplicateEveryX] = useState<number | null>(1);
    const [transportsPerDay, setTransportsPerDay] = useState<number | null>(1);
    const [daysOfWeek, setDaysOfWeek] = useState<DaysOfWeek>({
        monday: true,
        tuesday: true,
        wednesday: true,
        thursday: true,
        friday: true,
        saturday: false,
        sunday: false,
    });
    const [submitError, setSubmitError] = useState<string | null>(null);

    const [previewTransports, setPreviewTransports] = useState<
        DuplicationPreviewTransportNumber[]
    >([]);
    const [previewLoading, setPreviewLoading] = useState(false);

    const daysBetweenAskedAndPlannedDate: number | null = useSelector((state) => {
        if (!state.entities.transports) {
            return null;
        }
        const transport = getFullTransport(state, transportUid);
        const scheduledStartISO = transport.segments[0].scheduled_start_range?.start;
        const askedStartISO = transport.segments[0].origin.slots?.[0]?.start;
        const scheduledZonedDate = parseAndZoneDate(scheduledStartISO, timezone);
        const askedZonedDate = parseAndZoneDate(askedStartISO, timezone);
        if (!scheduledZonedDate) {
            return null;
        }
        if (!askedZonedDate) {
            return 0;
        }
        scheduledZonedDate.setHours(0, 0, 0, 0);
        askedZonedDate.setHours(0, 0, 0, 0);
        return differenceInDays(scheduledZonedDate, askedZonedDate);
    });

    const getParams = useCallback((): DuplicationParams => {
        let weekDays: number[] = [];

        if (period === "weeks") {
            for (const [key, value] of Object.entries(daysOfWeek)) {
                if (value) {
                    weekDays.push(WeekDayValue[key as DayOfWeek]);
                }
            }
        }
        return {
            keep_hours: keepHours,
            keep_trucker_and_plates: keepTruckerAndPlates,
            begin_date: zoneDateToISO(beginDate, timezone),
            end_date: zoneDateToISO(endDate, timezone),
            period: period,
            week_days: weekDays,
            duplicate_every_x: duplicateEveryX,
            weekend_included: includeWeekEnd,
            transports_per_day: transportsPerDay,
        } as DuplicationParams;
    }, [
        keepHours,
        keepTruckerAndPlates,
        beginDate,
        endDate,
        timezone,
        period,
        duplicateEveryX,
        includeWeekEnd,
        daysOfWeek,
        transportsPerDay,
    ]);

    useEffect(() => {
        (async function () {
            setPreviewLoading(true);
            setSubmitError(null);
            const params = getParams();
            try {
                let transportsByDate = await massDuplicateTransportPreview(transportUid, params);
                setPreviewTransports(transportsByDate);
            } catch (error) {
                let json = await error.json();
                setPreviewTransports([]);
                if (json.tooManyDuplications?.code?.[0] === "duplication_error") {
                    const max = json.tooManyDuplications?.detail?.[0];
                    setSubmitError(t("components.error.tooManyTransportDuplications", {max: max}));
                } else {
                    setSubmitError(t("common.error"));
                }
            }
            setPreviewLoading(false);
        })();
    }, [
        keepHours,
        keepTruckerAndPlates,
        beginDate,
        endDate,
        period,
        duplicateEveryX,
        includeWeekEnd,
        daysOfWeek,
        transportUid,
        getParams,
    ]);

    const handleDaysOfWeekChange = (day: DayOfWeek, status: boolean) => {
        setDaysOfWeek({...daysOfWeek, [day]: status});
    };
    const handleBeginDateChange = (beginDate: Date) => {
        setBeginDate(beginDate);
        if (beginDate > endDate) {
            setEndDate(beginDate);
        }
    };
    const handleEndDateChange = (endDate: Date) => {
        setEndDate(endDate);
        if (endDate < beginDate) {
            setBeginDate(endDate);
        }
    };

    const handleSubmit = async () => {
        let weekDays: number[] = [];

        if (period === "weeks") {
            for (const [key, value] of Object.entries(daysOfWeek)) {
                if (value) {
                    weekDays.push(WeekDayValue[key as DayOfWeek]);
                }
            }
        }
        const params: DuplicationParams = {
            keep_hours: keepHours,
            keep_trucker_and_plates: keepTruckerAndPlates,
            begin_date: zoneDateToISO(beginDate, timezone),
            end_date: zoneDateToISO(endDate, timezone),
            period: period,
            week_days: weekDays,
            duplicate_every_x: duplicateEveryX || 1,
            weekend_included: includeWeekEnd,
            transports_per_day: transportsPerDay || 1,
        };
        load();
        try {
            setSubmitError(null);
            await onSubmit(params);
        } catch (error) {
            setSubmitError(t("common.error"));
        }
        unload();
    };

    return (
        <Modal
            title={
                <Flex>
                    <Text variant="title">{t("components.duplicateTransportModalTitle")}</Text>
                    &nbsp;
                    <TrackedLink
                        to={`/app/transports/${transportUid}/`}
                        target="_blank"
                        rel="noopener noreferrer"
                        data-testid="duplicate-modal-link"
                        style={{fontSize: "20px", lineHeight: "27px"}}
                    >
                        {t("components.transportNumber", {
                            number: transportNumber,
                        }).toLowerCase()}
                    </TrackedLink>
                </Flex>
            }
            id="transport-duplication-modal"
            onClose={!isLoading ? onClose : undefined}
            mainButton={{
                children: t("components.createCopies"),
                onClick: handleSubmit,
                loading: isLoading,
                disabled: isLoading || !!submitError,
                "data-testid": "duplicate-modal-submit",
            }}
            secondaryButton={{
                disabled: isLoading,
                "data-testid": "duplicate-modal-cancel",
            }}
        >
            <Box>
                {/* Keeper checkboxes */}
                <Text variant="h2" mb={2}>
                    {t("transportDuplicaton.options")}
                </Text>
                <Checkbox
                    key={"duplicate-transport-keep-hours"}
                    data-testid="duplicate-transport-keep-hours"
                    label={
                        <Flex alignItems="center">
                            <Text>{t("transportDuplication.keepScheduledData")}</Text>
                            <TooltipWrapper
                                boxProps={{display: "flex", alignItems: "center"}}
                                content={t("transportDuplication.keepScheduledData.explanations")}
                            >
                                <Icon ml={2} name="info" />
                            </TooltipWrapper>
                        </Flex>
                    }
                    checked={keepHours}
                    onChange={setKeepHours}
                />

                <Checkbox
                    key={"duplicate-transport-keep-driver-and-plates"}
                    label={t("components.keepDriverAndPlates")}
                    checked={keepTruckerAndPlates}
                    onChange={setKeepTruckerAndPlates}
                />

                <Text variant="h2" mb={2} mt={4}>
                    {t("transportDuplication.parameters")}
                </Text>
                {/* Date pickers container */}
                <Flex alignItems="center">
                    <Flex flexDirection="column" height={90} justifyContent="space-evenly">
                        <Text>{t("components.beginDate")}</Text>
                        <Text>{t("components.endDate")}</Text>
                    </Flex>
                    <Flex flexDirection="column" height={90} ml={10} justifyContent="space-evenly">
                        <DatePicker
                            onChange={handleBeginDateChange}
                            date={beginDate}
                            rootId="react-app-modal-root"
                            data-testid="begin-date-picker"
                        />
                        <DatePicker
                            onChange={handleEndDateChange}
                            date={endDate}
                            rootId="react-app-modal-root"
                            data-testid="end-date-picker"
                        />
                    </Flex>
                </Flex>

                {/* Main settings */}
                <div className="radio">
                    <label>
                        <input
                            type="radio"
                            checked={period === "weeks"}
                            onChange={() => setPeriod("weeks")}
                        />
                        {t("components.chooseDaysInWeek")}
                    </label>
                </div>
                {period === "weeks" && (
                    <Flex>
                        <Box
                            borderLeft="1px solid"
                            borderColor="grey.light"
                            height="70px"
                            m="5px"
                            mr="15px"
                        />
                        <Box>
                            <Text m="10px">{t("components.daysForDuplicatedTransports")}</Text>
                            <DaysOfWeekPicker
                                daysOfWeek={daysOfWeek}
                                onChange={handleDaysOfWeekChange}
                            />
                        </Box>
                    </Flex>
                )}
                <div className="radio">
                    <label>
                        <input
                            type="radio"
                            checked={period === "days"}
                            onChange={() => setPeriod("days")}
                        />
                        {t("components.chooseDayInterval")}
                    </label>
                </div>
                {period === "days" && (
                    <Flex>
                        <Box
                            borderLeft="1px solid"
                            borderColor="grey.light"
                            height="90px"
                            m="5px"
                            mr="15px"
                        />
                        <Box justifyContent="center" alignItems="baseline" m="10px">
                            <Flex alignItems="center" mr="10px">
                                {t("components.everyX")}
                                <StyledNumberInput
                                    className="form-control"
                                    value={duplicateEveryX}
                                    onChange={setDuplicateEveryX}
                                />
                                <Box>{t("common.day")}</Box>
                            </Flex>
                            <Checkbox
                                label={t("components.includeWeekEnd")}
                                onChange={setIncludeWeekEnd}
                                checked={includeWeekEnd}
                            />
                        </Box>
                    </Flex>
                )}
                <Flex alignItems="center" m="5px">
                    <Text>{t("components.numberOfTransportsPerDay")}</Text>
                    <StyledNumberInput
                        className="form-control"
                        value={transportsPerDay}
                        onChange={setTransportsPerDay}
                        maxDecimals={0}
                    />
                </Flex>

                {/* Preview */}
                {previewTransports.length > 0 && (
                    <Box mt={3} bg="grey.light" p={2} zIndex={"level0"} position="relative">
                        <NumberOfPreview previewTransports={previewTransports} />
                        {previewLoading && <LoadingWheel small noMargin />}
                        {!previewLoading && (
                            <TransportsPreviewTable
                                previewTransports={previewTransports}
                                daysBetweenAskedAndPlannedDate={daysBetweenAskedAndPlannedDate}
                                keepHours={keepHours}
                            />
                        )}
                    </Box>
                )}

                {submitError && (
                    <Flex className="alert alert-danger" role="alert">
                        <Text>{submitError}</Text>
                    </Flex>
                )}
            </Box>
        </Modal>
    );
}

function NumberOfPreview({
    previewTransports,
}: {
    previewTransports: DuplicationPreviewTransportNumber[];
}) {
    return (
        <Flex mb={2}>
            <Text fontWeight="600">
                {t("transportDuplication.numberOfTransportsPreviewLabel")}
            </Text>
            <Text ml={3}>
                {t("transportDuplication.numberOfCopies", {
                    smart_count: previewTransports.reduce(
                        (sum, transportPreview) => sum + transportPreview[1],
                        0
                    ),
                })}
            </Text>
        </Flex>
    );
}

function TransportsPreviewTable({
    previewTransports,
    daysBetweenAskedAndPlannedDate,
    keepHours,
}: {
    previewTransports: DuplicationPreviewTransportNumber[];
    daysBetweenAskedAndPlannedDate: number | null;
    keepHours: boolean;
}) {
    const timezone = useTimezone();

    const transportPreviewColumns = [
        {
            name: "askedDate",
            label: t("common.askedDate"),
        },
        {
            name: "scheduledDate",
            label: t("common.plannedDate"),
        },
        {
            name: "numberOfCopies",
            label: t("common.numberOfCopies"),
        },
    ];

    const getRowCellContent = (
        transport: DuplicationPreviewTransportNumber,
        columnName: string
    ) => {
        const [dateString, numberOfTransport] = transport;
        const zonedDate = parseAndZoneDate(dateString, timezone) as Date;

        switch (columnName) {
            case "askedDate":
                return formatDate(zonedDate, "dd/MM/yyyy");
            case "scheduledDate":
                return keepHours && daysBetweenAskedAndPlannedDate !== null
                    ? formatDate(addDays(zonedDate, daysBetweenAskedAndPlannedDate), "dd/MM/yyyy")
                    : "--";
            case "numberOfCopies":
                return numberOfTransport;
            default:
                return null;
        }
    };

    return (
        <Table
            columns={transportPreviewColumns}
            rows={previewTransports}
            getRowCellContent={getRowCellContent}
            data-testid="duplicate-transports-preview-table"
            getRowTestId={() => "duplicate-transport-row"}
        />
    );
}

export default TransportMultipleDuplicationModal;
