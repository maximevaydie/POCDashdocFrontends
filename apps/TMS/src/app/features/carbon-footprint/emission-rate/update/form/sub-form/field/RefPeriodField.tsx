import {t} from "@dashdoc/web-core";
import {DatePicker, Flex, Icon, Modal, Text, ClickableUpdateRegionStyle} from "@dashdoc/web-ui";
import {formatDate, parseDate, useToggle} from "dashdoc-utils";
import React, {useState} from "react";

type Props = {
    start: string;
    end: string;
    onUpdate: (start: string, end: string) => void;
};

export function RefPeriodField({start, end, onUpdate}: Props) {
    const [isModalOpen, openModal, closeModal] = useToggle();
    const fromTo = `${formatDate(start, "P")} ${t("common.to")} ${formatDate(end, "P")}`;
    return (
        <>
            <Flex
                mt={4}
                border="1px solid"
                borderColor="grey.light"
                alignItems="center"
                p={4}
                width="100%"
                onClick={openModal}
                as={ClickableUpdateRegionStyle}
                data-testid="start-end-section"
                // @ts-ignore
                updateButtonLabel={t("common.edit")}
            >
                <Icon name="calendar" fontSize={4} mr={3} color="grey.default" />
                <Text>{fromTo}</Text>
            </Flex>
            {isModalOpen && (
                <UpdateRefPeriodModal
                    defaultStart={start}
                    defaultEnd={end}
                    onUpdate={handleUpdate}
                    onClose={closeModal}
                />
            )}
        </>
    );

    function handleUpdate(start: string, end: string) {
        onUpdate(start, end);
        closeModal();
    }
}

const MIN_DATE = new Date("2023-08-01");

type ModalProps = {
    defaultStart: string;
    defaultEnd: string;
    onUpdate: (start: string, end: string) => void;
    onClose: () => void;
};

function UpdateRefPeriodModal({defaultStart, defaultEnd, onClose, onUpdate}: ModalProps) {
    const [{start, end}, setState] = useState<{start: Date; end: Date}>({
        start: parseDate(defaultStart) as Date,
        end: parseDate(defaultEnd) as Date,
    });
    return (
        <Modal
            title={t("common.referencePeriod")}
            onClose={onClose}
            mainButton={{
                children: t("common.update"),
                onClick: handleUpdate,
                "data-testid": "update-ref-period-main-button",
            }}
            secondaryButton={{
                children: t("common.cancel"),
                onClick: onClose,
                "data-testid": "update-ref-period-secondary-button",
            }}
            size="medium"
        >
            <Flex style={{gap: "8px"}}>
                <DatePicker
                    required
                    label={t("components.beginDate")}
                    date={start}
                    minDate={MIN_DATE}
                    maxDate={end}
                    onChange={(newStart: Date) => {
                        setState((prev) => ({...prev, start: newStart}));
                    }}
                    rootId="react-app-modal-root"
                    data-testid="start-date-input"
                />
                <DatePicker
                    required
                    label={t("components.endDate")}
                    date={end}
                    minDate={start}
                    onChange={(newEnd: Date) => {
                        setState((prev) => ({...prev, end: newEnd}));
                    }}
                    rootId="react-app-modal-root"
                    data-testid="end-date-input"
                />
            </Flex>
        </Modal>
    );

    function handleUpdate() {
        onUpdate(start.toISOString(), end.toISOString());
    }
}
