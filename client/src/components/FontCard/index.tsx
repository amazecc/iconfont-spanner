import React from "react";
import classnames from "classnames";
import { EditableText } from "../basic/EditableText";
import { CloseCircleOutlined, EditOutlined } from "@ant-design/icons";
import { Tooltip } from "antd";

export interface FontCardProps {
    name: string;
    subName?: {
        value: string;
        tip?: string;
    };
    icon: React.ReactNode;
    className?: string;
    style?: React.CSSProperties;
    onClick?: () => void;
    onClickRemove?: () => void;
    onEditConfirm?: (value: string) => void;
}

export const FontCard: React.FC<FontCardProps> = React.memo(props => {
    const { name, subName, icon, className, style, onClick, onClickRemove, onEditConfirm } = props;
    return (
        <div
            className={classnames(
                "group relative box-border flex flex-col items-center justify-start rounded-md border border-dashed border-transparent px-1 py-6  transition-all hover:border-blue-600",
                className,
            )}
            style={style}
            onClick={onClick}
        >
            {icon}
            <EditableText
                className="text-center font-semibold leading-7"
                onConfirm={async value => {
                    if (value) {
                        onEditConfirm?.(value);
                    }
                    return false;
                }}
            >
                {start => (
                    <>
                        <Tooltip title={<span className="text-xs leading-none">文件名，双击修改</span>} placement="right">
                            <span className="cursor-text break-all text-center text-sm font-semibold leading-7 text-slate-700" onClick={e => e.stopPropagation()} onDoubleClick={() => start(name)}>
                                {name}
                            </span>
                        </Tooltip>
                        {subName?.tip ? (
                            <Tooltip title={<span className="text-xs leading-none">{subName.tip}</span>} placement="right">
                                <span className="text-xs leading-6 text-slate-400">{subName.value}</span>
                            </Tooltip>
                        ) : subName ? (
                            <span className="text-xs leading-6 text-gray-400">{subName.value}</span>
                        ) : null}

                        <div className="absolute right-1 top-1 hidden gap-4 text-base !leading-none group-hover:flex">
                            <span
                                className="cursor-pointer hover:text-blue-600"
                                onClick={e => {
                                    e.stopPropagation();
                                    start(name);
                                }}
                            >
                                <EditOutlined />
                            </span>
                            <span
                                className="cursor-pointer hover:text-blue-600"
                                onClick={e => {
                                    e.stopPropagation();
                                    onClickRemove?.();
                                }}
                            >
                                <CloseCircleOutlined />
                            </span>
                        </div>
                    </>
                )}
            </EditableText>
        </div>
    );
});
