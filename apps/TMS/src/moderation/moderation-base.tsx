import {BROWSER_TIMEZONE, BuildConstants, setupI18n} from "@dashdoc/web-core";
import {theme} from "@dashdoc/web-ui";
import {ThemeProvider} from "@emotion/react";
import {AccountType, populateFormData} from "dashdoc-utils";
import isEmpty from "lodash.isempty";
import React from "react";
import ReactDOM from "react-dom/client";

import "react-toastify/dist/ReactToastify.css";

import {ModerationInvoicing} from "moderation/components/moderation-invoicing";
import {ModerationTransportationPlan} from "moderation/components/moderation-transportation-plan";

import {Api} from "./Api";
import {ModerationAddressBook} from "./components/moderation-address-book";
import ModerationChart from "./components/moderation-chart";
import {ModerationCompaniesMerger} from "./components/moderation-companies-merger";
import {ModerationFeatureFlags} from "./components/moderation-feature-flags";
import {ModerationLinkToCompany} from "./components/moderation-link-to-company";
import {ModerationLinkToHubspot} from "./components/moderation-link-to-hubspot";
import ModerationPie from "./components/moderation-pie";
import {ModerationSetAccountType} from "./components/moderation-set-account-type";
import {ModerationTransportOfferForm} from "./components/moderation_transport_offer_form";
import {ModerationQuoteForm} from "./components/quote-creation/ModerationQuoteForm";

// tab deep linking
declare global {
    interface JQuery {
        tab(action?: string): JQuery;
    }
}
const hash = window.location.hash;
if (hash) {
    const tabElement = $(`.nav[role="tablist"] a[href="${hash}"]`);
    if (tabElement.length > 0) {
        tabElement.tab("show");
    }
}
$('a[role="tab"]').on("click", function () {
    const hash = $(this).attr("href");
    history.pushState(null, "", hash);
});

function objectifyForm(formArray: JQuery.NameValuePair[]) {
    var returnArray: any = {};
    for (var i = 0; i < formArray.length; i++) {
        returnArray[formArray[i].name] = formArray[i].value;
    }
    return returnArray;
}

export const redirectToWebApp = async (
    companyPk: number | string,
    nextUrl: string | null = null
) => {
    try {
        const response = await Api.post(
            "/moderation/ask-for-moderation-token/",
            {company_id: companyPk},
            {basePath: "auth", apiVersion: null}
        );
        const moderationToken = response["moderation_token"];

        const next = nextUrl ? nextUrl : "/app/";
        const redirectUrl = `/app/login/moderation/?moderation_token=${moderationToken}&next=${next}`;
        window.open(redirectUrl);
    } catch (error) {
        alert(JSON.stringify(await error.json()));
    }
};

$("body").on("click", ".see-dashboard", async function (e) {
    e.preventDefault();

    const connectoToCompanyPk = e.currentTarget.getAttribute("data-connect-to-company-pk");
    const nextUrl = e.currentTarget.getAttribute("data-next-url");

    if (connectoToCompanyPk) {
        await redirectToWebApp(connectoToCompanyPk, nextUrl);
    }
});

export const redirectToFlowApp = async (companyPk: number | string, siteSlug: string) => {
    try {
        const response = await Api.post(
            "/moderation/ask-for-moderation-token/",
            {company_id: companyPk},
            {basePath: "auth", apiVersion: null}
        );
        const moderationToken = response["moderation_token"];
        let next = `/flow/site/${siteSlug}/`;
        const redirectUrl = `/flow/login/moderation/?moderation_token=${moderationToken}&next=${next}`;
        window.open(redirectUrl);
    } catch (error) {
        alert(JSON.stringify(await error.json()));
    }
};

$("body").on("click", ".see-flow-site", async function (e) {
    e.preventDefault();

    const companyPk = e.currentTarget.dataset["companyPk"];
    const flowSiteSlug = e.currentTarget.dataset["flowSiteSlug"];

    if (companyPk && flowSiteSlug) {
        await redirectToFlowApp(companyPk, flowSiteSlug);
    } else {
        alert("Missing companyPk or flowSiteSlug");
    }
});

