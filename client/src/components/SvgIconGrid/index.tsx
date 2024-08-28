import React from "react";
import classnames from "classnames";
import type { SvgComponentMetadata } from "server/utils/FontManager/Component";
import { type FontUsage } from "../../api/scanIcon";
import { FontCard } from "../FontCard";
import { message } from "antd";

export interface SvgIconGridProps {
    metadata: SvgComponentMetadata[];
    usage?: FontUsage["component"];
    onRename?: (oldName: string, newName: string) => void;
    onRemove?: (name: string) => void;
}

const SvgIconGrid: React.FC<SvgIconGridProps> = React.memo(({ metadata, usage, onRemove, onRename }) => {
    const unusedIconName = React.useMemo(() => new Set(usage?.unused), [usage]);

    return (
        <div className=" grid grid-cols-6 gap-3">
            {metadata.map(item => {
                return (
                    <FontCard
                        key={item.fileName}
                        className={classnames("cursor-copy", unusedIconName.has(item.fileName) && "bg-slate-200")}
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
