import {getConnectedCompany} from "@dashdoc/web-common";
import {t} from "@dashdoc/web-core";
import {Box, Button, Flex, Icon, Text, TextInput} from "@dashdoc/web-ui";
import styled from "@emotion/styled";
import {Company, TransportMessagePost, VisibilityLevel} from "dashdoc-utils";
import React from "react";
import {connect} from "react-redux";

import {RootState} from "app/redux/reducers/index";
import {getOneWordVisibilityLabel, getVisibilityIcon} from "app/services/transport";

import {VisibilityPicker, VisibilityPickerOption} from "./VisibilityPicker";

import type {Transport} from "app/types/transport";

const TransportNoteInputForm = styled("form")`
    display: flex;
    flex-direction: row;
    flex-wrap: nowrap;
    margin-bottom: 10px;

    @media (max-width: 581px) {
        flex-wrap: wrap;
    }

    & > input {
        flex-grow: 1;
        margin-right: 10px;
        @media (max-width: 581px) {
            margin-bottom: 10px;
        }
    }
`;

interface TransportNoteInputProps {
    transport: Transport;
    onAddNote: (transportUid: string, deliveryUid: string, message: any) => Promise<any>;
}

interface StateProps {
    company: Company;
}

interface TransportNoteInputState {
    message: string;
    loading: boolean;
    visibility_level: VisibilityPickerOption;
}

class TransportNoteInput extends React.Component<
    TransportNoteInputProps & StateProps,
    TransportNoteInputState
> {
    constructor(props: TransportNoteInputProps & StateProps) {
        super(props);
        this.state = {
            message: "",
            visibility_level: {value: "own_company_only_except_truckers"},
            loading: false,
        };
    }

    handleInputChange = (input: string) => {
        this.setState({message: input});
    };

    generateVisibilityPayload = (
        visiblityOptionValue: VisibilityLevel,
        companyPk: number
    ): Partial<TransportMessagePost> => {
        switch (visiblityOptionValue) {
            case "everyone":
                return {
                    visible_by_everyone: true,
                };
            case "own_company_only":
                return {
                    visible_by_everyone: false,
                    readable_by_company_ids: [companyPk],
                };
            case "own_company_only_except_truckers":
                return {
                    visible_by_everyone: false,
                    readable_by_company_ids: [companyPk],
                    readable_by_trucker: false,
                };
        }
    };

    handleSubmit = (event: any) => {
        event.preventDefault();
        if (this.state.message) {
            let deliveryUid;
            if (this.props.transport.deliveries.length === 1) {
                deliveryUid = this.props.transport.deliveries[0].uid;
            }
            const visibilityLevelValue = this.state.visibility_level.value;
            const newVisibilityData = this.generateVisibilityPayload(
                // @ts-ignore
                visibilityLevelValue,
                this.props.company.pk
            );
            this.setState({loading: true});
            this.props
                // @ts-ignore
                .onAddNote(this.props.transport.uid, deliveryUid, {
                    message: this.state.message,
                    type: "note",
                    ...newVisibilityData,
                })
                .then(() => {
                    this.setState({message: "", loading: false});
                });
        }
    };

    render() {
        return (
            <TransportNoteInputForm className="form-inline" onSubmit={this.handleSubmit}>
                <Flex flexDirection="row" flexWrap="nowrap" width="100%">
                    <Box flex={1}>
                        <TextInput
                            height={38}
                            disabled={this.state.loading}
                            value={this.state.message}
                            onChange={this.handleInputChange}
                            placeholder={t("transportsForm.addStatusNote")}
                            data-testid="transport-note-input"
                        />
                    </Box>
                    <VisibilityPicker
                        value={this.state.visibility_level}
                        // @ts-ignore
                        onChange={(visibility_level) => this.setState({visibility_level})}
                        formatOptionLabel={({value}) => (
                            <Flex alignItems="center">
                                {/*
// @ts-ignore */}
                                <Icon mr={1} name={getVisibilityIcon(value)} />
                                {/*
// @ts-ignore */}
                                {getOneWordVisibilityLabel(value)}
                            </Flex>
                        )}
                        styles={{
                            container: (provided) => ({
                                ...provided,
                                width: "170px",
                                display: "inline-block",
                                verticalAlign: "bottom",
                                marginRight: "10px",
                                marginLeft: "10px",
                            }),
                            control: (provided) => ({
                                ...provided,
                                height: "38px",
                            }),
                        }}
                    />
                    <Button
                        height={38}
                        type="submit"
                        loading={this.state.loading}
                        variant="secondary"
                        data-testid="transport-note-submit"
                    >
                        <Icon name="send" mr={2} />
                        <Text>{t("common.send")}</Text>
                    </Button>
                </Flex>
            </TransportNoteInputForm>
        );
    }
}

const mapStateToProps = (state: RootState) => ({
    company: getConnectedCompany(state),
});

export default connect(mapStateToProps)(TransportNoteInput);
