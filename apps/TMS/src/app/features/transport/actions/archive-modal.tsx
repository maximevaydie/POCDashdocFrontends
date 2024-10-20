import {t} from "@dashdoc/web-core";
import {LoadingWheel, Modal, Text} from "@dashdoc/web-ui";
import React from "react";
import {connect} from "react-redux";

import {fetchArchiveTransports, fetchUnarchiveTransports} from "app/redux/actions";
import {RootState} from "app/redux/reducers/index";
import {SearchQuery} from "app/redux/reducers/searches";

interface OwnProps {
    selectedTransportsQuery: SearchQuery;
    selectedTransportsCount: number;
    type: "archive" | "unarchive";
    onSubmit: () => void;
    onClose: () => void;
}

interface StateProps {
    query: any;
}

interface DispatchProps {
    fetchArchiveTransports: (filters: any) => any;
    fetchUnarchiveTransports: (filters: any) => any;
}

type ArchiveModalProps = OwnProps & StateProps & DispatchProps;

interface ArchiveModalState {
    loadingSubmit: boolean;
}

class ArchiveModal extends React.Component<ArchiveModalProps, ArchiveModalState> {
    constructor(props: ArchiveModalProps) {
        super(props);

        this.state = {
            loadingSubmit: false,
        };
    }

    handleArchiveSubmitType = (type: ArchiveModalProps["type"]) => {
        if (type === "archive") {
            return this.props.fetchArchiveTransports(this.props.selectedTransportsQuery);
        }

        return this.props.fetchUnarchiveTransports(this.props.selectedTransportsQuery);
    };

    handleSubmit = (e: React.MouseEvent<HTMLElement>) => {
        e.preventDefault();
        this.setState({loadingSubmit: true});
        this.handleArchiveSubmitType(this.props.type).then(() => {
            this.props.onSubmit();
            this.props.onClose();
        });
    };

    render = () => {
        return (
            <Modal
                title={
                    this.props.type === "archive"
                        ? t("components.archiveTransports")
                        : t("components.unarchiveTransports")
                }
                id="archive-modal"
                onClose={this.props.onClose}
                mainButton={{
                    onClick: this.handleSubmit,
                    disabled: this.state.loadingSubmit || this.props.selectedTransportsCount === 0,
                    children:
                        this.props.type === "archive"
                            ? t("common.archive")
                            : t("common.unarchive"),
                }}
            >
                {this.state.loadingSubmit ? (
                    <LoadingWheel noMargin={true} small={true} />
                ) : (
                    <Text variant="h1" textAlign="center">
                        {this.props.type === "archive"
                            ? t("components.archiveTransportsCount", {
                                  count: this.props.selectedTransportsCount,
                              })
                            : t("components.unarchiveTransportsCount", {
                                  count: this.props.selectedTransportsCount,
                              })}
                    </Text>
                )}
            </Modal>
        );
    };
}

const mapStateToProps = (state: RootState) => {
    return {
        query: state.searches.transports.currentQuery,
    };
};

export default connect<StateProps, DispatchProps, OwnProps>(mapStateToProps, {
    fetchArchiveTransports,
    fetchUnarchiveTransports,
})(ArchiveModal);
