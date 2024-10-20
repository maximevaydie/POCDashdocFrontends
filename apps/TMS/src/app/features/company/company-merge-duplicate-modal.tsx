import {apiService, CompanyName, PartnerDetailOutput} from "@dashdoc/web-common";
import {Logger, t} from "@dashdoc/web-core";
import {Card, Checkbox, Flex, Icon, Modal, Text, theme, ModalProps, toast} from "@dashdoc/web-ui";
import {Company} from "dashdoc-utils";
import React, {useCallback, useEffect, useState} from "react";

import {CompanyDuplicatesCard} from "app/features/company/company-duplicates-card";

type Props = Partial<ModalProps> & {
    company: Company | PartnerDetailOutput;
    duplicate: Company;
    wordsToHighlight: string[];
    onMerge: (modifiedCompany: Company) => void;
};

export function CompanyMergeDuplicateModal(props: Props) {
    const {company, duplicate, wordsToHighlight, onMerge, ...modalProps} = props;

    const [isLoadingPreview, setIsLoadingPreview] = useState(true);
    const [preview, setPreview] = useState<Company>();
    const [confirmationChecked, setConfirmationChecked] = useState(false);
    const [isMerging, setIsMerging] = useState(false);

    // fetch merge preview on mount
    useEffect(() => {
        apiService.Companies.getMergeDuplicatePreview(company.pk, duplicate.pk)
            .then((preview) => {
                setPreview(preview);
                setIsLoadingPreview(false);
            })
            .catch((error) => {
                Logger.error(error);
                toast.error(t("companyMergeDuplicate.preview.error"));
                setIsLoadingPreview(false);
            });
    }, []);

    const merge = useCallback(() => {
        setIsMerging(true);
        apiService.Companies.mergeDuplicate(company.pk, duplicate.pk)
            .then((modifiedCompany) => {
                setIsMerging(false);
                onMerge(modifiedCompany);
            })
            .catch((error) => {
                Logger.error(error);
                toast.error(t("companyMergeDuplicate.merge.error"));
                setIsMerging(false);
            });
    }, [onMerge]);

    return (
        <Modal
            title={t("components.companyDuplicates.confirmMerge")}
            id="company-merge-duplicate-modal"
            secondaryButton={{
                disabled: isMerging,
            }}
            mainButton={{
                children: t("components.companyDuplicates.confirmMerge"),
                disabled: !confirmationChecked || isMerging,
                onClick: merge,
            }}
            {...modalProps}
        >
            {/* Before */}
            <Text ml={6} mt={4} fontWeight="bold">
                {t("common.before")}
            </Text>
            <Card m={4} mt={0} border="1px solid">
                {/* Original company */}
                <Text ml={6} mt={4}>
                    {t("components.companyDuplicates.originalCompany")}
                </Text>
                <CompanyDuplicatesCard company={company} m={4} p={4} />
                {/* Company to merge */}
                <Text ml={6} mt={4}>
                    {t("components.companyDuplicates.duplicatedCompany")}
                </Text>
                <CompanyDuplicatesCard
                    company={duplicate}
                    m={4}
                    p={4}
                    backgroundColor="grey.light"
                />
            </Card>

            {/* Arrow */}
            <Flex alignItems="center" justifyContent="center" p={4} fontSize={5}>
                <Icon name="arrowDown" />
            </Flex>

            {/* After */}
            <Text ml={6} fontWeight="bold">
                {t("common.after")}
            </Text>
            <Card m={4} mt={0} border="1px solid">
                {/* Merge preview */}
                <Text ml={6} mt={4}>
                    {t("companies.companyUpdatedSuccess")}
                </Text>
                <CompanyDuplicatesCard
                    // @ts-ignore
                    company={preview}
                    isLoading={isLoadingPreview}
                    m={4}
                    p={4}
                    backgroundColor="green.ultralight"
                />

                {/* Company that will be deleted */}
                <Text ml={6} mt={4}>
                    {t("company.deleted")}
                </Text>
                <Card as={Flex} m={4} p={4} backgroundColor="grey.light" alignItems="center">
                    <Icon name="close" color="red.default" mr={4} />
                    <Text variant="title">
                        <CompanyName company={duplicate} />
                    </Text>
                </Card>
            </Card>

            {/* Confirmation checkbox */}
            <Flex justifyContent="flex-end" p={4} pt={0}>
                <Checkbox
                    checked={confirmationChecked}
                    onChange={setConfirmationChecked}
                    label={t("components.companyDuplicates.userConfirmation")}
                />
            </Flex>

            <Flex justifyContent="flex-end" m={2} backgroundColor={theme.colors.yellow.ultralight}>
                <Text p={2}>{t("components.companyDuplicates.canTakeUpTo5Minutes")}</Text>
            </Flex>
        </Modal>
    );
}
