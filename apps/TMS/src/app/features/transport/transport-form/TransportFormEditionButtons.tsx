import {t} from "@dashdoc/web-core";
import {ButtonWithShortcut, Flex, Icon, IconNames, Text} from "@dashdoc/web-ui";
import {useFormikContext} from "formik";
import isEmpty from "lodash.isempty";
import React, {FunctionComponent, useContext, useMemo} from "react";

import {TransportFormContext} from "./transport-form-context";
import {TransportFormValues} from "./transport-form.types";
import {TEST_ID_PREFIX} from "./TransportForm";

type TransportFormEditionFields =
    | "loadings"
    | "unloadings"
    | "loads"
    | "supportExchanges"
    | "means"
    | "price";

export type TransportFormEditingItem = {
    field: TransportFormEditionFields | null;
    index?: number | "new" | null;
};

type EditionButtonProps = {
    canAddPrice: boolean;
    isEditingItem: boolean;
    setEditingItem: (value: TransportFormEditingItem) => void;
    loadingExtractedData: boolean;
    unloadingExtractedData: boolean;
    meansExtractedData: boolean;
};

type ExcludesFalse = <T>(x: T | false) => x is T;

export const TransportFormEditionButtons: FunctionComponent<EditionButtonProps> = ({
    canAddPrice,
    isEditingItem,
    setEditingItem,
    loadingExtractedData,
    unloadingExtractedData,
    meansExtractedData,
}) => {
    const {transportShape, isMultipleRounds} = useContext(TransportFormContext);
    const {values} = useFormikContext<TransportFormValues>();
    const {means, loadings, unloadings, loads} = values;

    const isRental = loads[0]?.category === "rental";

    const hasNoLoadingAddress = loadings[0].address === null || loadings[0].address === undefined;
    const canAddMultipleLoadings =
        transportShape !== "ungrouping" && !isMultipleRounds && !isRental;
    const canAddLoadings = canAddMultipleLoadings || hasNoLoadingAddress;

    const hasNoUnloadingAddress =
        unloadings[0].address === null || unloadings[0].address === undefined;
    const canAddMultipleUnloadings =
        transportShape !== "grouping" && !isMultipleRounds && !isRental;
    const canAddUnloadings = canAddMultipleUnloadings || hasNoUnloadingAddress;

    const canAddLoads = isEmpty(loads) || (!isMultipleRounds && !isRental);

    const canAddMeans = !means;

    const editionButtons = useMemo(() => {
        return [
            canAddLoadings && {
                key: "add-loading",
                iconName: "origin",
                label: t("common.pickup"),
                editNew: () => setEditingItem({field: "loadings", index: "new"}),
                testId: `${TEST_ID_PREFIX}add-loading-button`,
                shortcut: "alt + " + t("transportForm.shortcut.keyQ"),
                shortcutKeyCodes: ["Alt", "KeyQ"],
                extractedData: loadingExtractedData,
            },
            canAddUnloadings && {
                key: "add-unloading",
                iconName: "destination",
                label: t("common.delivery"),
                editNew: () => setEditingItem({field: "unloadings", index: "new"}),
                testId: `${TEST_ID_PREFIX}add-unloading-button`,
                shortcut: "alt + " + t("transportForm.shortcut.keyW"),
                shortcutKeyCodes: ["Alt", "KeyW"],
                extractedData: unloadingExtractedData,
            },
            canAddLoads && {
                key: "add-load",
                iconName: "load",
                label: t("common.loads"),
                editNew: () => setEditingItem({field: "loads", index: "new"}),
                testId: `${TEST_ID_PREFIX}add-load-button`,
                shortcut: "alt + " + t("transportForm.shortcut.keyA"),
                shortcutKeyCodes: ["Alt", "KeyA"],
            },
            {
                key: "add-support-exchanges",
                iconName: "loading",
                label: t("common.supportExchanges"),
                editNew: () => setEditingItem({field: "supportExchanges", index: "new"}),
                testId: `${TEST_ID_PREFIX}add-support-exchange-button`,
                shortcut: "alt + s",
                shortcutKeyCodes: ["Alt", "KeyS"],
            },
            canAddMeans && {
                key: "add-means",
                iconName: "truck",
                label: t("common.means"),
                editNew: () => setEditingItem({field: "means"}),
                testId: `${TEST_ID_PREFIX}add-means-button`,
                shortcut: "alt + " + t("transportForm.shortcut.keyZ"),
                shortcutKeyCodes: ["Alt", "KeyZ"],
                extractedData: meansExtractedData,
            },
            canAddPrice && {
                key: "add-price",
                iconName: "euro",
                label: t("common.price"),
                testId: `${TEST_ID_PREFIX}add-price-button`,
                editNew: () => setEditingItem({field: "price"}),
                shortcut: "alt + x",
                shortcutKeyCodes: ["Alt", "KeyX"],
            },
        ].filter(Boolean as unknown as ExcludesFalse);
    }, [
        canAddLoadings,
        loadingExtractedData,
        canAddUnloadings,
        unloadingExtractedData,
        canAddLoads,
        canAddMeans,
        meansExtractedData,
        canAddPrice,
        setEditingItem,
    ]);

    return (
        <>
            <Text variant="h1" mb={4} mt={5}>
                {t("transportForm.addToTransport")}
            </Text>
            {editionButtons.map(
                ({
                    editNew,
                    iconName,
                    label,
                    shortcut,
                    shortcutKeyCodes,
                    key,
                    testId,
                    extractedData,
                }) => (
                    <ButtonWithShortcut
                        key={key}
                        variant="secondary"
                        width="100%"
                        mb={2}
                        onClick={editNew}
                        py={3}
                        display="flex"
                        justifyContent="space-between"
                        alignItems="center"
                        data-testid={testId}
                        shortcutKeyCodes={shortcutKeyCodes}
                        isShortcutDisabled={isEditingItem}
                    >
                        <Flex alignItems="center">
                            <Flex
                                bg="blue.ultralight"
                                width="28px"
                                height="28px"
                                alignItems="center"
                                justifyContent="center"
                                mr={2}
                                borderRadius="50%"
                            >
                                <Icon name={iconName as IconNames} color="blue.default" />
                            </Flex>
                            <Text color="grey.dark">{label}</Text>
                        </Flex>
                        <Flex>
                            {extractedData && (
                                <Flex
                                    bg="yellow.ultralight"
                                    width="28px"
                                    height="28px"
                                    alignItems="center"
                                    justifyContent="center"
                                    borderRadius="50%"
                                    marginRight={1}
                                >
                                    <Icon name="robot" color="yellow.default" />
                                </Flex>
                            )}
                            <Text color="grey.dark" variant="caption">
                                {shortcut}
                            </Text>
                        </Flex>
                    </ButtonWithShortcut>
                )
            )}
        </>
    );
};
