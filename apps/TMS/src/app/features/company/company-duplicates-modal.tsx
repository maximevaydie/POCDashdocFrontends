import {PartnerDetailOutput} from "@dashdoc/web-common";
import {t} from "@dashdoc/web-core";
import {Box, Button, Flex, Icon, Modal, Text, ModalProps} from "@dashdoc/web-ui";
import {
    getSimilarValuesFromObjects,
    Company,
    useEffectExceptOnMount,
    usePrevious,
} from "dashdoc-utils";
import React, {useState} from "react";

import {CompanyDuplicatesCard} from "./company-duplicates-card";

type Props = Partial<ModalProps> & {
    company: Company | PartnerDetailOutput;
    duplicates: Company[];
    onClickOnMerge: (duplicate: Company) => void;
};

export function CompanyDuplicatesModal(props: Props) {
    const {company, duplicates, onClickOnMerge, ...modalProps} = props;
    const [newDuplicatesFoundAfterMerging, setNewDuplicatesFoundAfterMerging] = useState(0);
    const previousNumberOfDuplicates = usePrevious(duplicates.length);

    useEffectExceptOnMount(() => {
        // @ts-ignore
        setNewDuplicatesFoundAfterMerging(duplicates.length - previousNumberOfDuplicates + 1);
    }, [duplicates.length]);

    return (
        <Modal
            title={`${t("components.companyDuplicates.manageDuplicates")} (${duplicates.length})`}
            id="company-duplicates-modal"
            mainButton={null}
            secondaryButton={null}
            {...modalProps}
        >
            <Box>
                <Text ml={4} mb={4}>
                    {t("components.companyDuplicates.originalCompany")}
                </Text>
                <CompanyDuplicatesCard company={company} p={4} />
                <Text variant="title" textAlign="center" mt={4}>
                    {t("components.companyDuplicatesFound", {
                        smart_count: duplicates.length,
                    })}
                </Text>
                {!!newDuplicatesFoundAfterMerging && (
                    <Text textAlign="center">
                        <Icon name="warning" mr={2} />
                        {t("components.companyDuplicates.newDuplicatesFound", {
                            smart_count: newDuplicatesFoundAfterMerging,
                        })}
                    </Text>
                )}
                <Box maxHeight="50vh" overflowY="auto" mt={4}>
                    {duplicates.map((duplicate) => {
                        const wordsToHighlight = getSimilarValuesFromObjects(
                            company,
                            duplicate
                        ).filter((v: any) => typeof v === "string") as string[];

                        return (
                            <Box key={duplicate.pk}>
                                <Text ml={4} mb={4}>
                                    {t("components.companyDuplicates.duplicatedCompany")}
                                </Text>
                                <CompanyDuplicatesCard
                                    company={duplicate}
                                    wordsToHighlight={wordsToHighlight}
                                    p={4}
                                    backgroundColor="grey.light"
                                />
                                <Flex justifyContent="flex-end" mt={4}>
                                    <Button onClick={onClickOnMerge.bind(undefined, duplicate)}>
                                        {t(
                                            "components.companyDuplicates.mergeWithOriginalCompany"
                                        )}
                                    </Button>
                                </Flex>
                            </Box>
                        );
                    })}
                </Box>
            </Box>
        </Modal>
    );
}
