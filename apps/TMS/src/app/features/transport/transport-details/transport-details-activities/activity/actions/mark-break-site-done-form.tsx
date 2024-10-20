import {getTimezone} from "@dashdoc/web-common";
import {t} from "@dashdoc/web-core";
import {Checkbox, DatePicker, Flex, Modal, Text} from "@dashdoc/web-ui";
import {Callout} from "@dashdoc/web-ui";
import {getSiteZonedRealDateTimes, zoneDateToISO} from "dashdoc-utils";
import {isAfter, isBefore} from "date-fns";
import React from "react";
import {connect} from "react-redux";

import {fetchMarkSiteDone} from "app/redux/actions";
import {RootState} from "app/redux/reducers/index";

import type {Activity} from "app/types/transport";

interface OwnProps {
    title: string;
    onFinish: () => void;
    activity: Activity;
    resumeIsDone?: boolean;
}

interface StateProps {
    timezone: string;
}

interface DispatchProps {
    fetchMarkSiteDone?: (
        siteUid: string,
        activityType: string,
        onSiteDate: string,
        completeDate: string
    ) => any;
}

type MarkBreakActivityDoneFormProps = OwnProps & StateProps & DispatchProps;

interface MarkBreakActivityDoneFormState {
    startDate?: Date;
    saveEndDate: boolean;
    endDate?: Date;
    loading: boolean;
}
class MarkSiteDoneForm extends React.Component<
    MarkBreakActivityDoneFormProps,
    MarkBreakActivityDoneFormState
> {
    canUpdateBreakStart: boolean;

    constructor(props: MarkBreakActivityDoneFormProps) {
        super(props);
        const {zonedStart: zonedRealStart} = getSiteZonedRealDateTimes(
            props.activity.site,
            props.timezone
        );

        // if an actual start date has been set but the status is not done
        // it means the break is started and the dispatcher is now marking
        // the break as done. So we only show the end date part of the form.
        this.canUpdateBreakStart = props.activity.status !== "done" && !zonedRealStart;

        this.state = {
            startDate: new Date(),
            saveEndDate: !props.resumeIsDone,
            endDate: new Date(),
            loading: false,
        };
    }

    handleSubmit = () => {
        this.setState({loading: true});
        if (this.canUpdateBreakStart) {
            // @ts-ignore
            this.props
                .fetchMarkSiteDone(
                    this.props.activity.site?.uid,
                    "bulking_break_started",
                    // @ts-ignore
                    null,
                    // @ts-ignore
                    zoneDateToISO(this.state.startDate, this.props.timezone)
                )
                .then(() => {
                    if (!this.props.resumeIsDone && this.state.saveEndDate) {
                        // @ts-ignore
                        this.props
                            .fetchMarkSiteDone(
                                this.props.activity.site?.uid,
                                "bulking_break_complete",
                                // @ts-ignore
                                null,
                                // @ts-ignore
                                zoneDateToISO(this.state.endDate, this.props.timezone)
                            )
                            .then(() => {
                                this.setState({loading: false});
                                this.props.onFinish();
                            });
                    }
                    this.setState({loading: false});
                    this.props.onFinish();
                });
        } else if (!this.props.resumeIsDone && this.state.saveEndDate) {
            // @ts-ignore
            this.props
                .fetchMarkSiteDone(
                    this.props.activity.site?.uid,
                    "bulking_break_complete",
                    // @ts-ignore
                    null,
                    // @ts-ignore
                    zoneDateToISO(this.state.endDate, this.props.timezone)
                )
                .then(() => {
                    this.setState({loading: false});
                    this.props.onFinish();
                });
        }
    };

    handleStartDateChange = (date: Date) => {
        let newState: Pick<MarkBreakActivityDoneFormState, "startDate" | "endDate"> = {
            startDate: new Date(date),
        };
        // @ts-ignore
        if (date && isAfter(date, this.state.endDate)) {
            newState.endDate = new Date(date);
        }

        this.setState({...newState});
    };

    handleEndDateChange = (date: Date) => {
        let newState: Pick<MarkBreakActivityDoneFormState, "startDate" | "endDate"> = {
            endDate: new Date(date),
        };
        // @ts-ignore
        if (date && isBefore(date, this.state.startDate)) {
            newState.startDate = new Date(date);
        }
        this.setState(newState);
    };

    render = () => {
        return (
            <Modal
                title={this.props.title}
                onClose={this.props.onFinish}
                id="update-site-arrival-date-modal"
                data-testid="update-site-arrival-date-modal"
                mainButton={{
                    onClick: this.handleSubmit,
                    disabled: this.state.loading,
                    loading: this.state.loading,
                    children: t("common.save"),
                }}
            >
                {this.canUpdateBreakStart && (
                    <>
                        <Text>{t("markActivityDone.markBulkingBreakStartDone")}</Text>

                        <Flex alignItems="center" flexWrap="wrap" mb={4}>
                            <Text mr={2} width={["100%", "45%", "45%"]}>
                                {t("markActivityDone.bulkingBreakStartDate")}
                            </Text>
                            <DatePicker
                                // @ts-ignore
                                date={this.state.startDate}
                                onChange={this.handleStartDateChange}
                                showTime={true}
                                disabled={!this.canUpdateBreakStart}
                                textInputWidth="150px"
                                rootId="react-app-modal-root"
                            />
                        </Flex>
                    </>
                )}
                {!this.props.resumeIsDone && this.canUpdateBreakStart && (
                    <Checkbox
                        data-testid="set-resume-done-date-checkbox"
                        label={t("markActivityDone.markBulkingBreakEndDone")}
                        checked={this.state.saveEndDate}
                        onChange={(checked: boolean) => this.setState({saveEndDate: checked})}
                    />
                )}
                {!this.props.resumeIsDone && this.state.saveEndDate && (
                    <>
                        <Flex alignItems="center" flexWrap="wrap" mb={2}>
                            <Text mr={2} width={["100%", "45%", "45%"]}>
                                {t("markActivityDone.bulkingBreakEndDate")}
                            </Text>
                            <DatePicker
                                // @ts-ignore
                                date={this.state.endDate}
                                onChange={this.handleEndDateChange}
                                showTime={true}
                                disabled={!this.state.saveEndDate}
                                textInputWidth="150px"
                                rootId="react-app-modal-root"
                            />
                        </Flex>
                        {!this.props.activity.segment?.trucker && (
                            <Callout variant="warning">
                                {t("markActivityDone.missingTruckerToMarkBreakEndDone")}
                            </Callout>
                        )}
                    </>
                )}
            </Modal>
        );
    };
}

const mapStateToProps = (state: RootState): StateProps => {
    return {
        timezone: getTimezone(state),
    };
};

export default connect<StateProps, DispatchProps, OwnProps>(mapStateToProps, {
    fetchMarkSiteDone,
})(MarkSiteDoneForm);
