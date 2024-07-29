import React from "react";
import classnames from "classnames";
import { EditableText } from "../basic/EditableText";
import { CloseCircleOutlined, EditOutlined } from "@ant-design/icons";

export interface FontCardProps {
    name: string;
    subName?: string;
    icon: React.ReactNode;
    className?: string;
    style?: React.CSSProperties;
    onClickRemove?: () => void;
    onEditConfirm?: (value: string) => void;
}

export const FontCard: React.FC<FontCardProps> = React.memo(props => {
    const { name, subName, icon, className, style, onClickRemove, onEditConfirm } = props;
    return (
        <div
            className={classnames(
                "group relative box-border flex flex-col items-center justify-start rounded-md border border-dashed border-transparent px-1 py-5  transition-all hover:border-blue-600",
                className,
            )}
            style={style}
        >
            {icon}
            <EditableText
                onConfirm={async value => {
                    if (value) {
                        onEditConfirm?.(value);
                    }
                    return false;
                }}
            >
                {start => (
                    <>
                        <span className="text-sm leading-6" onDoubleClick={() => start(name)}>
                            {name}
                        </span>
                        {subName ? <span className="text-sm leading-6">{subName}</span> : null}
                        <div className="absolute right-1 top-1 hidden gap-4 leading-none group-hover:flex">
                            <span className="cursor-pointer hover:text-blue-600" onClick={() => start(name)}>
                                <EditOutlined />
                            </span>
                            <span className="cursor-pointer hover:text-blue-600" onClick={() => onClickRemove?.()}>
                                <CloseCircleOutlined />
                            </span>
                        </div>
                    </>
                )}
            </EditableText>
        </div>
    );
});
