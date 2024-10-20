import {t} from "@dashdoc/web-core";
import {Button, Flex, Modal, Text, theme} from "@dashdoc/web-ui";
import {useFormik} from "formik";
import React, {FC} from "react";

import {OriginOrDestination} from "app/features/pricing/tariff-grids/modals/direction-modal/Landmarks";

import {TariffGridZone} from "../../types";

// Long thick grey arrow
const DirectionArrow: FC = () => {
    return (
        <svg
            width="82"
            height="24"
            viewBox="0 0 82 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
        >
            <path
                d="M81.0607 13.0607C81.6464 12.4749 81.6464 11.5251 81.0607 10.9393L71.5147 1.3934C70.9289 0.807611 69.9792 0.807611 69.3934 1.3934C68.8076 1.97919 68.8076 2.92893 69.3934 3.51472L77.8787 12L69.3934 20.4853C68.8076 21.0711 68.8076 22.0208 69.3934 22.6066C69.9792 23.1924 70.9289 23.1924 71.5147 22.6066L81.0607 13.0607ZM0 13.5H80V10.5H0V13.5Z"
                fill={theme.colors.grey.light}
            />
        </svg>
    );
};

type DirectionForm = {
    origin_or_destination: TariffGridZone | null;
    isOriginOrDestination: "origin" | "destination";
};

type DirectionModalProps = {
    rootId?: string;
    origin_or_destination: TariffGridZone | null;
    isOriginOrDestination: "origin" | "destination";
    onClose: () => unknown;
    onSubmit: (values: DirectionForm) => unknown;
};

export const DirectionModal: FC<DirectionModalProps> = ({
    rootId,
    origin_or_destination,
    isOriginOrDestination,
    onClose,
    onSubmit,
}) => {
    const formik = useFormik<DirectionForm>({
        initialValues: {
            origin_or_destination: origin_or_destination,
            isOriginOrDestination: isOriginOrDestination,
        },
        onSubmit: (values) => {
            onSubmit(values);
            onClose();
        },
    });

    return (
        <Modal
            rootId={rootId}
            data-testid="tariff-grid-direction-modal"
            title="Paramètres de la grille tarifaire"
            mainButton={{
                children: t("common.validate"),
                onClick: () => {
                    formik.submitForm();
                    onClose();
                },
            }}
            onClose={onClose}
            secondaryButton={{
                children: t("common.cancel"),
                onClick: onClose,
            }}
        >
            <Text variant="h1" mb={3}>
                {t("tariffGrids.GridDirection")}
            </Text>
            <Flex flexDirection={"row"} alignItems={"center"}>
                <Flex
                    minWidth={"215px"}
                    minHeight={"85px"}
                    border="1px solid"
                    borderColor="grey.light"
                    backgroundColor={
                        formik.values.isOriginOrDestination === "destination"
                            ? "grey.light"
                            : undefined
                    }
                    borderRadius={2}
                    justifyContent={"center"}
                    alignItems={"stretch"}
                    color={
                        formik.values.isOriginOrDestination === "destination"
                            ? "grey.dark"
                            : undefined
                    }
                    data-testid="tariff-grid-origin"
                >
                    {formik.values.isOriginOrDestination === "destination" ? (
                        <Flex alignItems={"center"} justifyContent={"center"}>
                            <Text>{t("tariffGrids.GridOrigin")}</Text>
                        </Flex>
                    ) : (
                        <OriginOrDestination
                            originOrDestination={formik.values.origin_or_destination}
                            isOriginOrDestination={formik.values.isOriginOrDestination}
                            onEditOriginOrDestination={(newZone) => {
                                formik.setFieldValue("origin_or_destination", newZone);
                            }}
                        />
                    )}
                </Flex>
                <Flex mx={2}>
                    <DirectionArrow />
                </Flex>
                <Flex
                    minWidth={"215px"}
                    minHeight={"85px"}
                    border="1px solid"
                    borderColor="grey.light"
                    borderRadius={2}
                    backgroundColor={
                        formik.values.isOriginOrDestination === "origin" ? "grey.light" : undefined
                    }
                    color={
                        formik.values.isOriginOrDestination === "origin" ? "grey.dark" : undefined
                    }
                    justifyContent={"center"}
                    alignItems={"stretch"}
                    data-testid="tariff-grid-destination"
                >
                    {formik.values.isOriginOrDestination === "origin" ? (
                        <Flex alignItems={"center"} justifyContent={"center"}>
                            <Text>{t("tariffGrids.GridDestination")}</Text>
                        </Flex>
                    ) : (
                        <OriginOrDestination
                            originOrDestination={formik.values.origin_or_destination}
                            isOriginOrDestination={formik.values.isOriginOrDestination}
                            onEditOriginOrDestination={(newZone) => {
                                formik.setFieldValue("origin_or_destination", newZone);
                            }}
                        />
                    )}
                </Flex>
                <Button
                    ml={2}
                    variant={"plain"}
                    onClick={() => {
                        const {isOriginOrDestination} = formik.values;
                        const newValue =
                            isOriginOrDestination === "origin" ? "destination" : "origin";
                        formik.setFieldValue("isOriginOrDestination", newValue);
                    }}
                    data-testid="tariff-grid-reverse-direction-button"
                >
                    {t("tariffGrids.ReverseDirection")}
                </Button>
            </Flex>
        </Modal>
    );
};
