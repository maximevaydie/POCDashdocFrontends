import {Logger, t} from "@dashdoc/web-core";
import {
    Button,
    Card,
    ClickableFlex,
    Flex,
    Icon,
    Link,
    Modal,
    Text,
    TextInput,
    theme,
    toast,
} from "@dashdoc/web-ui";
import {useToggle} from "dashdoc-utils";
import React, {useEffect, useState} from "react";
import {useSelector} from "react-redux";

import {getConnectedCompany, getConnectedManager} from "../../../../../react/Redux/accountSelector";
import {analyticsService} from "../../services/analytics/analytics.service";
import {AnalyticsEvent} from "../../services/analytics/types";
import {apiService} from "../../services/api.service";

type Props = {
    product: "wam" | "tms";
    onClick?: () => void;
};

export function ReferralLink({product, onClick}: Props) {
    const [openedModal, openModal, closeModal] = useToggle(false);
    const [email, setEmail] = useState("");

    const connectedManager = useSelector(getConnectedManager);
    const userId = connectedManager?.user.pk ?? "";
    const userName = connectedManager?.user.display_name ?? t("common.notDefined");
    const userLanguage = connectedManager?.language ?? "en";

    const connectedCompany = useSelector(getConnectedCompany);
    const companyId = connectedCompany?.pk;
    const companyName = connectedCompany?.name ?? "";

    const url = `https://www.dashdoc.com/${userLanguage}/contact?ref=${userId}`;
    const termsLink =
        userLanguage === "fr"
            ? "https://help.dashdoc.com/fr/articles/7053551-comment-parrainer-un-nouvel-utilisateur-sur-dashdoc"
            : "https://help.dashdoc.com/en/articles/7053551-how-to-refer-dashdoc";

    const handleFormSubmit = async function (e: React.FormEvent<HTMLFormElement>): Promise<void> {
        e.preventDefault();
        let language = "English";

        if (userLanguage == "fr") {
            language = "French";
        } else if (userLanguage == "de") {
            language = "German";
        } else if (userLanguage == "nl") {
            language = "Dutch";
        } else if (userLanguage == "pl") {
            language = "Polish";
        }

        const isTrainingEnv = import.meta.env.MODE === "training";
        const prefix = isTrainingEnv ? "TRAINING-" : "";

        const sendData = {
            email: email,
            referral_id: prefix + userId,
            referral_link: url,
            referrer_company: prefix + companyName,
            referrer_name: prefix + userName,
            language: language,
            product,
        };

        try {
            await apiService.post("/referral/share-link/", sendData);
            toast.success(t("components.inviteSent"));
            analyticsService.sendEvent(AnalyticsEvent.referralEmailSent, {
                "company id": companyId,
            });
        } catch (e) {
            Logger.error("Error:", e);
            toast.error(t("common.error"));
        }
    };

    useEffect(() => {
        // if referral=true in the url then the modal will open right away when clicking on the link
        const urlSearchParams = new URLSearchParams(window.location.search);
        const modalParam = urlSearchParams.get("referral");
        if (modalParam === "true") {
            openModal();

            urlSearchParams.delete("referral");

            // Create a new URL without the "referral" parameter
            const newUrlWithoutReferral = `${window.location.pathname}${urlSearchParams}`;

            // Replace the current URL without the "referral" parameter
            window.history.replaceState({}, "", newUrlWithoutReferral);
        }
    }, []);

    return (
        <>
            <ClickableFlex
                width="auto"
                flexDirection={"column"}
                backgroundColor={"transparent"}
                hoverStyle={{bg: "transparent"}}
                style={{gap: "0.5rem"}}
                py={2}
                px={3}
                mr={2}
                ml={2}
                borderRadius={1}
                justifyContent={"normal"}
                onClick={() => {
                    onClick && onClick();
                    openModal();
                    analyticsService.sendEvent(AnalyticsEvent.referralModalOpened, {
                        "company id": connectedCompany?.pk,
                    });
                }}
            >
                <Flex justifyContent="space-between" width="100%">
                    <Flex alignItems="center">
                        <Icon display="block" color={"blue.dark"} name={"gift"} mr={2} />
                        <Text color={"blue.dark"} display={["block", "block"]}>
                            {t("sidebar.referral.title")}
                        </Text>
                    </Flex>
                </Flex>
            </ClickableFlex>
            {openedModal && (
                <Modal
                    onClose={closeModal}
                    title={t("sidebar.referral.title")}
                    mainButton={null}
                    size={"large"}
                >
                    <Flex flexDirection={"column"} alignItems="center">
                        {svgGift}
                        <Text variant="title" color={"grey.default"} textAlign={"center"} mt={3}>
                            {t("sidebar.referral.modal.title")}
                        </Text>
                        <Text textAlign={"center"} color={"grey.default"} mt={3}>
                            {t("sidebar.referral.modal.description")}
                        </Text>
                        <Link href={termsLink} target="_blank" rel="noopener noreferrer" mt={3}>
                            {t("common.termsAndConditions")}
                        </Link>
                        <Card m={4} p={1} px={4}>
                            <Flex
                                flexDirection={"column"}
                                alignItems="center"
                                p={3}
                                style={{gap: "0.5rem"}}
                            >
                                <Text width={"100%"} textAlign={"left"} color={"grey.default"}>
                                    {t("sidebar.referral.modal.link")}
                                </Text>
                                <Flex style={{gap: "0.5rem"}}>
                                    <form style={{display: "flex"}} onSubmit={handleFormSubmit}>
                                        <TextInput
                                            width="100%"
                                            borderRadius={1}
                                            padding="0.5rem"
                                            minWidth={[0, "40rem"]}
                                            mr={2}
                                            type="text"
                                            placeholder="Email"
                                            name="email"
                                            value={email}
                                            onChange={(value: string) => {
                                                setEmail(value);
                                            }}
                                        />
                                        <Button type="submit">{t("common.send")}</Button>
                                    </form>
                                </Flex>
                            </Flex>
                        </Card>
                    </Flex>
                </Modal>
            )}
        </>
    );
}

