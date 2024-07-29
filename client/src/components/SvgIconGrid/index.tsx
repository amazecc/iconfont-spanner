import React from "react";
import type { SvgComponentMetadata } from "server/utils/FontManager/type";
import { SvgIconCard, type SvgIconCardProps } from "./SvgIconCard";
import { type FontUsage } from "../../api/scanIcon";

export interface SvgIconGridProps extends Pick<SvgIconCardProps, "onRemove" | "onRename"> {
    metadata: SvgComponentMetadata[];
    usage?: FontUsage["component"];
}

const SvgIconGrid: React.FC<SvgIconGridProps> = React.memo(({ metadata, usage, onRemove, onRename }) => {
    const usedIconName = React.useMemo(() => new Set(usage?.used), [usage]);
    const unusedIconName = React.useMemo(() => new Set(usage?.unused), [usage]);

    return (
        <div className=" grid grid-cols-8 gap-3">
            {metadata.map(item => {
                return (
                    <SvgIconCard
                        useType={usedIconName.has(item.fileName) ? "used" : unusedIconName.has(item.fileName) ? "unused" : undefined}
                        key={item.fileName}
                        data={item}
                        onRemove={onRemove}
                        onRename={onRename}
                    />
                );
            })}
        </div>
    );
});

export default SvgIconGrid;
