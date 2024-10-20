import {HasFeatureFlag, HasNotFeatureFlag} from "@dashdoc/web-common";
import {t} from "@dashdoc/web-core";
import {
    Box,
    Button,
    Callout,
    Flex,
    Icon,
    IconButton,
    Link,
    Popover,
    Badge,
    Table,
    TabTitle,
    Text,
} from "@dashdoc/web-ui";
import {formatDate, formatNumberWithCustomUnit} from "dashdoc-utils";
import {isAfter, parseISO} from "date-fns";
import React from "react";

import {getTabTranslations} from "app/common/tabs";
import {UpdateEmissionRateModal as UpdateEmissionRateModalLegacy} from "app/features/carbon-footprint/emission-rate/update/legacy/UpdateEmissionRateModal";
import {UpdateEmissionRateModal} from "app/features/carbon-footprint/emission-rate/update/UpdateEmissionRateModal";
import {AddTransportOperationCategoryModal} from "app/features/carbon-footprint/transport-operation-category/AddTransportOperationCategoryModal";
import {RenameTransportOperationCategoryModal} from "app/features/carbon-footprint/transport-operation-category/RenameTransportOperationCategoryModal";
import {carbonFootprintConstants} from "app/services/carbon-footprint/constants.service";
import {
    TransportOperationCategory,
    transportOperationCategoryApiService,
} from "app/services/carbon-footprint/TransportOperationCategoryApi.service";
import {SidebarTabNames} from "app/types/constants";

type TransportOperationCategoryColumnName =
    | "name"
    | "emissionRate"
    | "expireAt"
    | "isDefault"
    | "actions";
type TransportOperationCategoryColumn = {
    name: TransportOperationCategoryColumnName;
    width: string;
    getLabel: () => string;
};

const transportOperationCategoriesColumns: TransportOperationCategoryColumn[] = [
    {width: "8em", name: "name", getLabel: () => t("common.name")},
    {width: "5em", name: "expireAt", getLabel: () => t("carbonFootprint.expirationDate")},
    {width: "5em", name: "emissionRate", getLabel: () => t("carbonFootprint.emissionRates")},
    {
        width: "5em",
        name: "isDefault",
        getLabel: () => t("carbonFootprint.defaultTransportOperationCategory"),
    },
    {width: "1em", name: "actions", getLabel: () => ""},
];