export const redirectToWam = async (
    companyPk: number | string,
    wasteShipmentUid: string | null = null
) => {
    try {
        const response = await Api.post(
            "/moderation/ask-for-moderation-token/",
            {company_id: companyPk},
            {basePath: "auth", apiVersion: null}
        );
        const moderationToken = response["moderation_token"];

        let next = "/wam/";
        if (wasteShipmentUid) {
            next = `/wam/forms/${wasteShipmentUid}/`;
        }

        const redirectUrl = `/wam/login/moderation/?moderation_token=${moderationToken}&next=${next}`;
        window.open(redirectUrl);
    } catch (error) {
        alert(JSON.stringify(await error.json()));
    }
};

$("body").on("click", ".see-wam", async function (e) {
    e.preventDefault();

    const companyPk = e.currentTarget.dataset["companyPk"];
    const wasteShipmentUid = e.currentTarget.dataset["wasteShipmentUid"];

    if (companyPk) {
        await redirectToWam(companyPk, wasteShipmentUid);
    } else {
        alert("Missing companyPk");
    }
});

$(".disable-account").on("click", function (e) {
    e.preventDefault();
    const company_id = $("#company-data").data("pk");
    if (
        !confirm(
            "Are you sure you want to disable this account? No one will be able to access it."
        )
    ) {
        return;
    }
    Api.post(`/companies-admin/${company_id}/disable/`, undefined, {
        apiVersion: "web",
    }).then(
        () => {
            window.location.reload();
        },
        (error) => alert(JSON.stringify(error))
    );
});

$(".enable-account").on("click", function (e) {
    e.preventDefault();
    const company_id = $("#company-data").data("pk");
    Api.post(`/companies-admin/${company_id}/enable/`, undefined, {
        apiVersion: "web",
    }).then(
        () => {
            window.location.reload();
        },
        (error) => alert(JSON.stringify(error))
    );
});

function renderShipmentsChart() {
    let shipmentsChart = document.getElementById("company-shipments-chart");
    if (!shipmentsChart) {
        return;
    }
    const root = ReactDOM.createRoot(shipmentsChart);

    const url = new URL(window.location.toString());
    const currentBucket = url.searchParams.get("bucket") || "weekly";

    root.render(
        <ThemeProvider theme={theme}>
            <ModerationChart
                dataUrl={`/moderation/company-shipments/?bucket=${currentBucket}&company=${$(
                    "#company-data"
                ).data("pk")}`}
                xAxis={{dataKey: currentBucket === "weekly" ? "week" : "month"}}
                bars={[{dataKey: "created"}, {dataKey: "finished"}]}
            />
        </ThemeProvider>
    );
}

function renderInvoicesChart() {
    let shipmentsChart = document.getElementById("company-invoices-chart");
    if (!shipmentsChart) {
        return;
    }
    const root = ReactDOM.createRoot(shipmentsChart);

    const url = new URL(window.location.toString());
    const currentBucket = url.searchParams.get("bucket") || "weekly";

    root.render(
        <ThemeProvider theme={theme}>
            <ModerationChart
                dataUrl={`/moderation/company-invoices/?bucket=${currentBucket}&company=${$(
                    "#company-data"
                ).data("pk")}`}
                xAxis={{dataKey: currentBucket === "weekly" ? "week" : "month"}}
                bars={[{dataKey: "created"}, {dataKey: "finalized"}, {dataKey: "paid"}]}
            />
        </ThemeProvider>
    );
}

function bindChartPeriodSelect() {
    const select = $("#company-chart-bucket-select");

    select.on("change", () => {
        const shipmentsChart = document.getElementById("company-shipments-chart");
        if (shipmentsChart) {
            const root = ReactDOM.createRoot(shipmentsChart);
            root.render(<ThemeProvider theme={theme}>Loading...</ThemeProvider>);
        }
        const invoicesChart = document.getElementById("company-invoices-chart");
        if (invoicesChart) {
            const root = ReactDOM.createRoot(invoicesChart);
            root.render(<ThemeProvider theme={theme}>Loading...</ThemeProvider>);
        }
        const url = new URL(window.location.toString());
        url.searchParams.set("bucket", select.val() as string);
        history.pushState(null, "", url.toString());
        renderShipmentsChart();
        renderInvoicesChart();
    });
}

