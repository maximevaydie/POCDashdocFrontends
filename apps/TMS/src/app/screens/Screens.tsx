import {
    TMS_ROOT_PATH as APP,
    GROUP_VIEW_PATH as GROUP_VIEW,
    HasFeatureFlag,
    HasNotFeatureFlag,
    hasRoleUser,
    LoginByModerationToken,
    LoginScreen,
    NotFoundScreen,
    RouteFeatureFlag,
    useIsGroupView,
    useSetupMonitoring,
} from "@dashdoc/web-common";
import React from "react";
import {Redirect, Route, Switch} from "react-router-dom";

import {PrivateRoute} from "app/common/router/PrivateRoute";
import {PrivateScreenWrapper} from "app/common/screen/PrivateScreenWrapper";
import {GroupViewSettingsScheduler} from "app/features/scheduler/settings/GroupViewSettingsScheduler";
import {
    LINK_ADDRESS_BOOK as ADDRESS_BOOK,
    LINK_CONTACTS as ADDRESS_BOOK_CONTACTS,
    LINK_LOGISTIC_POINTS as ADDRESS_BOOK_LOGISTIC_POINTS,
    LINK_LOGISTIC_POINTS_EXPORTS as ADDRESS_BOOK_LOGISTIC_POINTS_EXPORTS,
    LINK_PARTNERS as ADDRESS_BOOK_PARTNERS,
    LINK_PARTNERS_EXPORTS as ADDRESS_BOOK_PARTNERS_EXPORTS,
} from "app/features/sidebar/constants";
import useIsInvited from "app/hooks/useIsInvited";
import useIsShipper from "app/hooks/useIsShipper";
import {CompaniesScreen} from "app/screens/address-book/CompaniesScreen";
import {CompanyScreen} from "app/screens/address-book/CompanyScreen";
import {ContactsScreen} from "app/screens/address-book/ContactsScreen";
import {LogisticPointsExportsScreen} from "app/screens/address-book/LogisticPointsExportsScreen";
import {LogisticPointsScreen} from "app/screens/address-book/LogisticPointsScreen";
import {PartnerScreen} from "app/screens/address-book/PartnerScreen";
import {PartnersExportsScreen} from "app/screens/address-book/PartnersExportsScreen";
import {PartnersScreen} from "app/screens/address-book/PartnersScreen";
import {MyEquipmentScreen} from "app/screens/fleet/MyEquipmentScreen";
import {CreditNotesListScreen} from "app/screens/invoicing/CreditNotesListScreen";
import {FuelSurchargeScreen} from "app/screens/invoicing/FuelSurchargeScreen";
import {TransportsDashboardScreen} from "app/screens/transport/transports-screen/TransportsDashboardScreen";
import {TransportsExportScreen} from "app/screens/transport/transports-screen/TransportsExportScreen";
import {TransportsListScreen} from "app/screens/transport/transports-screen/TransportsListScreen";
import {TripEditionScreen} from "app/screens/trip/TripEditionScreen";
import {CreditNoteScreen} from "app/taxation/invoicing/screens/CreditNoteScreen";
import {InvoiceReportingScreen} from "app/taxation/invoicing/screens/InvoiceReportingScreen";
import {InvoiceScreen} from "app/taxation/invoicing/screens/InvoiceScreen";
import {RevenueReportingScreen} from "app/taxation/invoicing/screens/RevenueReportingScreen";
import {SharedCreditNoteScreen} from "app/taxation/invoicing/screens/SharedCreditNoteScreen";
import {SharedInvoiceScreen} from "app/taxation/invoicing/screens/SharedInvoiceScreen";

import {SettingsScreen} from "./company/SettingsScreen";
import {FleetUnitScreen} from "./fleet/FleetUnitScreen";
import {TruckerScreen} from "./fleet/truckers/TruckerScreen";
import {TruckersScreen} from "./fleet/truckers/TruckersScreen";
import {EntitiesScreen} from "./group-views/EntitiesScreen";
import {ManagersScreen} from "./group-views/ManagersScreen";
import {FuelSurchargesScreen} from "./invoicing/FuelSurchargesScreen";
import {InvoicesExportScreen} from "./invoicing/InvoicesExportsScreen";
import {InvoicesScreen} from "./invoicing/InvoicesScreen";
import {TariffGridScreen} from "./invoicing/TariffGridScreen";
import {TariffGridsScreen} from "./invoicing/TariffGridsScreen";
import {ReportScreen} from "./reports/ReportScreen";
import {ReportsScreen} from "./reports/ReportsScreen";
import {SchedulerScreen} from "./scheduler/SchedulerScreen";
import {NewTransportScreen, NewTransportScreenProps} from "./transport/NewTransportScreen";
import {PublicAcceptDeclineOrderScreen} from "./transport/PublicAcceptDeclineOrderScreen";
import {PublicDeliveryScreen} from "./transport/PublicDeliveryScreen";
import {SignatureScreen} from "./transport/SignatureScreen";
import {TracesScreen} from "./transport/TracesScreen";
import {TrackingScreen} from "./transport/TrackingScreen";
import {TransportScreen} from "./transport/TransportScreen";
import {UpdateLateTransportScreen} from "./transport/UpdateLateTransportScreen";
import {CarrierAssignationRulesScreen} from "./transportation-plan/CarrierAssignationRulesScreen";
import {QuotationScreen} from "./transportation-plan/QuotationScreen";
import {AccountSettingsScreen} from "./user/AccountSettingsScreen";