export function SettingsCarbonFootprint() {
    const [transportOperationCategories, setTransportOperationCategories] = React.useState<
        TransportOperationCategory[]
    >([]);

    const [selectedTransportOperationCategory, setSelectedTransportOperationCategory] =
        React.useState<TransportOperationCategory | null>(null);

    const [addTransportOperationCategoryModalOpen, setAddTransportOperationCategoryModalOpen] =
        React.useState<boolean>(false);

    const [renameTransportOperationCategory, setRenameTransportOperationCategory] = React.useState<
        TransportOperationCategory | undefined
    >(undefined);

    const fetchTransportOperationsCategories = async () => {
        const transportOperationCategories = await transportOperationCategoryApiService.getAll();
        if (transportOperationCategories["count"] > 0) {
            setTransportOperationCategories(transportOperationCategories["results"]);
        } else {
            await transportOperationCategoryApiService.getOrCreateDefault();
            const transportOperationCategories =
                await transportOperationCategoryApiService.getAll();
            setTransportOperationCategories(transportOperationCategories["results"]);
        }
    };

    React.useEffect(() => {
        fetchTransportOperationsCategories();
    }, []);

    const _renderExpireAt = (expireAt: string) => {
        if (!expireAt) {
            // eslint-disable-next-line react/jsx-no-literals
            return <Text>-</Text>;
        }

        const formattedDate = formatDate(expireAt, "P");
        if (isAfter(new Date(), parseISO(expireAt))) {
            return (
                <Badge variant="warning" shape="squared">
                    <Icon name="alert" mr={2} />
                    {formattedDate}
                </Badge>
            );
        }
        return <Text>{formattedDate}</Text>;
    };

    const getRowCellContent = (
        transportOperationCategory: TransportOperationCategory,
        columnName: TransportOperationCategoryColumnName
    ) => {
        switch (columnName) {
            case "emissionRate":
                return (
                    <Text>
                        {formatNumberWithCustomUnit(
                            transportOperationCategory.last_emission_rate.emission_rate,
                            {
                                unit: t("components.requestedVehicle.emissionRateUnit"),
                            },
                            {maximumFractionDigits: carbonFootprintConstants.emissionRateMaxDigits}
                        )}
                    </Text>
                );
            case "expireAt":
                return _renderExpireAt(transportOperationCategory.last_emission_rate.expire_at);
            case "name":
                return (
                    <Text style={{wordBreak: "break-all"}}>
                        {transportOperationCategory[columnName]}
                    </Text>
                );
            case "isDefault":
                if (transportOperationCategory.is_default) {
                    return (
                        <Badge variant="neutral" shape="squared">
                            {t("carbonFootprint.defaultTransportOperationCategory")}
                        </Badge>
                    );
                }
                return null;
            case "actions":
                if (transportOperationCategory.is_default) {
                    return null;
                }
                return (
                    <Popover>
                        <Popover.Trigger display="flex" justifyContent="flex-end">
                            <IconButton
                                name="moreActions"
                                data-testid="transport-operation-category-more-actions-button"
                            />
                        </Popover.Trigger>
                        <Popover.Content p={0}>
                            <Button
                                variant="plain"
                                onClick={() =>
                                    setRenameTransportOperationCategory(transportOperationCategory)
                                }
                                data-testid="rename-transport-operation-category-button"
                            >
                                <Text display="flex">
                                    <Icon name="edit" mr={2} />
                                    {t("common.rename")}
                                </Text>
                            </Button>
                        </Popover.Content>
                    </Popover>
                );
        }
    };

    return (
        <Box>
            <Flex justifyContent="space-between" mb={3}>
                <TabTitle title={getTabTranslations(SidebarTabNames.CARBON_FOOTPRINT)} />
            </Flex>

            <Callout icon="ecologyLeaf" mb={6}>
                <Text
                    dangerouslySetInnerHTML={{
                        __html: t("carbonFootprint.emissionRateDescription"),
                    }}
                    display="inline"
                />{" "}
                <Link
                    href={t("carbonFootprint.findOutMoreLink")}
                    target="_blank"
                    rel="noopener noreferrer"
                    lineHeight={1}
                >
                    {t("common.findOutMore")}
                </Link>
            </Callout>

            <Flex mb={3} flexDirection="row" alignItems="center" justifyContent="space-between">
                <Text variant="h1" alignSelf="center">
                    {t("carbonFootprint.transportOperationCategory")}
                </Text>
                <Button
                    alignSelf="center"
                    onClick={() => setAddTransportOperationCategoryModalOpen(true)}
                    data-testid="add-transport-operation-category-button"
                >
                    <Icon name="add" mr={2} />
                    {t("carbonFootprint.addTransportOperationCategory")}
                </Button>
            </Flex>

            <Table
                columns={transportOperationCategoriesColumns}
                rows={transportOperationCategories}
                getRowCellContent={getRowCellContent}
                getRowCellIsClickable={(_, columnName) => {
                    return columnName !== "actions";
                }}
                isLoading={transportOperationCategories.length === 0}
                onClickOnRow={(row) =>
                    setSelectedTransportOperationCategory(row as TransportOperationCategory)
                }
            />

            {selectedTransportOperationCategory && (
                <>
                    <HasFeatureFlag flagName="carbonfootprintiso">
                        <UpdateEmissionRateModal
                            transportOperationCategory={selectedTransportOperationCategory}
                            onClose={(didUpdate?: boolean) => {
                                setSelectedTransportOperationCategory(null);
                                if (didUpdate) {
                                    fetchTransportOperationsCategories();
                                }
                            }}
                        />
                    </HasFeatureFlag>
                    <HasNotFeatureFlag flagName="carbonfootprintiso">
                        <UpdateEmissionRateModalLegacy
                            transportOperationCategory={selectedTransportOperationCategory}
                            onClose={(didUpdate?: boolean) => {
                                setSelectedTransportOperationCategory(null);
                                if (didUpdate) {
                                    fetchTransportOperationsCategories();
                                }
                            }}
                        />
                    </HasNotFeatureFlag>
                </>
            )}

            {addTransportOperationCategoryModalOpen && (
                <AddTransportOperationCategoryModal
                    onClose={(didUpdate) => {
                        setAddTransportOperationCategoryModalOpen(false);
                        if (didUpdate) {
                            fetchTransportOperationsCategories();
                        }
                    }}
                />
            )}

            {renameTransportOperationCategory && (
                <RenameTransportOperationCategoryModal
                    transportOperationCategory={renameTransportOperationCategory}
                    onClose={(didCreate) => {
                        setRenameTransportOperationCategory(undefined);
                        if (didCreate) {
                            fetchTransportOperationsCategories();
                        }
                    }}
                />
            )}
        </Box>
    );
}
