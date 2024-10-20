import {t} from "@dashdoc/web-core";
import {Box, Flex, Modal, Text, TextArea} from "@dashdoc/web-ui";
import React from "react";
import {connect} from "react-redux";

import {fetchUpdateSite} from "app/redux/actions";

import type {Activity} from "app/types/transport";

interface OwnProps {
    truckerInstructionsVisible: boolean;
    activity: Activity;
    editable: boolean;
    onClose: () => void;
}

interface StateProps {}

interface DispatchProps {
    fetchUpdateSite?: (siteUid: string, instructions: any) => any;
}

type UpdateInstructionsModalProps = OwnProps & StateProps & DispatchProps;

interface UpdateInstructionsModalState {
    siteInstructions: string;
    truckerInstructions: string;
    loading: boolean;
}

class UpdateInstructionsModal extends React.Component<
    UpdateInstructionsModalProps,
    UpdateInstructionsModalState
> {
    constructor(props: UpdateInstructionsModalProps) {
        super(props);

        const activity = props.activity;
        this.state = {
            // @ts-ignore
            siteInstructions: activity.site.instructions,
            truckerInstructions: activity.site.trucker_instructions || "",
            loading: false,
        };
    }

    handleSiteInstructionsChange = (value: string) => {
        this.setState({siteInstructions: value});
    };

    handleTruckerInstructionsChange = (value: string) => {
        this.setState({truckerInstructions: value});
    };

    handleSubmit = () => {
        this.setState({loading: true});
        // @ts-ignore
        this.props
            .fetchUpdateSite(this.props.activity.site.uid, {
                instructions: this.state.siteInstructions,
                trucker_instructions: this.state.truckerInstructions,
            })
            .then(() => {
                this.setState({loading: false});
                this.props.onClose();
            });
    };

    render = () => {
        const isLoadingActivityType = this.props.activity.type === "loading";

        return (
            <Modal
                title={t("components.truckerInstructions")}
                onClose={this.props.onClose}
                id="update-site-instructions-modal"
                data-testid="update-site-instructions-modal"
                mainButton={
                    this.props.editable
                        ? {
                              children: t("common.save"),
                              disabled: this.state.loading,
                              loading: this.state.loading,
                              ["data-testid"]: "instructions-modal-save",
                              onClick: this.handleSubmit,
                          }
                        : {
                              ["data-testid"]: "instructions-modal-back",
                              onClick: () => this.props.onClose(),
                          }
                }
            >
                <Flex flexDirection="column">
                    <Text mb={4}>
                        {isLoadingActivityType
                            ? t("siteInstructionsModal.mainLoadingTooltip")
                            : t("siteInstructionsModal.mainUnloadingTooltip")}
                    </Text>
                    <Box>
                        <Text my={2}>
                            {t("siteInstructionsModal.activityInstructionsTooltip")}
                        </Text>
                        <TextArea
                            label={
                                isLoadingActivityType
                                    ? t("transportForm.activityInstructionsLoadingTitle")
                                    : t("transportForm.activityInstructionsUnloadingTitle")
                            }
                            minHeight={100}
                            maxLength={1000}
                            value={this.state.siteInstructions}
                            // @ts-ignore
                            onChange={this.props.editable && this.handleSiteInstructionsChange}
                            data-testid={`${
                                isLoadingActivityType ? "loading" : "unloading"
                            }-instructions-modal-input`}
                            readOnly={!this.props.editable}
                        />
                    </Box>
                    {this.props.truckerInstructionsVisible && (
                        <Box mt={4}>
                            <Text my={2}>
                                {t("siteInstructionsModal.truckerInstructionsTooltip")}
                            </Text>
                            <TextArea
                                label={t("transportsForm.truckerInstructions")}
                                minHeight={100}
                                maxLength={1000}
                                value={this.state.truckerInstructions}
                                // @ts-ignore
                                onChange={
                                    this.props.editable && this.handleTruckerInstructionsChange
                                }
                                data-testid={`${
                                    isLoadingActivityType ? "loading" : "unloading"
                                }-trucker-instructions-modal-input`}
                                readOnly={!this.props.editable}
                            />
                        </Box>
                    )}
                </Flex>
            </Modal>
        );
    };
}

export default connect<StateProps, DispatchProps, OwnProps>(undefined, {fetchUpdateSite})(
    UpdateInstructionsModal
);
