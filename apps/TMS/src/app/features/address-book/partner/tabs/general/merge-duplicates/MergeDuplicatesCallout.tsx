import {apiService, PartnerDetailOutput, requestCompanySuccess} from "@dashdoc/web-common";
import {Logger, t} from "@dashdoc/web-core";
import {Box, Button, Flex, Icon, LoadingWheel, Text, toast} from "@dashdoc/web-ui";
import {Company, getSimilarValuesFromObjects} from "dashdoc-utils";
import React, {useCallback, useEffect, useState} from "react";

import {CompanyDuplicatesModal} from "app/features/company/company-duplicates-modal";
import {CompanyMergeDuplicateModal} from "app/features/company/company-merge-duplicate-modal";
import {useDispatch} from "app/redux/hooks";

type Props = {
    company: Company | PartnerDetailOutput;
};
export function MergeDuplicatesCallout({company}: Props) {
    const [enabled, setEnabled] = useState<boolean>(false);
    const dispatch = useDispatch();
    const [{loading, duplicates, toMerge}, setState] = useState<{
        loading: boolean;
        duplicates: Company[];
        toMerge: Company | null;
    }>({loading: true, duplicates: [], toMerge: null});

    const fetchCompanyDuplicates = useCallback(async () => {
        setState((prev) => ({...prev, duplicates: [], toMerge: null, loading: true}));
        try {
            const remoteDuplicates = await apiService.Companies.getDuplicates(company.pk);
            setState((prev) => ({...prev, duplicates: remoteDuplicates}));
        } catch (error) {
            Logger.error(error);
        } finally {
            setState((prev) => ({...prev, loading: false}));
        }
    }, [company.pk]);

    const onMerge = async (modifiedCompany: Company) => {
        // after merging companies we refetch the duplicates
        // as new ones might be found from the merge result
        await fetchCompanyDuplicates();
        toast.success(
            duplicates.length
                ? t("components.companyDuplicates.mergeSuccess")
                : t("components.companyDuplicates.mergeAllSuccess")
        );
        // and update the company in store
        dispatch(requestCompanySuccess(modifiedCompany));
    };

    useEffect(() => {
        fetchCompanyDuplicates();
    }, [company, fetchCompanyDuplicates]);
    if (loading) {
        return <LoadingWheel noMargin small />;
    }
    const duplicatesNumber = duplicates.length;
    return (
        <>
            {duplicates?.length > 0 && (
                <Box
                    p={2}
                    mb={2}
                    backgroundColor="grey.light"
                    borderRadius="4px"
                    data-testid="company-merge-duplicates"
                >
                    <Flex alignItems="baseline">
                        <Icon name="info" />
                        <Text ml={2}>
                            {t("components.companyDuplicatesFound", {
                                smart_count: duplicates.length,
                            })}
                        </Text>
                        <Button
                            ml={2}
                            name="duplicate"
                            variant="plain"
                            onClick={() => setEnabled(duplicatesNumber > 0)}
                        >
                            {t("components.merge")}
                        </Button>
                    </Flex>
                </Box>
            )}

            {enabled && (
                <CompanyDuplicatesModal
                    onClose={() => setEnabled(false)}
                    onClickOnMerge={(toMerge) => setState((prev) => ({...prev, toMerge}))}
                    company={company}
                    duplicates={duplicates}
                />
            )}
            {toMerge && (
                <CompanyMergeDuplicateModal
                    onClose={() => setState((prev) => ({...prev, toMerge: null}))}
                    company={company}
                    duplicate={toMerge}
                    wordsToHighlight={
                        getSimilarValuesFromObjects(company, toMerge).filter(
                            (v: any) => typeof v === "string"
                        ) as string[]
                    }
                    onMerge={(modifiedCompany) => {
                        setEnabled(false);
                        onMerge(modifiedCompany);
                    }}
                />
            )}
        </>
    );
}
