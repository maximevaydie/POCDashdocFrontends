import {urlService} from "@dashdoc/web-common";
import {t} from "@dashdoc/web-core";
import {
    Box,
    Button,
    Callout,
    Flex,
    Select,
    Text,
    TextInput,
    toast,
    SelectOption,
} from "@dashdoc/web-ui";
import {copyToClipboard} from "dashdoc-utils";
import React, {FormEvent} from "react";
import {connect} from "react-redux";

import {fetchShareDelivery} from "app/redux/actions";

import type {Transport} from "app/types/transport";

interface OwnProps {
    transport: Transport;
}

interface StateProps {}

interface DispatchProps {
    fetchShareDelivery: (uid: string, email: string) => any;
}

type PartialDeliveryProps = OwnProps & StateProps & DispatchProps;

interface PartialDeliveryState {
    email: string;
    email_error: string | undefined;
    loading: boolean;
    deliveryUid?: string;
}

interface PartialDelivery {
    shipper_address: {company: {name: string}};
    destination: {address?: {company: {name: string}; city?: string}};
    origin: {address?: {company: {name: string}; city?: string}};
}

class ShareDeliveryTrackingLinkComponent extends React.Component<
    PartialDeliveryProps,
    PartialDeliveryState
> {
    constructor(props: PartialDeliveryProps) {
        super(props);
        this.state = {
            email: "",
            email_error: undefined,
            loading: false,
            deliveryUid: props.transport.deliveries[0].uid,
        };
    }

    handleInputChange = (value: string) => {
        this.setState({email: value, email_error: value ? undefined : t("common.mandatoryField")});
    };

    handleSubmit = (event: FormEvent) => {
        event.preventDefault();
        if (!this.state.email.trim()) {
            this.setState({email_error: t("common.mandatoryField")});
            return;
        }

        this.setState({loading: true, email_error: undefined});
        if (this.state.deliveryUid) {
            this.props.fetchShareDelivery(this.state.deliveryUid, this.state.email);
        }
    };

    getDeliveryName = (delivery: PartialDelivery) => {
        delivery.shipper_address = delivery.shipper_address || {
            company: {name: t("common.shipper")},
        };
        delivery.destination = delivery.destination || {
            address: {company: {name: t("common.delivery")}},
        };
        delivery.origin = delivery.origin || {address: {company: {name: t("common.pickup")}}};

        return `Livraison pour ${delivery.shipper_address?.company?.name}, ${
            delivery.origin.address?.company?.name ?? t("common.pickup")
        } ${delivery.origin?.address?.city ?? ""} ▸ ${
            delivery.destination?.address?.company?.name ?? t("common.delivery")
        } ${delivery.destination?.address?.city ?? ""}`;
    };

    getDeliveriesOptions = () => {
        return this.props.transport.deliveries.map((d) => {
            return {label: this.getDeliveryName(d as PartialDelivery), value: d.uid};
        });
    };

    handleDeliveryChange = (option: SelectOption<string>) => {
        this.setState({deliveryUid: option.value});
    };

    render = () => {
        if (this.props.transport.business_privacy) {
            return <Text>{t("transport.underBusinessPrivacy")}</Text>;
        }

        const link = `${urlService.getBaseUrl()}/tracking/shipments/${this.state.deliveryUid}/`;
        return (
            <Box id="share-shipment-modal">
                <Callout variant="informative" my={3}>
                    <Text>{t("shareDelivery.description")}</Text>
                </Callout>
                {this.props.transport.deliveries.length > 1 && (
                    <React.Fragment>
                        <Text variant="h1" mb={1}>
                            {t("shareDelivery.chooseDelivery")}
                        </Text>
                        <Select
                            options={this.getDeliveriesOptions()}
                            value={this.getDeliveriesOptions().find(
                                ({value}) => value === this.state.deliveryUid
                            )}
                            onChange={this.handleDeliveryChange}
                        />
                    </React.Fragment>
                )}

                <Text variant="h1" mt={4} mb={1}>
                    {t("shareDelivery.linkTitle")}
                </Text>
                <Text mb={1}>{t("shareDelivery.linkText")}</Text>

                <Flex flex={1} mb={1}>
                    <TextInput
                        disabled
                        containerProps={{flex: 1}}
                        value={link}
                        onChange={() => {}}
                        onFocus={(event) => event.target.select()}
                    ></TextInput>
                    <Button
                        ml={1}
                        variant="secondary"
                        data-testid="copy-invitation-link"
                        onClick={() => {
                            copyToClipboard(
                                link,
                                () => toast.success(t("common.linkCopied")),
                                () => toast.error(t("common.linkCopyFailed"))
                            );
                        }}
                    >
                        {t("common.copyLink")}
                    </Button>
                </Flex>

                <Text variant="h1" mt={4} mb={1}>
                    {t("shareDelivery.emailTitle")}
                </Text>
                <Text mb={1}>{t("shareDelivery.emailText")}</Text>
                <form onSubmit={this.handleSubmit}>
                    <Flex>
                        <Box flex={1} mr={1}>
                            <TextInput
                                id="email-input"
                                type="email"
                                placeholder="Ex : jean@example.com"
                                value={this.state.email}
                                onChange={this.handleInputChange}
                                error={this.state.email_error}
                            />
                        </Box>
                        <Button variant="primary" onClick={this.handleSubmit}>
                            {t("common.send")}
                        </Button>
                    </Flex>
                </form>

                <Callout variant="warning" mb={3} mt={6}>
                    <Text>{t("shareDelivery.warning")}</Text>
                </Callout>
            </Box>
        );
    };
}

export const ShareDeliveryTrackingLinkTab = connect<StateProps, DispatchProps, OwnProps>(null, {
    fetchShareDelivery,
})(ShareDeliveryTrackingLinkComponent);