const svgGift = (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width="277"
        height="160"
        fill="none"
        viewBox="0 0 277 160"
    >
        <ellipse cx="82.117" cy="155.428" fill="#EBF0FE" rx="82.117" ry="4.085"></ellipse>
        <path
            fill="#EBF0FE"
            stroke="#EBF0FE"
            strokeWidth="0.817"
            d="M29.47 93.977C26.53-1.785 140.186-5.298 197.382 4.915c171.914 43.796 9.749 82.122 0 86.372-71.222 31.049-164.969 98.452-167.91 2.69z"
        ></path>
        <g clipPath="url(#clip0_14_8701)">
            <path
                fill="#fff"
                stroke={theme.colors.blue.default}
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="7.66"
                d="M202.585 73.976h-99.582v53.621a7.657 7.657 0 007.66 7.66h84.262a7.657 7.657 0 007.66-7.66V73.976zM202.585 50.995h-99.582a7.66 7.66 0 00-7.66 7.66v11.49a3.83 3.83 0 003.83 3.83h107.242a3.829 3.829 0 003.83-3.83v-11.49a7.659 7.659 0 00-7.66-7.66z"
            ></path>
            <path
                fill="#fff"
                d="M148.964 50.995c-16.924 0-34.471-13.716-34.471-30.64l34.471 30.64z"
            ></path>
            <path
                stroke={theme.colors.blue.default}
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="7.66"
                d="M148.964 50.995c-16.924 0-34.471-13.716-34.471-30.64"
            ></path>
            <path
                fill="#fff"
                d="M114.493 20.355c16.924 0 34.471 13.716 34.471 30.64l-34.471-30.64z"
            ></path>
            <path
                stroke={theme.colors.blue.default}
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="7.66"
                d="M114.493 20.355c16.924 0 34.471 13.716 34.471 30.64"
            ></path>
            <path
                fill="#fff"
                d="M156.624 50.995c16.924 0 34.471-13.716 34.471-30.64l-34.471 30.64z"
            ></path>
            <path
                stroke={theme.colors.blue.default}
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="7.66"
                d="M156.624 50.995c16.924 0 34.471-13.716 34.471-30.64"
            ></path>
            <path
                fill="#fff"
                d="M191.095 20.355c-16.924 0-34.471 13.716-34.471 30.64l34.471-30.64z"
            ></path>
            <path
                stroke={theme.colors.blue.default}
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="7.66"
                d="M191.095 20.355c-16.924 0-34.471 13.716-34.471 30.64M164.284 50.995h-22.98v84.262h22.98V50.995z"
            ></path>
        </g>
        <defs>
            <clipPath id="clip0_14_8701">
                <path
                    fill="#fff"
                    d="M0 0H122.562V122.562H0z"
                    transform="translate(91.513 16.524)"
                ></path>
            </clipPath>
        </defs>
    </svg>
);
