import {t} from "@dashdoc/web-core";
import {Icon, Link, Modal, Text} from "@dashdoc/web-ui";
import {HorizontalLine} from "@dashdoc/web-ui";
import {useToggle} from "dashdoc-utils";
import React from "react";

type Props = Omit<Parameters<typeof Icon>[0], "name" | "color" | "onClick" | "children">;

export function CarbonFootprintOnboardingIcon(props: Props) {
    const [isOpen, open, close] = useToggle();

    return (
        <>
            <Icon
                {...props}
                name="questionCircle"
                color="blue.default"
                onClick={open}
                css={{
                    cursor: "pointer",
                }}
            />
            {isOpen && (
                <Modal
                    mainButton={{
                        children: t("common.confirmUnderstanding"),
                        onClick: close,
                    }}
                    size="large"
                    onClose={close}
                    title={t("carbonFootprint.onboarding.modalTitle")}
                >
                    <Text>{t("carbonFootprint.onboarding.description")}</Text>
                    <Text mt={3} variant="h1">
                        {"1."} <Icon name="tripDistance" mx={2} verticalAlign="text-bottom" />{" "}
                        {t("carbonFootprint.onboarding.distanceSubtitle")}
                    </Text>
                    <Text
                        dangerouslySetInnerHTML={{
                            __html: t("carbonFootprint.onboarding.distanceDescription"),
                        }}
                    />
                    <Text mt={3} variant="h1">
                        {"2."} <Icon name="load" mx={2} verticalAlign="text-bottom" />{" "}
                        {t("carbonFootprint.onboarding.weightSubtitle")}
                    </Text>
                    <Text
                        dangerouslySetInnerHTML={{
                            __html: t("carbonFootprint.onboarding.weightDescription"),
                        }}
                    />
                    <Text mt={3} variant="h1">
                        {"3."} <Icon name="graphStats" mx={2} verticalAlign="text-bottom" />{" "}
                        {t("carbonFootprint.onboarding.emissionRateSubtitle")}
                    </Text>
                    <Text
                        dangerouslySetInnerHTML={{
                            __html: t("carbonFootprint.onboarding.emissionRateDescription"),
                        }}
                    />
                    <Text>
                        <Link
                            href="https://help.dashdoc.eu/fr/articles/6138895-comment-connaitre-la-quantite-d-emission-co2-de-ma-prestation-de-transport"
                            target="_blank"
                            rel="noopener noreferrer"
                            lineHeight={1}
                        >
                            {t("common.findOutMore")}
                        </Link>
                    </Text>

                    <HorizontalLine mt={3} />
                </Modal>
            )}
        </>
    );
}