function renderLinkToHubspot() {
    let linkToHubspotDiv: Element = document.querySelector("#link-to-hubspot") as any;
    if (!linkToHubspotDiv) {
        return;
    }
    const root = ReactDOM.createRoot(linkToHubspotDiv);
    root.render(
        <ThemeProvider theme={theme}>
            <ModerationLinkToHubspot
                // @ts-ignore
                companyPk={linkToHubspotDiv.getAttribute("data-company-pk")}
                // @ts-ignore
                initialHubspotId={linkToHubspotDiv.getAttribute("data-hubspot-id")}
            />
        </ThemeProvider>
    );
}

function renderLinkToCompany() {
    const container = document.getElementById("company-link-to-company");
    if (!container) {
        return;
    }
    const root = ReactDOM.createRoot(container);
    root.render(
        <ThemeProvider theme={theme}>
            <ModerationLinkToCompany companyPk={$("#company-data").data("pk")} />
        </ThemeProvider>
    );
}

function renderMergeCompany() {
    const container = document.getElementById("company-merge");
    if (!container) {
        return;
    }
    const root = ReactDOM.createRoot(container);
    root.render(
        <ThemeProvider theme={theme}>
            <ModerationCompaniesMerger
                companyPk={Number(container.getAttribute("data-company-pk"))}
                // @ts-ignore
                companyName={container.getAttribute("data-company-name")}
            />
        </ThemeProvider>
    );
}

function renderAddressBookTab() {
    const container = document.getElementById("address-book");
    if (!container) {
        return;
    }
    const root = ReactDOM.createRoot(container);
    root.render(
        <ThemeProvider theme={theme}>
            <ModerationAddressBook companyPk={Number(container.getAttribute("data-company-pk"))} />
        </ThemeProvider>
    );
}

function renderInvoicingTab() {
    const container = document.getElementById("invoicing");
    if (!container) {
        return;
    }
    const root = ReactDOM.createRoot(container);
    const connectedUserEmail = $("#connected-user-data").data("email");
    root.render(
        <ThemeProvider theme={theme}>
            <ModerationInvoicing
                companyPk={Number(container.getAttribute("data-company-pk"))}
                connectedUserEmail={connectedUserEmail}
            />
        </ThemeProvider>
    );
}

function renderTransportationPlanTab() {
    const container = document.getElementById("transportation-plan");
    if (!container) {
        return;
    }
    const root = ReactDOM.createRoot(container);
    root.render(
        <ThemeProvider theme={theme}>
            <ModerationTransportationPlan
                companyPk={Number(container.getAttribute("data-company-pk"))}
            />
        </ThemeProvider>
    );
}

function renderSetAccountTypeModal() {
    const container = document.getElementById("react-set-account-type");
    if (!container) {
        return;
    }
    const root = ReactDOM.createRoot(container);
    root.render(
        <ThemeProvider theme={theme}>
            <ModerationSetAccountType
                companyPk={Number(container.getAttribute("data-company-pk"))}
                // @ts-ignore
                companyName={container.getAttribute("data-company-name")}
                accountType={container.getAttribute("data-account-type") as AccountType}
                // @ts-ignore
                chargebeeStatus={container.getAttribute("data-chargebee-status")}
            />
        </ThemeProvider>
    );
}

function renderRelatedShipperStats() {
    const relatedShipperContainer = document.getElementById("related-shipper-stats");
    if (!relatedShipperContainer) {
        return;
    }
    const root = ReactDOM.createRoot(relatedShipperContainer);
    const companyPk = relatedShipperContainer.getAttribute("data-company-pk");
    root.render(
        <ThemeProvider theme={theme}>
            <ModerationPie dataUrl={`/moderation/related-shipper-stats/?company=${companyPk}`} />
        </ThemeProvider>
    );
}

