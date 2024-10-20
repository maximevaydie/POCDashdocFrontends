import {ValidateCoordinatesModal} from "@dashdoc/web-common";
import {t} from "@dashdoc/web-core";
import {Box, Flex, Icon, Link, Modal, Text} from "@dashdoc/web-ui";
import {CoordinatesWithRadius, useToggle, validateSiteForETA, type Address} from "dashdoc-utils";
import React, {useMemo} from "react";

import {fetchValidateAddressCoordinates} from "app/redux/actions";
import {useDispatch} from "app/redux/hooks";

import type {Site} from "app/types/transport";

const GoodIcon = () => <Icon mr={2} name="checkCircle" color="green.default" alignSelf="center" />;
const BadIcon = () => <Icon mr={2} name="removeCircle" color="red.default" alignSelf="center" />;

type ETAValidationModalProps = {
    site: Pick<Site, "address" | "uid"> & {
        slots?: Site["slots"];
    };
    onClose: () => void;
};

export default function ETAValidationModal({site, onClose}: ETAValidationModalProps) {
    const siteEtaValidation = useMemo(() => validateSiteForETA(site), [site]);
    const [
        isValidateCoordinatesModalOpen,
        openValidateCoordinatesModal,
        closeValidateCoordinatesModal,
    ] = useToggle();
    const dispatch = useDispatch();

    const handleUpdateAddress = async (coordinates: CoordinatesWithRadius) => {
        if (site.address === null) {
            return;
        }
        await dispatch(fetchValidateAddressCoordinates(site.uid, site.address.pk, coordinates));
        closeValidateCoordinatesModal();
    };

    return (
        <Modal
            id="eta-validation-modal"
            title={t("eta.enableETA")}
            onClose={onClose}
            mainButton={{
                onClick: onClose,
                children: t("common.understood"),
            }}
            secondaryButton={null}
        >
            <Box>
                <Box mb={3}>{t("eta.validationDescription")}</Box>
                <Box mb={2}>
                    {siteEtaValidation.address ? (
                        <Flex>
                            <GoodIcon />
                            <Text>{t("eta.addressProvided")}</Text>
                        </Flex>
                    ) : (
                        <Flex>
                            <BadIcon />
                            <Text>{t("eta.error.missingAddress")}</Text>
                        </Flex>
                    )}
                </Box>
                <Box mb={2}>
                    {siteEtaValidation.coordinates_validation ? (
                        <Flex>
                            <GoodIcon />
                            <Text>{t("eta.addressHasValidatedCoordinates")}</Text>
                        </Flex>
                    ) : (
                        <Flex>
                            <BadIcon />
                            <Box>
                                <Text>{t("eta.error.addressWithoutPreciseGPSCoordinates")}</Text>
                                {site.address && (
                                    <Text>
                                        {t("eta.error.updateAddressCoordinatesForFutureUses")}{" "}
                                        <Link onClick={openValidateCoordinatesModal}>
                                            {t("addressModal.verifyGPSCoordinates")}.
                                        </Link>
                                    </Text>
                                )}
                            </Box>
                        </Flex>
                    )}
                </Box>
                <Box mb={2}>
                    {siteEtaValidation.arrival_date ? (
                        <Flex>
                            <GoodIcon />
                            <Text>{t("eta.arrivalDateAndTimeProvided")}</Text>
                        </Flex>
                    ) : (
                        <Flex>
                            <BadIcon />
                            <Text ml={1}>{t("eta.error.addressWithoutPreciseAskDateTime")}</Text>
                        </Flex>
                    )}
                </Box>
            </Box>
            {isValidateCoordinatesModalOpen && site.address && (
                <ValidateCoordinatesModal
                    // TODO: a TransportAddress is not assignable to type Address
                    address={site.address as any as Address}
                    onClose={closeValidateCoordinatesModal}
                    saveWithGPS={handleUpdateAddress}
                    saveWithoutGPS={closeValidateCoordinatesModal}
                />
            )}
        </Modal>
    );
}
