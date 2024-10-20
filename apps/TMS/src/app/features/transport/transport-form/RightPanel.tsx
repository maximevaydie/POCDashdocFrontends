import {fullPagePdfUrl} from "@dashdoc/core";
import {HasFeatureFlag, HasNotFeatureFlag, utilsService} from "@dashdoc/web-common";
import {t} from "@dashdoc/web-core";
import {Box, Flex, Icon, IFrame, Tabs, Text, TooltipWrapper} from "@dashdoc/web-ui";
import {ConfirmationExtractedData} from "dashdoc-utils";
import {useFormikContext} from "formik";
import React from "react";

import {ActivitiesOrdering} from "app/features/transport/transport-form/activity/ActivitiesOrdering";
import {TemplatePickerWrapper} from "app/features/transport/transport-form/templates-lines/templates/TemplatePickerWrapper";

import GlobalInstructionsPicker from "./settings/GlobalInstructionsPicker";
import {TransportSettingsForm} from "./settings/TransportSettingsForm";
import {TransportFormDeliveryOption, type TransportFormValues} from "./transport-form.types";
import {
    TransportFormEditingItem,
    TransportFormEditionButtons,
} from "./TransportFormEditionButtons";

type Props = {
    isComplex: boolean;
    hasPrice: boolean;
    hasPurchaseCosts: boolean;
    isOrder: boolean;
    isCreatingTemplate: boolean;
    deliveries: TransportFormDeliveryOption[];
    confirmationExtractedData: ConfirmationExtractedData;
    confirmationUid: string | null;
    editingItem: TransportFormEditingItem;
    setEditingItem: (item: TransportFormEditingItem) => void;
};