function renderFeatureFlags() {
    const featureFlagsContainer = document.getElementById("feature-flags");
    if (!featureFlagsContainer) {
        return;
    }
    const root = ReactDOM.createRoot(featureFlagsContainer);
    const companyPk = featureFlagsContainer.getAttribute("data-company-pk");
    root.render(
        <ThemeProvider theme={theme}>
            {/*
// @ts-ignore */}
            <ModerationFeatureFlags companyPk={companyPk} />
        </ThemeProvider>
    );
}

function renderTransportOfferForm() {
    const transportOfferFormContainer = document.getElementById("transport-offers-import");
    if (!transportOfferFormContainer) {
        return;
    }
    const root = ReactDOM.createRoot(transportOfferFormContainer);
    const companyPk = transportOfferFormContainer.getAttribute("data-company-pk");
    root.render(
        <ThemeProvider theme={theme}>
            {/*
            // @ts-ignore */}
            <ModerationTransportOfferForm companyPk={companyPk} />
        </ThemeProvider>
    );
}

$(".company-form").submit(async function (e) {
    e.preventDefault();
    // @ts-ignore
    const url = $(this).attr("action").replace("/api/web/", "/");
    const data = objectifyForm($(this).serializeArray());
    const logoData: any = {};

    // Logo is not a setting
    $(this)
        .find("input[id=logo-input]")
        .each(function () {
            const file = $(this).prop("files")[0];
            if (file) {
                // @ts-ignore
                delete data[$(this).attr("name")];
                // @ts-ignore
                logoData[$(this).attr("name")] = file;
            }
        });

    try {
        await Api.patch(url, data, {apiVersion: "web"});
        if (!isEmpty(logoData)) {
            const formData = populateFormData(logoData);
            await Api.patch(url.replace("/settings/", "/"), formData, {apiVersion: "web"});
        }
        window.location.reload();
    } catch (error) {
        const jsonError = await error.json();
        alert(`Error: ${JSON.stringify(jsonError)}`);
    }
});

$("#delete-logo").on("click", function () {
    // @ts-ignore
    const url = $("#settings-form")
        .attr("action")
        .replace("/api/web/", "/")
        .replace("/settings/", "/");

    Api.patch(url, {logo: null}, {apiVersion: "web"}).then(
        () => {
            alert("Success !");
            window.location.reload();
        },
        async (error) => {
            const jsonError = await error.json();
            alert(`Error: ${JSON.stringify(jsonError)}`);
        }
    );
});

$(".force-refresh-invoice-pdf").on("click", function (e) {
    e.preventDefault();
    const invoiceUid = $(this).attr("data-invoice-uid");
    Api.post(`/invoicing/${invoiceUid}/force-refresh-invoice-pdf/`, undefined, {
        apiVersion: "moderation",
    }).then(
        () => {
            alert(
                "Async task scheduled!\nPlease wait a moment (generally less than 30 seconds) and refresh the page."
            );
            window.location.reload();
        },
        async (error) => {
            const jsonError = await error.json();
            alert(`Error: ${JSON.stringify(jsonError)}`);
        }
    );
});

$(".update-status-update").on("click", function (e) {
    e.preventDefault();
    Api.post(
        `/transports/${$("#transport-data").data("uid")}/update-transport-status/`,
        undefined,
        {apiVersion: "moderation"}
    ).then(
        (result) => {
            $("#transport-current-status").text(result.status);
            $("#transport-global-status").text(result.global_status);
            $("#transport-invoicing-status").text(result.invoicing_status);
        },
        (error) => alert(JSON.stringify(error))
    );
});

$(".update-estimated-distance").on("click", function (e) {
    e.preventDefault();
    Api.post(
        `/transports/${$("#transport-data").data("uid")}/update-estimated-distance/`,
        undefined,
        {apiVersion: "moderation"}
    ).then(
        (result) => {
            $("#transport-current-estimated-distance").text(
                JSON.stringify(result.estimated_distance || result.estimated_distance_errors)
            );
        },
        (error) => alert(JSON.stringify(error))
    );
});

