import {useTimezone} from "@dashdoc/web-common";
import {getLoadCategoryLabel, t} from "@dashdoc/web-core";
import {
    Box,
    Button,
    DatePicker,
    ErrorMessage,
    Flex,
    Radio,
    Select,
    Text,
    SelectOption,
} from "@dashdoc/web-ui";
import {
    CleaningRegime,
    IDTFNumbers,
    QualimatEvent,
    TransportMessagePost,
    yup,
    zoneDateToISO,
    PREDEFINED_LOAD_CATEGORIES,
    type QualimatCleaningEvent,
    type QualimatLoadingEvent,
} from "dashdoc-utils";
import {useFormik} from "formik";
import React, {useMemo} from "react";
import {useDispatch} from "react-redux";

import {
    CleaningQualimatEventPost,
    QualimatEventPost,
} from "app/features/settings/qualimat/qualimat-events.types";
import QualimatCleaningForm, {
    getCleaningField,
} from "app/features/settings/qualimat/QualimatCleaningForm";
import TransportSelect from "app/features/settings/qualimat/TransportSelect";
import {fetchAddDocument} from "app/redux/actions";

import type {Load} from "app/types/transport";
type QualimatAddEventProps = {
    onSave: (event: Partial<QualimatEvent>) => void;
    onCancel: () => void;
    fleetType: "vehicles" | "trailers";
    fleetItemId: number;
    fromTransportUid?: string;
};

function getEventAndTransportMessage(
    event_data: QualimatEventPost,
    timezone: string
): {event: QualimatEvent; message: TransportMessagePost | null} {
    const {date, category, loading, cleaning, transportUid} = event_data;
    const {detergentField, disinfectantField, washingNoteField} = getCleaningField(
        cleaning.method
    );
    const zonedISODate = zoneDateToISO(date, timezone);
    if (category === "cleaning") {
        return {
            event: {
                created_device: zonedISODate,
                category,
                details: {
                    cleaning: {
                        method: cleaning.method,
                        detergent: detergentField.show ? cleaning.detergent : undefined,
                        disinfectant: disinfectantField.show ? cleaning.disinfectant : undefined,
                    },
                },
                transport: transportUid,
            } /* We should have a dedicated type */ as any as QualimatCleaningEvent,
            message:
                washingNoteField.show && cleaning.washingNote
                    ? ({
                          document: cleaning.washingNote,
                          type: "document",
                          document_type: "washing_note",
                          document_title: cleaning.washingNote.name,
                          reference: "",
                          site: null,
                          visible_by_everyone: true,
                          readable_by_trucker: true,
                      } as TransportMessagePost)
                    : null,
        };
    } else if (category === "loading") {
        const detailsCategory: Load["category"] = PREDEFINED_LOAD_CATEGORIES.includes(
            loading.loadType as Load["category"]
        )
            ? (loading.loadType as Load["category"])
            : ("other" as Load["category"]);
        return {
            event: {
                created_device: zonedISODate,
                category,
                details: {
                    loading: {
                        idtf_number: loading.idtfNumber,
                        category: detailsCategory,
                    },
                },
                transport: transportUid,
            } /* We should have a dedicated type */ as any as QualimatLoadingEvent,
            message: null,
        };
    }
    throw Error("Invalid category");
}