const NewTransportScreenComponent = hasRoleUser<NewTransportScreenProps>(NewTransportScreen);
const RoleSettings = hasRoleUser(SettingsScreen);

export function Screens() {
    const isGroupView = useIsGroupView();
    const isShipper = useIsShipper();
    const isInvited = useIsInvited();
    useSetupMonitoring();

    return (
        <Switch>
            {/* Authentication  */}
            <Route exact path="/app/login/" component={LoginScreen} />
            <Route exact path="/app/login/moderation/" component={LoginByModerationToken} />
            {/* Tracking pages (public order, public delivery, etc.)  */}
            <Route path="/tracking/shipments/:deliveryUid" component={PublicDeliveryScreen} />
            <Route
                path="/tracking/orders/:transportUid"
                component={PublicAcceptDeclineOrderScreen}
            />
            <Route
                path="/tracking/orders/:transportUid"
                render={({
                    match: {
                        params: {transportUid},
                    },
                    location: {search},
                }) => <Redirect to={{pathname: `/app/transports/${transportUid}`, search}} />}
            />
            <Route
                path="/tracking/update-late-transports/"
                component={UpdateLateTransportScreen}
            />
            <Route path="/shared-invoices/:invoiceUid" component={SharedInvoiceScreen} />
            <Route path="/shared-credit-notes/:creditNoteUid" component={SharedCreditNoteScreen} />

            {/* App  */}
            <Route path="/app/quotations/:quotationUid/" component={QuotationScreen} />
            <PrivateRoute
                path="/app/"
                ScreenWrapperComponent={PrivateScreenWrapper}
                fallbackUrl="/app/login/"
            >
                {isGroupView ? (
                    <Switch>
                        <Route
                            exact
                            path="/app/groupview"
                            render={() => <Redirect to="/app/groupview/users/" />}
                        />
                        <Route
                            exact
                            path="/app/groupview/settings/"
                            component={GroupViewSettingsScheduler}
                        />
                        <Route
                            exact
                            path="/app/fleet/telematics"
                            component={() => <Redirect to="/app/settings/telematic/" />}
                        />
                        <Route
                            exact
                            path={`${GROUP_VIEW}${ADDRESS_BOOK_PARTNERS}`}
                            render={() => (
                                <>
                                    <HasFeatureFlag flagName="betterCompanyRoles">
                                        <PartnersScreen />
                                    </HasFeatureFlag>
                                    <HasNotFeatureFlag flagName="betterCompanyRoles">
                                        <CompaniesScreen />
                                    </HasNotFeatureFlag>
                                </>
                            )}
                        />
                        <Route
                            exact
                            path={`${GROUP_VIEW}${ADDRESS_BOOK_PARTNERS_EXPORTS}`}
                            component={PartnersExportsScreen}
                        />
                        <Route
                            path={`${GROUP_VIEW}${ADDRESS_BOOK_PARTNERS}:pk/`}
                            render={() => (
                                <>
                                    <HasFeatureFlag flagName="betterCompanyRoles">
                                        <PartnerScreen />
                                    </HasFeatureFlag>
                                    <HasNotFeatureFlag flagName="betterCompanyRoles">
                                        <CompanyScreen />
                                    </HasNotFeatureFlag>
                                </>
                            )}
                        />

                        {/* Redirect the /app/groupview/address-book/ to /app/groupview/address-book/partners/ */}
                        <Route
                            exact
                            path={`${GROUP_VIEW}${ADDRESS_BOOK}`}
                            component={() => (
                                <Redirect to={`${GROUP_VIEW}${ADDRESS_BOOK_PARTNERS}`} />
                            )}
                        />
                        <Route
                            exact
                            path={`${GROUP_VIEW}${ADDRESS_BOOK_LOGISTIC_POINTS}`}
                            component={LogisticPointsScreen}
                        />
                        <Route
                            exact
                            path={`${GROUP_VIEW}${ADDRESS_BOOK_LOGISTIC_POINTS_EXPORTS}`}
                            component={LogisticPointsExportsScreen}
                        />
                        <Route
                            exact
                            path={`${GROUP_VIEW}${ADDRESS_BOOK_CONTACTS}`}
                            component={ContactsScreen}
                        />
                        <Route exact path="/app/groupview/users/" component={ManagersScreen} />
                        <Route exact path="/app/groupview/entities/" component={EntitiesScreen} />
                        <Route component={NotFoundScreen} />
                    </Switch>
                ) : (
                    <Switch>
                        <Route exact path="/app/home/" component={TransportsDashboardScreen} />
                        <Route exact path="/app/scheduler/" component={SchedulerScreen} />
                        {/* Redirect the original carrier URL to the new one to avoid troubles with clients having the page stored in their bookmark/history. */}
                        <Route
                            exact
                            path="/app/scheduler/carrier/"
                            render={() => <Redirect to="/app/scheduler/?tab=carrier" />}
                        />
                        {isInvited ? (
                            <Route
                                exact
                                path="/app/"
                                component={() => (
                                    <Redirect
                                        to={
                                            isShipper
                                                ? "/app/orders/?business_status=orders_to_assign_or_declined&tab=orders_to_assign_or_declined&archived=false"
                                                : "/app/transports/"
                                        }
                                    />
                                )}
                            />
                        ) : (
                            <Route
                                exact
                                path="/app/"
                                component={() => <Redirect to="/app/home/" />}
                            />
                        )}
                        <Route
                            exact
                            path="/app/shipments/"
                            component={() => <Redirect to="/app/home/" />}
                        />

                        <Route exact path="/app/orders/" component={TransportsListScreen} />
                        <Route
                            exact
                            path="/app/orders/new/"
                            render={() => <NewTransportScreenComponent transportType="order" />}
                        />
                        <Route
                            path="/app/orders/:transportUid/duplicate"
                            render={() => (
                                <NewTransportScreenComponent
                                    transportType="order"
                                    isDuplicating={true}
                                />
                            )}
                        />
                        <Route
                            path="/app/orders/:transportUid"
                            render={() => <TransportScreen isFullScreen />}
                        />
                        <Route
                            path="/app/transports/:transportUid/duplicate"
                            render={() => <NewTransportScreenComponent isDuplicating={true} />}
                        />
                        <Route
                            path="/app/transports/new-from-template/:transportTemplateUid/"
                            render={() => <NewTransportScreenComponent />}
                        />
                        <Route
                            path="/app/transport-templates/new"
                            render={() => (
                                <NewTransportScreenComponent isCreatingTemplate={true} />
                            )}
                        />
                        <Route
                            path="/app/transport-templates/new-from-transport/:transportUid/"
                            render={() => (
                                <NewTransportScreenComponent isCreatingTemplate={true} />
                            )}
                        />
                        <Route
                            path="/app/transport-templates/edit/:transportTemplateUid/"
                            render={() => (
                                <NewTransportScreenComponent
                                    isCreatingTemplate={true}
                                    submitType="edit"
                                />
                            )}
                        />
                        <Route
                            exact={true}
                            path="/app/transports/new"
                            render={() => <NewTransportScreenComponent />}
                        />
                        <Route
                            path="/app/transports/:transportUid"
                            render={() => <TransportScreen isFullScreen />}
                        />
                        <Route path="/app/transports/" component={TransportsListScreen} />
                        <Route
                            exact
                            path="/app/transports-export/"
                            component={TransportsExportScreen}
                        />
                        <Route
                            exact
                            path="/app/traces/"
                            // @ts-ignore
                            render={(routeProps) => <TracesScreen {...routeProps} />}
                        />
                        <Route exact path="/app/tracking/" component={TrackingScreen} />
                        <Route
                            exact
                            path={`${APP}${ADDRESS_BOOK_PARTNERS}`}
                            render={() => (
                                <>
                                    <HasFeatureFlag flagName="betterCompanyRoles">
                                        <PartnersScreen />
                                    </HasFeatureFlag>
                                    <HasNotFeatureFlag flagName="betterCompanyRoles">
                                        <CompaniesScreen />
                                    </HasNotFeatureFlag>
                                </>
                            )}
                        />
                        <Route
                            exact
                            path={`${APP}${ADDRESS_BOOK_PARTNERS_EXPORTS}`}
                            component={PartnersExportsScreen}
                        />
                        <Route
                            path={`${APP}${ADDRESS_BOOK_PARTNERS}:pk/`}
                            render={() => (
                                <>
                                    <HasFeatureFlag flagName="betterCompanyRoles">
                                        <PartnerScreen />
                                    </HasFeatureFlag>
                                    <HasNotFeatureFlag flagName="betterCompanyRoles">
                                        <CompanyScreen />
                                    </HasNotFeatureFlag>
                                </>
                            )}
                        />
                        {/* Redirect the /app/address-book/ to /app/address-book/partners/ */}
                        <Route
                            exact
                            path={`${APP}${ADDRESS_BOOK}`}
                            component={() => <Redirect to={`${APP}${ADDRESS_BOOK_PARTNERS}`} />}
                        />
                        <Route
                            exact
                            path={`${APP}${ADDRESS_BOOK_LOGISTIC_POINTS}`}
                            component={LogisticPointsScreen}
                        />
                        <Route
                            exact
                            path={`${APP}${ADDRESS_BOOK_LOGISTIC_POINTS_EXPORTS}`}
                            component={LogisticPointsExportsScreen}
                        />
                        <Route
                            exact
                            path={`${APP}${ADDRESS_BOOK_CONTACTS}`}
                            component={ContactsScreen}
                        />
                        <Route path="/app/settings/" component={RoleSettings} />
                        <Route path="/app/account/" component={AccountSettingsScreen} />
                        <Route
                            exact
                            path="/app/fleet/truckers/details/:truckerPk"
                            component={TruckerScreen}
                        />
                        <Route path="/app/fleet/truckers/" component={TruckersScreen} />
                        <Route
                            exact
                            path="/app/fleet/vehicles/:itemPk"
                            component={FleetUnitScreen}
                        />
                        <Route
                            exact
                            path="/app/fleet/trailers/:itemPk"
                            component={FleetUnitScreen}
                        />
                        <Route
                            exact
                            path="/app/fleet/telematics"
                            component={() => <Redirect to="/app/settings/telematic/" />}
                        />
                        <Route path="/app/fleet/vehicles/" exact component={MyEquipmentScreen} />
                        <Route
                            path="/app/fleet/requested-vehicles/"
                            exact
                            component={MyEquipmentScreen}
                        />
                        {isShipper && (
                            <Route
                                path="/app/assignation-rules/"
                                component={CarrierAssignationRulesScreen}
                            />
                        )}
                        <Route exact path="/app/trips/:tripUid" component={TripEditionScreen} />
                        <RouteFeatureFlag
                            exact
                            path="/app/tariff-grids/"
                            component={TariffGridsScreen}
                            flagName="fuelSurchargesAndTariffGridsManagement"
                        />
                        <RouteFeatureFlag
                            path="/app/tariff-grids/:tariffGridUid"
                            component={TariffGridScreen}
                            flagName="fuelSurchargesAndTariffGridsManagement"
                        />

                        <RouteFeatureFlag
                            exact
                            path="/app/fuel-surcharges/"
                            component={FuelSurchargesScreen}
                            flagName="fuelSurchargesAndTariffGridsManagement"
                        />
                        <RouteFeatureFlag
                            exact
                            path="/app/fuel-surcharges/:fuelSurchargeAgreementUid"
                            component={FuelSurchargeScreen}
                            flagName="fuelSurchargesAndTariffGridsManagement"
                        />

                        <RouteFeatureFlag
                            exact
                            path="/app/invoices/"
                            component={InvoicesScreen}
                            flagName="invoice-entity"
                        />
                        <RouteFeatureFlag
                            path="/app/invoices/exports/"
                            component={InvoicesExportScreen}
                            flagName="invoice-entity"
                        />
                        <RouteFeatureFlag
                            path="/app/invoices/:invoiceUid"
                            component={InvoiceScreen}
                            flagName="invoice-entity"
                        />
                        <RouteFeatureFlag
                            exact
                            path="/app/credit-notes/"
                            component={CreditNotesListScreen}
                            flagName="dashdocInvoicing"
                        />
                        <RouteFeatureFlag
                            path="/app/credit-notes/:creditNoteUid"
                            component={CreditNoteScreen}
                            flagName="dashdocInvoicing"
                        />
                        <Route path="/app/invoice-reports/" component={InvoiceReportingScreen} />
                        <RouteFeatureFlag
                            path="/app/revenue-reports/"
                            component={RevenueReportingScreen}
                            flagName="betaReports"
                        />
                        <RouteFeatureFlag
                            exact
                            path="/app/reports/"
                            component={ReportsScreen}
                            flagName="transportsReportScreen"
                        />
                        <RouteFeatureFlag
                            path="/app/reports/:reportUid"
                            component={ReportScreen}
                            flagName="transportsReportScreen"
                        />
                        <Route component={NotFoundScreen} />
                    </Switch>
                )}
            </PrivateRoute>
            {/* Signature pages */}
            <Route path="/signature/" component={SignatureScreen} />
            <Route component={NotFoundScreen} />
        </Switch>
    );
}