$(".update-search-vector").on("click", function (e) {
    e.preventDefault();
    const transportUID = e.target.dataset["transportUid"];
    Api.post(`/transports/${transportUID}/update-search-vector/`, undefined, {
        apiVersion: "moderation",
    }).then(
        () => {
            alert(`Transport ${transportUID}'s search vector has been updated.`);
        },
        (error) => alert(JSON.stringify(error))
    );
});

$(".update-pdf").on("click", function (e) {
    e.preventDefault();
    Api.post(`/transports/${$("#transport-data").data("uid")}/update-pdf/`, undefined, {
        apiVersion: "moderation",
    }).then(
        () => {
            window.location.reload();
        },
        (error) => alert(JSON.stringify(error))
    );
});

// @ts-ignore
window.deleteStatus = function (uid) {
    Api.delete(`/transportstatus/${uid}/`, {apiVersion: "moderation"}).then(
        () => {
            window.location.reload();
        },
        (error) => alert(JSON.stringify(error))
    );
};

// @ts-ignore
window.restoreStatus = function (uid) {
    Api.post(`/transportstatus/${uid}/restore/`, undefined, {
        apiVersion: "moderation",
    }).then(
        () => {
            window.location.reload();
        },
        (error) => alert(JSON.stringify(error))
    );
};

// @ts-ignore
window.revertStatus = function (uid) {
    Api.post(`/transportstatus/${uid}/revert/`, undefined, {
        apiVersion: "moderation",
    }).then(
        () => {
            window.location.reload();
        },
        (error) => alert(JSON.stringify(error))
    );
};

// @ts-ignore
window.deleteTransport = function (uid) {
    Api.post(`/transports/${uid}/delete/`, undefined, {
        apiVersion: "moderation",
    }).then(
        () => {
            window.location.reload();
        },
        (error) => alert(JSON.stringify(error))
    );
};

// @ts-ignore
window.restoreTransport = function (uid) {
    Api.post(`/transports/${uid}/restore/`, undefined, {
        apiVersion: "moderation",
    }).then(
        () => {
            window.location.reload();
        },
        (error) => error.json().then((data: any) => alert(JSON.stringify(data)))
    );
};

// @ts-ignore
window.deleteMessage = function (uid) {
    Api.post(`/transportmessage/${uid}/delete/`, undefined, {
        apiVersion: "moderation",
    }).then(
        () => {
            window.location.reload();
        },
        (error) => alert(JSON.stringify(error))
    );
};

// @ts-ignore
window.restoreMessage = function (uid) {
    Api.post(`/transportmessage/${uid}/restore/`, undefined, {
        apiVersion: "moderation",
    }).then(
        () => {
            window.location.reload();
        },
        (error) => alert(JSON.stringify(error))
    );
};

// @ts-ignore
window.createChargebeeCustomer = function (company_pk, group_view_pk) {
    Api.post(
        "/billing/chargebee/customer/",
        {company: company_pk, group: group_view_pk},
        {
            apiVersion: "v4",
        }
    ).then(
        () => {
            window.location.reload();
        },
        async (response) => {
            const body = await response.json();
            alert(body.error);
        }
    );
};

// @ts-ignore
window.sendRequestPaymentInfoEmail = function (subscriptionPk, invoicingEmail) {
    if (!invoicingEmail.includes("@")) {
        alert(
            "Please set an invoicing email on the subscription or use the 'Get payment link' button to send an email manually."
        );
        return;
    }
    const yes = confirm(
        `This will send an email to ${invoicingEmail}, asking them to input their payment details. Are you sure you want to do this?`
    );
    if (!yes) {
        return;
    }
    Api.post(
        "/billing/chargebee/send-request-payment-info-email/",
        {subscription: subscriptionPk},
        {
            apiVersion: "v4",
        }
    ).then(
        (response) => {
            if (response.success) {
                alert("Email sent successfully");
            } else {
                alert("Something went wrong");
            }
        },
        async (response) => {
            const body = await response.json();
            alert(body.error);
        }
    );
};