export default function QualimatAddEvent({
    onSave,
    onCancel,
    fleetType,
    fleetItemId,
    fromTransportUid,
}: QualimatAddEventProps) {
    const timezone = useTimezone();
    const dispatch = useDispatch();

    const IdtfOptions = useMemo(
        () =>
            IDTFNumbers.map((number) => {
                // nosemgrep
                const product = t(`idtf.${number}`);

                return {
                    value: number,
                    label: `${number} - ${product}`,
                };
            }),
        []
    );

    const getLoadOptions = () => {
        const categories = PREDEFINED_LOAD_CATEGORIES.filter((category) => category !== "rental");
        return categories.map((value) => {
            return {value, label: getLoadCategoryLabel(value)};
        });
    };

    const formik = useFormik<QualimatEventPost>({
        initialValues: {
            date: new Date(),
            category: "loading",
            cleaning: {
                method: CleaningRegime.A,
                detergent: "",
                disinfectant: "",
                washingNote: undefined,
            },
            loading: {
                idtfNumber: "10001",
                loadType: "pallets",
            },
            transportUid: fromTransportUid ?? undefined,
        },
        validationSchema: yup.object().shape({
            date: yup.string().required(t("common.mandatoryField")),
            category: yup.string().required(t("common.mandatoryField")),
            cleaning: yup.object().when("category", {
                is: "cleaning",
                then: yup.object().shape({
                    method: yup.string().required(t("common.mandatoryField")),
                    detergent: yup.string().when("method", {
                        is: CleaningRegime.C,
                        then: yup.string().required(t("common.mandatoryField")),
                    }),
                    disinfectant: yup.string().when("method", {
                        is: CleaningRegime.D,
                        then: yup.string().required(t("common.mandatoryField")),
                    }),
                    washingNote: yup.mixed().when("method", {
                        is: (m: CleaningQualimatEventPost["method"]) =>
                            [CleaningRegime.B, CleaningRegime.C].includes(m),
                        then: yup.mixed().required(t("common.mandatoryField")),
                    }),
                }),
            }),
            loading: yup.object().when("category", {
                is: "loading",
                then: yup.object().shape({
                    idtfNumber: yup.string().required(t("common.mandatoryField")),
                    loadType: yup.string(),
                }),
            }),
            transportUid: yup.string().required(t("common.mandatoryField")),
        }),
        onSubmit: async (data) => {
            const {event, message} = getEventAndTransportMessage(data, timezone);
            if (message) {
                await dispatch(fetchAddDocument(data.transportUid as string, message));
            }
            onSave(event as Partial<QualimatEvent>);
        },
    });
    const value = useMemo(() => {
        const category =
            PREDEFINED_LOAD_CATEGORIES.find(
                (aCategory) => aCategory === formik.values.loading.loadType
            ) ?? "other";
        return {
            value: formik.values.loading.loadType,
            label: getLoadCategoryLabel(category),
        };
    }, [formik.values.loading.loadType]);
    return (
        <>
            {!fromTransportUid && (
                <TransportSelect
                    onChange={(uid) => {
                        formik.setFieldValue("transportUid", uid);
                    }}
                    required
                    error={formik.touched.transportUid ? formik.errors.transportUid : undefined}
                    fleetType={fleetType}
                    fleetItemId={fleetItemId}
                />
            )}
            <Text variant="captionBold" pb={2} mt={3}>
                {t("common.type")}
            </Text>
            <Box mb={-2}>
                <Radio
                    label={t("common.transportLoading")}
                    onChange={() => formik.setFieldValue("category", "loading")}
                    checked={formik.values.category == "loading"}
                    data-testid="loading-event-option"
                />
            </Box>
            <Box>
                <Radio
                    label={t("common.cleaning")}
                    onChange={() => formik.setFieldValue("category", "cleaning")}
                    checked={formik.values.category == "cleaning"}
                    data-testid="cleaning-event-option"
                />
            </Box>
            <Box pb={2}>
                <Text variant="captionBold" pb={1}>
                    {t("common.date")}
                </Text>
                <DatePicker
                    textInputWidth="250px"
                    date={formik.values.date}
                    placeholder={t("common.clickSelectDate")}
                    onChange={(value) => formik.setFieldValue("date", value)}
                    maxDate={new Date()}
                    showTime={true}
                    data-testid="date-picker"
                    rootId="react-app-modal-root"
                    required
                />
                {formik.errors.date && <ErrorMessage error={formik.errors.date as string} />}
            </Box>

            <Text variant="captionBold" pb={2}>
                {t("components.details")}
            </Text>

            {formik.values.category === "loading" && (
                <>
                    <Select
                        label={t("common.IDTFNumber")}
                        options={IdtfOptions}
                        value={{
                            value: formik.values.loading.idtfNumber,
                            label: formik.values.loading.idtfNumber,
                        }}
                        onChange={(option: any) =>
                            formik.setFieldValue("loading.idtfNumber", option.value)
                        }
                        isSearchable={true}
                        isClearable={false}
                        data-testid="select-idtf-number"
                        required
                        error={formik.errors.loading?.idtfNumber as string}
                    />

                    <Select
                        label={t("common.loadType")}
                        required
                        options={getLoadOptions()}
                        value={value}
                        onChange={(option: SelectOption<string>) =>
                            formik.setFieldValue("loading.loadType", option.value)
                        }
                        isSearchable={false}
                        isClearable={false}
                        data-testid="select-load-type"
                        styles={{
                            container: (provided) => ({
                                ...provided,
                                marginTop: "10px",
                            }),
                        }}
                        error={formik.errors.loading?.loadType as string}
                    />
                </>
            )}

            {formik.values.category === "cleaning" && (
                <QualimatCleaningForm
                    values={formik.values.cleaning}
                    setFieldValue={(field, value) =>
                        formik.setFieldValue("cleaning." + field, value)
                    }
                    errors={formik.errors?.cleaning}
                    touched={formik.touched?.cleaning}
                />
            )}

            <Flex justifyContent="flex-end" alignItems="center" mt={2}>
                <Button variant="secondary" type="submit" onClick={onCancel} mx={2}>
                    {t("common.cancel")}
                </Button>
                <Button onClick={formik.submitForm} data-testid="submit-add-event">
                    {t("common.save")}
                </Button>
            </Flex>
        </>
    );
}
