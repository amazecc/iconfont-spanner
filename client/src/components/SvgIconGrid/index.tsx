import React from "react";
import classnames from "classnames";
import type { SvgComponentMetadata } from "server/utils/FontManager/Component";
import { type FontUsage } from "../../api/scanIcon";
import { FontCard } from "../FontCard";
import { message } from "antd";
import type { UsageType } from "../UsageRadio";

export interface SvgIconGridProps {
    metadata: SvgComponentMetadata[];
    usage?: FontUsage["component"];
    usageType?: UsageType;
    onRename?: (oldName: string, newName: string) => void;
    onRemove?: (name: string) => void;
}

const SvgIconGrid: React.FC<SvgIconGridProps> = React.memo(({ metadata, usage, usageType, onRemove, onRename }) => {
    const unusedIconName = React.useMemo(() => new Set(usage?.unused), [usage]);
    const usedIconName = React.useMemo(() => new Set(usage?.used), [usage]);

    return (
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
                            value: `<${item.name} />`,
                            tip: "组件名称，点击复制",
                        }}
                        icon={<span className="text-[52px] leading-none" dangerouslySetInnerHTML={{ __html: item.svgOptimizeString }} />}
                        onClickRemove={() => onRemove?.(item.fileName)}
                        onEditConfirm={value => onRename?.(item.fileName, value)}
                        onClick={() => {
                            navigator.clipboard.writeText(`<${item.name} />`).then(() => {
                                message.success(`已复制 <${item.name} /> 到剪贴板`);
                            });
                        }}
                    />
                );
            })}
        </div>
    );
});

export default SvgIconGrid;
