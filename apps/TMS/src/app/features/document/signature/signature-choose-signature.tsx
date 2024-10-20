import {t} from "@dashdoc/web-core";
import {Button, Icon, theme} from "@dashdoc/web-ui";
import styled from "@emotion/styled";
import React, {useCallback, useEffect, useRef, useState} from "react";

const SignatureContainer = styled("div")`
    position: relative;
    margin-bottom: 5px;
    width: 320px;

    & > div:first-child {
        left: 10px;
        top: -15px;
        padding: 2px;
    }
`;

type Props = {
    signatoryName: string;
    onConfirm: (signatureName: string) => void;
    onBack: () => void;
    onBadUser: () => void;
};

function applySignatureStyleToCanvasContext(ctx: CanvasRenderingContext2D) {
    ctx.fillStyle = theme.colors.grey.dark;
    ctx.textBaseline = "middle";
    ctx.textAlign = "center";
    ctx.font = "40px Kaushan Script";
}

export function SignatureChooseSignature({signatoryName, onConfirm, onBack, onBadUser}: Props) {
    // nosemgrep
    const [signatureName, setSignatureName] = useState(signatoryName);
    const canvas = useRef<HTMLCanvasElement>(null);

    const updateCanvas = useCallback((name: string) => {
        const ctx = canvas.current?.getContext("2d");
        if (!ctx) {
            return;
        }

        applySignatureStyleToCanvasContext(canvas.current!.getContext("2d")!);
        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
        ctx.fillText(name, ctx.canvas.width / 2, ctx.canvas.height / 2);
    }, []);

    useEffect(() => {
        // Wait for the font to be loaded before drawing the canvas
        // Otherwise the canvas will be drawn with a default font
        document.fonts.load("40px Kaushan Script").then(() => {
            updateCanvas(signatureName);
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <>
            <div style={styles.identifiedUser}>
                {t("signature.loggedInAs", {name: signatoryName})}
            </div>
            <a style={styles.notIdentifiedUser} onClick={onBadUser}>
                {t("signature.notYourself", {name: signatoryName})}
            </a>
            <div style={styles.info}>{t("signature.pleaseChooseSignature")}</div>
            <SignatureContainer>
                <div style={styles.signatureTitle}>{t("signature.chooseSignatureName")}</div>
                <input
                    style={styles.signatureInput}
                    value={signatureName}
                    onChange={(e) => {
                        setSignatureName(e.target.value);
                        updateCanvas(e.target.value);
                    }}
                />
            </SignatureContainer>
            <div>
                <div style={styles.previewTitle}>{t("signature.preview")}</div>
                <canvas ref={canvas} style={styles.canvas} height={120} width={360} />
            </div>
            <Button
                data-testid="sign-button"
                onClick={() => {
                    onConfirm(canvas.current?.toDataURL() || "");
                }}
                width="300px"
                mb={4}
            >
                <Icon name="check" mr={2} />
                {t("signature.sign")}
            </Button>
            <Button onClick={onBack} variant="secondary" width="300px">
                {t("signature.goBackStep")}
            </Button>
        </>
    );
}

const styles: {[key: string]: React.CSSProperties} = {
    identifiedUser: {
        textAlign: "center",
        fontSize: "16px",
        color: theme.colors.blue.default,
    },
    notIdentifiedUser: {
        marginBottom: "65px",
        fontSize: "12px",
        color: theme.colors.blue.default,
        cursor: "pointer",
    },
    info: {
        textAlign: "center",
        color: theme.colors.grey.dark,
        marginBottom: "27px",
    },
    signatureTitle: {
        color: theme.colors.grey.dark,
        marginLeft: "auto",
        backgroundColor: theme.colors.grey.white,
    },
    signatureInput: {
        border: "1px solid",
        borderColor: theme.colors.blue.default,
        borderRadius: "3px",
        width: "100%",
    },
    backButton: {
        border: "1px solid",
        borderColor: theme.colors.grey.light,
        color: theme.colors.blue.default,
        backgroundColor: theme.colors.grey.white,
    },
    previewTitle: {
        paddingLeft: "15px",
        fontSize: "16px",
        color: theme.colors.grey.dark,
    },
    canvas: {
        border: "1px solid",
        borderColor: theme.colors.grey.dark,
        borderRadius: "4px",
        marginBottom: "60px",
        userSelect: "none",
    },
};
