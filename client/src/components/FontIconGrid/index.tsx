import React from "react";
import classnames from "classnames";
import type { FontMetadata } from "server/utils/FontManager/Font";
import { type FontUsage } from "../../api/scanIcon";
import { FontStyle } from "./FontStyle";
import { FontCard } from "../FontCard";
import { message } from "antd";
import type { UsageType } from "../UsageCheckboxGroup";

export interface FontIconGridProps {
    metadata: FontMetadata[];
    usage?: FontUsage["font"];
    usageType?: UsageType;
    onRename?: (oldName: string, newName: string) => void;
    onRemove?: (name: string) => void;
}

const FontIconGrid: React.FC<FontIconGridProps> = React.memo(({ metadata, usage, usageType, onRemove, onRename }) => {
    const unusedIconName = React.useMemo(() => new Set(usage?.unused), [usage]);
    const usedIconName = React.useMemo(() => new Set(usage?.used), [usage]);

    return (
        <>
            <FontStyle metadata={metadata} />
            <div className=" grid grid-cols-6 gap-3">
                {metadata.map(item => {
                    const used = usedIconName.has(item.fileName);
                    const unused = unusedIconName.has(item.fileName);

                    const show = !usageType || (usageType === "已使用" && used) || (usageType == "未使用" && unused) || (usageType === "未扫描" && !used && !unused);

                    return (
                        <FontCard
                            key={item.fileName}
                            className={classnames(unused && "bg-slate-200", used && "bg-green-200", !show && "hidden")}
                            name={item.fileName}
                            subName={{
                                value: item.fileName,
                                tip: "字体样式类，点击复制",
                            }}
                            icon={<span className={`iconfont text-[52px] leading-none ${item.fileName}`} />}
                            onClickRemove={() => onRemove?.(item.fileName)}
                            onEditConfirm={value => onRename?.(item.fileName, value)}
                            onClick={() => {
                                navigator.clipboard.writeText(item.fileName).then(() => {
                                    message.success(`已复制 ${item.fileName} 剪贴板`);
                                });
                            }}
                        />
                    );
                })}
            </div>
        </>
    );
});

export default FontIconGrid;
