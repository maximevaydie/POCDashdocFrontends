import {
    fetchCompany,
    fetchPartner,
    fetchUpdateCompany,
    fetchUpdatePartner,
    PartnerDetailOutput,
    useFeatureFlag,
} from "@dashdoc/web-common";
import {t} from "@dashdoc/web-core";
import {Card, NotesInput, Text} from "@dashdoc/web-ui";
import {Company, useToggle} from "dashdoc-utils";
import React from "react";

import {useDispatch} from "app/redux/hooks";

type Props = {
    company: Company | PartnerDetailOutput;
};
export function NotesCard({company}: Props) {
    const {notes} = company;
    const dispatch = useDispatch();
    const [isSubmitting, setIsSubmitting, setIsSubmitted] = useToggle();
    const hasBetterCompanyRoles = useFeatureFlag("betterCompanyRoles");

    const emptyMessageCompany = (
        <Text ml={2} color="blue.dark" width="300px">
            {t("company.notes.empty")}
        </Text>
    );

    const helpText = (
        <>
            <Text>{t("company.notes.visibility")}</Text>
            <ul style={{marginTop: "8px", paddingLeft: "24px"}}>
                <li>
                    <Text>{t("company.notes.visibilityTeamMembers")}</Text>
                </li>
                <li>
                    <Text>{t("company.notes.noAccessToInvitedContacts")}</Text>
                </li>
            </ul>
        </>
    );

    return (
        <Card data-testid="company-notes" mb={4} p={2}>
            <Text variant="h1" color="grey.dark" p={2}>
                {t("unavailability.notes")}
            </Text>
            <NotesInput
                value={notes}
                disabled={isSubmitting}
                emptyMessage={emptyMessageCompany}
                helpText={helpText}
                onUpdate={handleUpdate}
                p={4}
            />
        </Card>
    );

    async function handleUpdate(newNotes: string) {
        setIsSubmitting();
        try {
            const companyPk = company.pk;
            const payload = {notes: newNotes};
            /**
             * there are two company locations in the redux store for now
             *  - One at entities.companies[pk] (updated by fetchUpdateCompany)
             *  - One at companies.items[pk] (updated by fetchCompany)
             * TODO We should do something to avoid this double update!
             * The fetchUpdateCompany should be enough!
             */
            if (hasBetterCompanyRoles) {
                await dispatch(fetchUpdatePartner(companyPk, payload));
                await dispatch(fetchPartner(company.pk));
            } else {
                await dispatch(fetchUpdateCompany(companyPk, payload));
                await dispatch(fetchCompany(companyPk.toString()));
            }
            // The fetchUpdateCompany handle the error and show the toast
        } finally {
            setIsSubmitted();
        }
    }
}
