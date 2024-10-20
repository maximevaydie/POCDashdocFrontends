import {
    addressService,
    apiService,
    getErrorMessageFromServerError,
    useDispatch,
} from "@dashdoc/web-common";
import {AddressSelect} from "@dashdoc/web-common";
import {AddressModal} from "@dashdoc/web-common";
import {Logger, t} from "@dashdoc/web-core";
import {Box, Radio, Flex, IconLink, Modal, Text, toast} from "@dashdoc/web-ui";
import {OriginalAddress, useToggle} from "dashdoc-utils";
import {normalize} from "normalizr";
import React, {useState} from "react";

import {useExtendedView} from "app/hooks/useExtendedView";
import {schedulerTripSchema} from "app/redux/schemas";

export type Props = {
    onSubmit: () => void;
    onClose: () => void;
    tripUid: string;
    activityAfterBreakUid: string;
};

export function AddBreakToTripModal({onSubmit, onClose, tripUid, activityAfterBreakUid}: Props) {
    const dispatch = useDispatch();
    const {extendedView} = useExtendedView();
    const [isSubmitting, setIsSubmitting, setSubmitted] = useToggle();
    // nosemgrep
    const [selectedBreakAddress, setSelectedBreakAddress] = useState<
        OriginalAddress | undefined
    >();
    const [keepTripAfterResume, setKeepTripAfterResume] = useState(true);
    const [isNewAddressModalOpen, openNewAddressModal, closeNewAddressModal] = useToggle();

    return (
        <Modal
            data-testid="break-modal"
            id="break-modal"
            title={t("components.addBulkingBreak")}
            mainButton={{
                children: t("components.addBulkingBreak"),
                onClick: handleSubmit,
                loading: isSubmitting,
                ["data-testid"]: "break-modal-save-button",
            }}
            onClose={onClose}
        >
            <Box mt={4}>
                <AddressSelect
                    key={`address-${selectedBreakAddress?.name}`}
                    label={t("components.addressOfTheBreak")}
                    data-testid="update-address-modal-select"
                    categories={["origin", "destination", "carrier"]}
                    value={selectedBreakAddress}
                    onChange={setSelectedBreakAddress}
                    isDisabled={isSubmitting}
                />
                <Flex justifyContent="flex-end" pt={2}>
                    <IconLink
                        text={t("transportsForm.addAddress")}
                        iconName="add"
                        onClick={openNewAddressModal}
                        data-testid="add-address-link"
                    />
                </Flex>
            </Box>
            <Flex mt={6} mb={4} flexDirection={"column"}>
                <Text variant="h2" mb={4}>
                    {t("addBreakToTripModal.RemainingActivities")}
                </Text>
                <Radio
                    label={t("addBreakToTripModal.KeepTripAfterResume")}
                    onChange={() => setKeepTripAfterResume(true)}
                    checked={keepTripAfterResume}
                    data-testid="keep-trip-after-resume-radio"
                />
                {keepTripAfterResume && (
                    <Box
                        mb={4}
                        pl={2}
                        ml={"6px"}
                        borderLeft={"1px solid"}
                        borderLeftColor={"grey.default"}
                    >
                        <Text p={2} backgroundColor={"grey.lighter"}>
                            {t("addBreakToTripModal.KeepTripAfterResumeDescription")}
                        </Text>
                    </Box>
                )}
                <Radio
                    label={t("addBreakToTripModal.RemoveTripAfterResume")}
                    onChange={() => setKeepTripAfterResume(false)}
                    checked={!keepTripAfterResume}
                    data-testid="remove-trip-after-resume-radio"
                />
                {!keepTripAfterResume && (
                    <Box
                        mb={4}
                        pl={2}
                        ml={"6px"}
                        borderLeft={"1px solid"}
                        borderLeftColor={"grey.default"}
                    >
                        <Text p={2} backgroundColor={"grey.lighter"}>
                            {t("addBreakToTripModal.RemoveTripAfterResumeDescription")}
                        </Text>
                    </Box>
                )}
            </Flex>
            {isNewAddressModalOpen && (
                <AddressModal
                    addressCategory={`is_origin`}
                    onClose={closeNewAddressModal}
                    onSave={(breakAddress) => {
                        setSelectedBreakAddress(
                            addressService.convertAddressToIOriginalAddress(breakAddress)
                        );
                        closeNewAddressModal();
                    }}
                />
            )}
        </Modal>
    );

    async function handleSubmit() {
        try {
            setIsSubmitting();
            const body = {
                activity_after_break_uid: activityAfterBreakUid,
                break_address_pk: selectedBreakAddress ? selectedBreakAddress.pk : null,
                remove_trip_after_resume: !keepTripAfterResume,
                extended_view: extendedView,
            };
            const response = await apiService.post(
                `/scheduler/trips/${tripUid}/add-break/`,
                body,
                {
                    apiVersion: "web",
                }
            );
            dispatch({
                type: "UPDATE_ENTITIES_SUCCESS",
                response: normalize(response, schedulerTripSchema),
            });
            onSubmit();
            toast.success(t("segments.segmentBreakAdded"));
        } catch (error) {
            Logger.error(error);
            toast.error(await getErrorMessageFromServerError(error));
        } finally {
            setSubmitted();
        }
    }
}
