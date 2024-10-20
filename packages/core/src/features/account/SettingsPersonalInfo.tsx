import {
    Logger,
    SUPPORTED_LOCALES_OPTIONS,
    cookiesService,
    localeService,
    t,
} from "@dashdoc/web-core";
import {LocaleOption} from "@dashdoc/web-core/src/types/locale";
import {
    Box,
    Button,
    FileUploadInput,
    Flex,
    FormGroup,
    Select,
    Text,
    TextInput,
} from "@dashdoc/web-ui";
import {Company, Manager, populateFormData, yup} from "dashdoc-utils";
import {Form, Formik, FormikProps} from "formik";
import pick from "lodash.pick";
import React from "react";
import {Value} from "react-phone-number-input";
import {connect} from "react-redux";

import {getConnectedCompany, getConnectedManager} from "../../../../../react/Redux/accountSelector";
import {fetchUpdateManager} from "../../redux/actions/managers";
import {CommonRootState} from "../../../../../react/Redux/types";
import {LocalizedPhoneNumberInput} from "../LocalizedPhoneNumberInput";

interface OwnProps {
    handleSubmit: Function;
    submitting: boolean;
}

type StateProps = {
    manager: Manager | null;
    company: Company | null;
};

interface DispatchProps {
    fetchUpdateManager: (pk: number, values: any) => any;
}

interface State {
    isFileUpdated: boolean;
}

type InfosProps = OwnProps & StateProps & DispatchProps;

const maxPictureSize = 500 * 1024;
const supportedPictureFormats = ["image/jpeg", "image/png"];

class SettingsPersonalInfo extends React.Component<InfosProps, State> {
    constructor(props: InfosProps) {
        super(props);
        this.state = {
            isFileUpdated: false,
        };
    }

    submit = (values: Partial<Manager>) => {
        if (this.props.manager) {
            const oldLanguage = this.props.manager.language;
            let updatedValues;
            if (!this.state.isFileUpdated) {
                // If the profile picture file has not been updated, we do not update it
                const allKeysExceptProfilePicture = Object.keys(values).filter(
                    (key) => key !== "profile_picture"
                );
                updatedValues = pick(values, allKeysExceptProfilePicture);
            } else {
                updatedValues = values;
            }
            const formData = populateFormData(updatedValues);
            return this.props.fetchUpdateManager(this.props.manager.pk, formData).then(() => {
                if (values.language !== oldLanguage) {
                    // @ts-ignore
                    cookiesService.setCookie("django_language", values.language, 365);
                    window.location.reload();
                }
            });
        } else {
            Logger.error("No manager found");
        }
    };

