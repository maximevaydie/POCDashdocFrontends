export type TextInputType =
    | "text"
    | "email"
    | "password"
    | "confirmationPassword"
    | "firstName"
    | "lastName"
    | "telephoneNumber"
    | "organizationName"
    | "addressLine1"
    | "addressLine2"
    | "zipcode"
    | "city"
    | "country"
    | "cardOwnerName"
    | "cardNumber"
    | "cardExpiry"
    | "cardValidationCode";

type TgetDerivedPropsFromTypeOutput = Partial<
    Pick<
        React.HTMLProps<HTMLInputElement>,
        "type" | "name" | "autoComplete" | "maxLength" | "inputMode"
    >
>;

const derivatedPropsByType: Record<TextInputType, TgetDerivedPropsFromTypeOutput> = {
    email: {
        type: "email",
        name: "email",
        autoComplete: "email",
        maxLength: 254,
        inputMode: "email",
    },
    password: {
        type: "password",
        name: "password",
        autoComplete: "current-password",
        maxLength: 128,
    },
    confirmationPassword: {
        type: "password",
        name: "password",
        autoComplete: "new-password",
        maxLength: 128,
    },
    firstName: {
        type: "text",
        name: "fname",
        autoComplete: "given-name",
        maxLength: 30,
    },
    lastName: {
        type: "text",
        name: "lname",
        autoComplete: "family-name",
        maxLength: 30,
    },
    telephoneNumber: {
        type: "tel",
        name: "phone",
        autoComplete: "tel",
        maxLength: 20,
        inputMode: "tel",
    },
    organizationName: {
        type: "text",
        name: "organization",
        autoComplete: "organization",
        maxLength: 104,
    },
    addressLine1: {
        type: "text",
        name: "address-line1",
        autoComplete: "address-line1",
        maxLength: 128,
    },
    addressLine2: {
        type: "text",
        name: "address-line2",
        autoComplete: "address-line2",
        maxLength: 128,
    },
    zipcode: {
        type: "tel",
        name: "zip",
        autoComplete: "postal-code",
        maxLength: 32,
    },
    city: {
        type: "text",
        name: "city",
        autoComplete: "address-level2",
        maxLength: 128,
    },
    country: {
        type: "text",
        name: "country",
        autoComplete: "country",
        maxLength: 128,
    },
    cardOwnerName: {
        type: "text",
        name: "ccname",
        autoComplete: "cc-name",
        maxLength: 30,
    },
    cardNumber: {
        type: "tel",
        name: "cardnumber",
        autoComplete: "cc-number",
        maxLength: 16,
        inputMode: "numeric",
    },
    cardExpiry: {
        type: "tel",
        name: "cc-exp",
        autoComplete: "cc-exp",
        maxLength: 4,
        inputMode: "numeric",
    },
    cardValidationCode: {
        type: "tel",
        name: "cvc",
        autoComplete: "cc-csc",
        maxLength: 3,
        inputMode: "numeric",
    },
    text: {
        type: "text",
        name: "text",
        autoComplete: "text",
    },
};

/**
 * Return default input accessibility props (type, name, autoComplete, maxLength and inputMode)
 * from passed type
 *
 * @param {object} props - The input passed props
 *
 * @example
 * getDerivedPropsFromType({ type: 'password' })
 * => {
 *  type: 'password',
 *  name: 'password',
 *  autoComplete: 'current-password',
 *  maxLength: '128',
 * }
 *
 * getDerivedPropsFromType({ type: 'lastName' })
 * => {
 *  type: 'text',
 *  name: 'lname',
 *  autoComplete: 'family-name',
 *  maxLength: '30',
 * }
 */

export const getDerivedPropsFromType = (
    type: TextInputType = "text"
): TgetDerivedPropsFromTypeOutput => derivatedPropsByType[type];
