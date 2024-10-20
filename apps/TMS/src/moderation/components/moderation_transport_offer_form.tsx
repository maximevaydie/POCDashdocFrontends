import {Button, TextArea, toast, ToastContainer} from "@dashdoc/web-ui";
import React, {useState} from "react";

import {Api} from "../Api";

type ModerationTransportOfferFormProps = {
    companyPk: string;
};

export function ModerationTransportOfferForm({companyPk}: ModerationTransportOfferFormProps) {
    const [offers, setOffers] = useState("");

    const submitForm = async () => {
        const submitButton = document.getElementById("submit-button-offers-areas");

        submitButton && submitButton.setAttribute("disabled", "disabled");

        try {
            const data = JSON.parse(offers);

            const response = await Api.post(`/transport-offers/${companyPk}/import-bulk/`, data, {
                apiVersion: "moderation",
            });
            if (response) {
                const user_email = response.user_email;
                toast.success(
                    `Transport offers are being saved. A confirmation email will be sent on completion to ${user_email}.`
                );
            }
        } catch (error) {
            if (error.body) {
                const response_text = await error.text();
                toast.error(response_text);
            } else {
                toast.error(error.message);
            }
        }

        submitButton && submitButton.removeAttribute("disabled");
    };
    const formTitle =
        "Update offers and areas (this will overwrite all existing offers and areas)";
    return (
        <div>
            <h5>{formTitle}</h5>
            <TextArea onChange={(value: string) => setOffers(value)} value={offers}></TextArea>

            <Button
                className="btn btn-primary"
                id="submit-button-offers-areas"
                onClick={submitForm}
            >
                Save
            </Button>
            <ToastContainer />
        </div>
    );
}