    render() {
        const validationSchema = yup.object().shape({
            phone_number: yup.string().phone(t("common.invalidPhoneNumber")),
            profile_picture: yup
                .mixed()
                .test(
                    "fileSize",
                    t("settings.invalidLogoSize", {size: maxPictureSize / 1024 + "kB"}),
                    (value) => !value || !value?.size || (value && value.size <= maxPictureSize)
                )
                .test(
                    "fileFormat",
                    t("settings.invalidLogoFormat", {formats: supportedPictureFormats.join(", ")}),
                    (value) =>
                        !value || !value?.type || supportedPictureFormats.includes(value.type)
                ),
        });

        return (
            <Box>
                <Text variant="h1" mb={3}>
                    {t("settings.personalInformation")}
                </Text>

                <Formik
                    validateOnChange={false}
                    validateOnBlur={false}
                    validationSchema={validationSchema}
                    initialValues={
                        {
                            user: pick(this.props.manager?.user, [
                                "first_name",
                                "last_name",
                                "email",
                            ]),
                            phone_number: this.props.manager?.phone_number,
                            language: this.props.manager?.language,
                            profile_picture: this.props.manager?.profile_picture,
                        } as Partial<Manager>
                    }
                    onSubmit={this.submit}
                >
                    {({
                        isSubmitting,
                        errors,
                        setFieldValue,
                        values,
                    }: FormikProps<Partial<Manager>>) => {
                        const initialLocaleOption = localeService.getLocaleOption(values.language);
                        return (
                            <Box maxWidth="500px">
                                <Form>
                                    <FormGroup>
                                        <TextInput
                                            type="text"
                                            label={t("settings.firstNameLabel")}
                                            // @ts-ignore
                                            error={errors.user?.first_name}
                                            placeholder={t("settings.firstNameLabel")}
                                            data-testid="settings-personal-first-name"
                                            // @ts-ignore
                                            value={values.user.first_name}
                                            onChange={(name: string) => {
                                                setFieldValue("user.first_name", name);
                                            }}
                                        />
                                    </FormGroup>
                                    <FormGroup>
                                        <TextInput
                                            type="text"
                                            label={t("settings.lastNameLabel")}
                                            // @ts-ignore
                                            error={errors.user?.last_name}
                                            placeholder={t("settings.lastNameLabel")}
                                            data-testid="settings-personal-last-name"
                                            // @ts-ignore
                                            value={values.user.last_name}
                                            onChange={(name: string) => {
                                                setFieldValue("user.last_name", name);
                                            }}
                                        />
                                    </FormGroup>
                                    <FormGroup>
                                        <TextInput
                                            type="email"
                                            label={t("common.email")}
                                            // @ts-ignore
                                            error={errors.user?.email}
                                            placeholder="adresse@exemple.com"
                                            data-testid="settings-personal-email"
                                            // @ts-ignore
                                            value={values.user.email}
                                            onChange={(email: string) => {
                                                setFieldValue("user.email", email);
                                            }}
                                        />
                                    </FormGroup>
                                    <FormGroup>
                                        <LocalizedPhoneNumberInput
                                            data-testid="settings-personal-phone-number"
                                            // @ts-ignore
                                            value={values.phone_number}
                                            onChange={(phoneNumber?: Value) =>
                                                setFieldValue("phone_number", phoneNumber)
                                            }
                                            error={errors.phone_number}
                                            country={this.props.company?.country}
                                        />
                                    </FormGroup>
                                    <FormGroup>
                                        <Select
                                            label={t("settings.language")}
                                            error={errors.language}
                                            isSearchable={true}
                                            options={SUPPORTED_LOCALES_OPTIONS}
                                            data-testid="settings-personal-language"
                                            value={initialLocaleOption}
                                            onChange={(option: LocaleOption) => {
                                                setFieldValue("language", option.value);
                                            }}
                                        />
                                    </FormGroup>
                                    <FormGroup>
                                        <FileUploadInput
                                            label={t("settings.profilePicture")}
                                            dataTestid="settings-company-logo"
                                            onFileChange={(files) => {
                                                setFieldValue(
                                                    "profile_picture",
                                                    files.length > 0 ? files[0] : undefined,
                                                    true
                                                );
                                                if (files.length > 0) {
                                                    this.setState({isFileUpdated: true});
                                                }
                                            }}
                                            onRemoveFile={() => {
                                                setFieldValue("profile_picture", "", true);
                                                this.setState({isFileUpdated: false});
                                            }}
                                            supportedFileFormats={["image/jpeg", "image/png"]}
                                            initialPreviewSrc={values.profile_picture ?? undefined}
                                            error={
                                                typeof errors.profile_picture === "string"
                                                    ? errors.profile_picture
                                                    : undefined
                                            }
                                        />
                                    </FormGroup>
                                    <Flex alignItems="flex-end" flexDirection="column">
                                        <Button
                                            type="submit"
                                            disabled={isSubmitting}
                                            data-testid="settings-personal-save"
                                            variant="primary"
                                        >
                                            {t("common.save")}
                                        </Button>
                                    </Flex>
                                </Form>
                            </Box>
                        );
                    }}
                </Formik>
            </Box>
        );
    }
}

const mapStateToProps = (state: CommonRootState): StateProps => {
    const manager = getConnectedManager(state);
    const company = getConnectedCompany(state);

    return {
        // @ts-ignore
        manager,
        company,
    };
};

// eslint-disable-next-line import/no-default-export
export default connect<StateProps, DispatchProps, OwnProps>(mapStateToProps, {fetchUpdateManager})(
    SettingsPersonalInfo
);
