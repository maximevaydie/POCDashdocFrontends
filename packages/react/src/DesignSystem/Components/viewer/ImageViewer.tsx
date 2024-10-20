import {Box, Button, Flex, Icon} from "@dashdoc/web-ui";
import {css} from "@emotion/react";
import React from "react";

interface ImageViewerProps {
    src: string;
}

interface ImageViewerState {
    rotation: number;
    zoom: number;
    initialImageWidth: number;
    initialImageHeight: number;
    verticalPadding: number;
    horizontalPadding: number;
}

export class ImageViewer extends React.Component<ImageViewerProps, ImageViewerState> {
    imageElementRef: React.RefObject<HTMLImageElement>;
    imageContainerRef: React.RefObject<HTMLDivElement>;

    constructor(props: ImageViewerProps) {
        super(props);

        this.state = {
            rotation: 0,
            zoom: 1,
            initialImageWidth: 500,
            initialImageHeight: 500,
            verticalPadding: 0,
            horizontalPadding: 0,
        };

        this.imageContainerRef = React.createRef();
        this.imageElementRef = React.createRef();
    }

    // According to this link: https://programmierfrage.com/items/download-image-on-other-server-using-url
    // We may have some CORS issue
    // Copy pasta from https://stackoverflow.com/a/50042812/5002340
    // Bruteforce-ish way to support download on click for IE11 and Safari
    forceDownload = () => {
        const {src} = this.props;
        // eslint-disable-next-line no-useless-escape
        const fileName = src.split(/[\/]+/).pop();
        const xhr = new XMLHttpRequest();
        xhr.open("GET", src, true);
        xhr.responseType = "blob";
        xhr.onload = function () {
            var urlCreator = window.URL || window.webkitURL;
            var imageUrl = urlCreator.createObjectURL(this.response);
            var tag = document.createElement("a");
            tag.href = imageUrl;
            // @ts-ignore
            tag.download = fileName;
            document.body.appendChild(tag);
            tag.click();
            document.body.removeChild(tag);
        };
        xhr.send();
    };

    onLoad = () => {
        // @ts-ignore
        const imageContainerHeight = this.imageContainerRef.current.offsetHeight;
        // @ts-ignore
        const imageContainerWidth = this.imageContainerRef.current.offsetWidth;
        const imageElementRef = this.imageElementRef.current;
        // @ts-ignore
        const originalImageRatio = imageElementRef.naturalWidth / imageElementRef.naturalHeight;
        const initialImageWidth =
            originalImageRatio < 1
                ? imageContainerHeight * originalImageRatio
                : imageContainerWidth;
        const initialImageHeight =
            originalImageRatio < 1
                ? imageContainerHeight
                : imageContainerWidth / originalImageRatio;

        this.setState({
            initialImageWidth: initialImageWidth,
            initialImageHeight: initialImageHeight,
        });
    };

    getImageHTML = (source: string) => {
        return `
        <html>
            <head>
                <script>
                    function step1() {
                        setTimeout("step2()", 10);
                    }
                    function step2() {
                        window.print();
                        window.close();
                    }
                </script>
                <style>
                    /* style sheet for "A4" printing */
                    @media print and (width: 21cm) and (height: 29.7cm) {
                        @page {
                           margin: 1cm;
                        }
                    }
                    /* style sheet for "letter" printing */
                    @media print and (width: 8.5in) and (height: 11in) {
                        @page {
                            margin: 0.5in;
                        }
                    }
                    img {
                        display: block;
                        max-width: 7.5in;
                        max-height: 10in;
                        width: auto;
                        height: auto;
                        object-fit: contain;
                        margin: auto;
                        page-break-inside: avoid;
                    }
                </style>
            </head>
            <body onload="step1()">
                <img src="${source}" style="transform: rotate(${this.state.rotation}deg)">
            </body>
        </html>`;
    };

    printImage = () => {
        var pwa = window.open("about:blank", "_new");
        // @ts-ignore
        pwa.document.open();
        // @ts-ignore
        pwa.document.write(this.getImageHTML(this.props.src));
        // @ts-ignore
        pwa.document.close();
    };

    render = () => {
        return (
            <React.Fragment>
                <Box
                    ref={this.imageContainerRef}
                    css={css`
                        overflow: auto;
                        height: 80vh;
                        min-height: 500px;
                        display: flex;
                    `}
                >
                    <img
                        ref={this.imageElementRef}
                        onLoad={this.onLoad}
                        key="document-image"
                        className="img img-responsive"
                        src={this.props.src}
                        style={{
                            transform: `rotate(${this.state.rotation}deg)`,
                            transition: "all 0.2s ease-in-out 0s",
                            height: `${this.state.initialImageHeight * this.state.zoom}px`,
                            width: `${this.state.initialImageWidth * this.state.zoom}px`,
                            maxWidth: "initial",
                            padding: `${this.state.verticalPadding * this.state.zoom}px ${
                                this.state.horizontalPadding * this.state.zoom
                            }px`,
                            margin: "auto",
                            flex: "0 0 auto",
                        }}
                    />
                </Box>
                <Flex mt={2} justifyContent="center">
                    <Button
                        variant="plain"
                        onClick={() => {
                            if (this.state.zoom > 1) {
                                this.setState({zoom: (this.state.zoom * 2) / 3});
                            }
                        }}
                    >
                        <Icon name="zoomOut" />
                    </Button>
                    <Button
                        variant="plain"
                        onClick={() => {
                            if (this.state.zoom < 6) {
                                this.setState({zoom: this.state.zoom * 1.5});
                            }
                        }}
                    >
                        <Icon name="zoomIn" />
                    </Button>
                    <Button
                        variant="plain"
                        onClick={() =>
                            this.setState({
                                rotation: this.state.rotation - 90,
                            })
                        }
                    >
                        <Icon name="undo" />
                    </Button>
                    <Button
                        variant="plain"
                        onClick={() =>
                            this.setState({
                                rotation: this.state.rotation + 90,
                            })
                        }
                    >
                        <Icon name="redo" />
                    </Button>
                    <a onClick={this.forceDownload} href="#">
                        <Button variant="plain">
                            <Icon name="download" />
                        </Button>
                    </a>
                    <Button variant="plain" onClick={this.printImage}>
                        <Icon name="print" />
                    </Button>
                </Flex>
            </React.Fragment>
        );
    };
}