export function RightPanel({
    isComplex,
    hasPrice,
    hasPurchaseCosts,
    isOrder,
    isCreatingTemplate,
    deliveries,
    confirmationExtractedData,
    confirmationUid,
    editingItem,
    setEditingItem,
}: Props) {
    const {setFieldValue, values} = useFormikContext<TransportFormValues>();
    const {instructions, shipper} = values;

    const canUseTemplate =
        !isOrder && !isCreatingTemplate && (shipper?.address?.company || shipper?.shipper);

    return (
        <Tabs
            tabs={[
                ...(!isComplex
                    ? [
                          {
                              label: t("common.edition"),
                              testId: "transport-form-edition-tab",
                              content: (
                                  <Flex
                                      flexDirection="column"
                                      height="100%"
                                      justifyContent="space-between"
                                      overflowY="auto"
                                      pr={1}
                                  >
                                      <Box flex={1}>
                                          <TransportFormEditionButtons
                                              canAddPrice={!hasPrice && !hasPurchaseCosts}
                                              isEditingItem={!!editingItem.field}
                                              setEditingItem={setEditingItem}
                                              loadingExtractedData={
                                                  !!(
                                                      confirmationExtractedData.loading_addresses
                                                          .length ||
                                                      confirmationExtractedData.codes.length ||
                                                      confirmationExtractedData.slots.length
                                                  )
                                              }
                                              unloadingExtractedData={
                                                  !!(
                                                      confirmationExtractedData.unloading_addresses
                                                          .length ||
                                                      confirmationExtractedData.codes.length ||
                                                      confirmationExtractedData.slots.length
                                                  )
                                              }
                                              meansExtractedData={
                                                  !!confirmationExtractedData.codes.length
                                              }
                                          />
                                      </Box>
                                      {canUseTemplate && (
                                          <>
                                              <HasFeatureFlag flagName="betterCompanyRoles">
                                                  <TemplatePickerWrapper
                                                      shipperPk={shipper.shipper?.pk}
                                                      shipperAddressPk={
                                                          shipper.shipper?.administrative_address
                                                              .pk
                                                      }
                                                      shipperName={shipper.shipper?.name}
                                                      isShortcutDisabled={!!editingItem.field}
                                                      isComplexMode={isComplex}
                                                  />
                                              </HasFeatureFlag>
                                              <HasNotFeatureFlag flagName="betterCompanyRoles">
                                                  <TemplatePickerWrapper
                                                      shipperPk={shipper.address?.company?.pk}
                                                      shipperAddressPk={shipper.address?.pk}
                                                      shipperName={
                                                          shipper.address?.company.name ?? ""
                                                      }
                                                      isShortcutDisabled={!!editingItem.field}
                                                      isComplexMode={isComplex}
                                                  />
                                              </HasNotFeatureFlag>
                                          </>
                                      )}
                                  </Flex>
                              ),
                          },
                      ]
                    : [
                          {
                              label: t("transportForm.order"),
                              testId: "transport-form-activities-order-tab",
                              content: (
                                  <Flex
                                      justifyContent="space-between"
                                      flexDirection="column"
                                      height="100%"
                                      overflowY="auto"
                                      pr={1}
                                      data-testid="transport-form-activities-order"
                                  >
                                      <ActivitiesOrdering />
                                      {canUseTemplate && (
                                          <>
                                              <HasFeatureFlag flagName="betterCompanyRoles">
                                                  <TemplatePickerWrapper
                                                      shipperPk={shipper.shipper?.pk}
                                                      shipperAddressPk={
                                                          shipper.shipper?.administrative_address
                                                              .pk
                                                      }
                                                      shipperName={shipper.shipper?.name}
                                                      isShortcutDisabled={!!editingItem.field}
                                                      isComplexMode={isComplex}
                                                  />
                                              </HasFeatureFlag>
                                              <HasNotFeatureFlag flagName="betterCompanyRoles">
                                                  <TemplatePickerWrapper
                                                      shipperPk={shipper.address?.company?.pk}
                                                      shipperAddressPk={shipper.address?.pk}
                                                      shipperName={
                                                          shipper.address?.company.name ?? ""
                                                      }
                                                      isShortcutDisabled={!!editingItem.field}
                                                      isComplexMode={isComplex}
                                                  />
                                              </HasNotFeatureFlag>
                                          </>
                                      )}
                                  </Flex>
                              ),
                          },
                      ]),
                {
                    label: t("common.options"),
                    testId: "transport-form-options-tab",
                    content: (
                        <Box
                            height="100%"
                            overflowY="auto"
                            pr={1}
                            data-testid="transport-form-options"
                        >
                            <TransportSettingsForm
                                onChange={(values) => setFieldValue("settings", values)}
                                multipleDeliveries={deliveries?.length > 1}
                            />
                        </Box>
                    ),
                },
                {
                    label: t("transportForm.shipperIntructions"),
                    testId: "transport-form-instructions-tab",
                    content: (
                        <Box overflowY="auto" pr={1}>
                            <Flex alignItems="center" mb={4} mt={5}>
                                <Text variant="h1"> {t("transportForm.shipperIntructions")}</Text>
                                <TooltipWrapper
                                    content={
                                        isOrder
                                            ? t("transportForm.globalInstructionsTooltipShipper")
                                            : t("transportForm.globalInstructionsTooltipCarrier")
                                    }
                                    placement="right"
                                >
                                    <Icon name="info" ml={2} />
                                </TooltipWrapper>
                            </Flex>

                            <GlobalInstructionsPicker
                                globalInstructions={instructions}
                                onInputChange={(value) => setFieldValue("instructions", value)}
                            />
                        </Box>
                    ),
                },
                ...(confirmationUid
                    ? [
                          {
                              label: t("transportsForm.pdf"),
                              content: utilsService.isPdf(confirmationExtractedData.document) ? (
                                  <IFrame
                                      src={fullPagePdfUrl(confirmationExtractedData.document)}
                                      download={false}
                                      onLoad={() => {}}
                                  />
                              ) : null,
                          },
                      ]
                    : []),
            ]}
            initialActiveTab={confirmationUid ? 3 : 0}
        />
    );
}