// @ts-ignore
window.getChargebeePaymentLink = function (subscription_pk) {
    Api.get(`/billing/chargebee/get-payment-link/?subscription_id=${subscription_pk}`, {
        apiVersion: "v4",
    }).then(
        (response) => {
            alert(response.link);
        },
        async (response) => {
            const body = await response.json();
            alert(body.error);
        }
    );
};

// @ts-ignore
window.moveSubscriptionsToGroup = function (companyPk, redirectUrl) {
    const yes = confirm(
        "Are you sure you want to move the subscription(s) from the entity to the group?"
    );
    if (!yes) {
        return;
    }
    Api.post(
        "/billing/move-subscriptions-to-group/",
        {company: companyPk},
        {
            apiVersion: "v4",
        }
    ).then(
        () => {
            window.location.href = redirectUrl;
        },
        async (response) => {
            const body = await response.json();
            alert(JSON.stringify(body));
        }
    );
};

// @ts-ignore
window.moveSubscriptionsToEntity = function (companyPk, redirectUrl) {
    const yes = confirm(
        "Are you sure you want to move the subscription(s) from the group to the entity?"
    );
    if (!yes) {
        return;
    }
    Api.post(
        "/billing/move-subscriptions-to-entity/",
        {company: companyPk},
        {
            apiVersion: "v4",
        }
    ).then(
        () => {
            window.location.href = redirectUrl;
        },
        async (response) => {
            const body = await response.json();
            alert(JSON.stringify(body));
        }
    );
};

function slugify(text: string) {
    return text
        .toString()
        .toLowerCase()
        .replace(/\s+/g, "-") // Replace spaces with -
        .replace(/[^\w-]+/g, "") // Remove all non-word chars
        .replace(/--+/g, "-") // Replace multiple - with single -
        .replace(/^-+/, "") // Trim - from start of text
        .replace(/-+$/, ""); // Trim - from end of text
}

// @ts-ignore
window.createDefaultFlowSite = function (company_pk, company_name) {
    const slug = prompt("Please enter the slug for the new flow site", slugify(company_name));
    Api.post(
        "/flow/sites/",
        {company: Number(company_pk), slug},
        {
            apiVersion: "web",
        }
    ).then(
        () => {
            window.location.reload();
        },
        async (response) => {
            const body = await response.json();
            alert(JSON.stringify(body));
        }
    );
};

// auto-fill slug field with slugified company name
// @ts-ignore
window.flowDemoCompanyNameChanged = function (value) {
    const slugInput = document.getElementById("id_slug") as HTMLInputElement;
    if (slugInput) {
        const slugifiedValue = slugify(value);
        // if slugValue begins with value, then we can safely replace it
        if (slugifiedValue.startsWith(slugInput.value)) {
            slugInput.value = slugifiedValue;
        }
    }
};

function renderModerationQuoteCreation() {
    const container = document.getElementById("quote-form-import");
    if (!container) {
        return;
    }

    const quoteData = container.getAttribute("data-quote");
    const quote = quoteData ? JSON.parse(quoteData) : {};

    setupI18n(BuildConstants.language, BROWSER_TIMEZONE).then(() => {
        const root = ReactDOM.createRoot(container);
        root.render(
            <ThemeProvider theme={theme}>
                <ModerationQuoteForm quote={quote} />
            </ThemeProvider>
        );
    });
}

renderShipmentsChart();
renderInvoicesChart();
bindChartPeriodSelect();
renderLinkToHubspot();
renderLinkToCompany();
renderMergeCompany();
renderAddressBookTab();
renderInvoicingTab();
renderTransportationPlanTab();
renderSetAccountTypeModal();
renderRelatedShipperStats();
renderFeatureFlags();
renderTransportOfferForm();
renderModerationQuoteCreation();
