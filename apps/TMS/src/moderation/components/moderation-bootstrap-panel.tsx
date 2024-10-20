import React, {ReactNode} from "react";

type BootstrapPanelProps = {
    title: string | ReactNode;
    children: string | ReactNode;
};

export const BootstrapPanel: React.VFC<BootstrapPanelProps> = ({title, children}) => {
    return (
        <div className="card mt-3">
            <div className="card-header">{title}</div>
            <div className="card-body">{children}</div>
        </div>
    );
};
