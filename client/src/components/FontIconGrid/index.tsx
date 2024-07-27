import React from "react";
import type { FontMetadata } from "@/utils/FontManager/type";
import { type FontIconCardProps, FontIconCard } from "./FontCard";
import { type FontUsage } from "../../api/scanIcon";
import { FontStyle } from "./FontStyle";

export interface FontIconGridProps extends Pick<FontIconCardProps, "onRemove" | "onRename"> {
    metadata: FontMetadata[];
    usage?: FontUsage["font"];
}

const FontIconGrid: React.FC<FontIconGridProps> = React.memo(({ metadata, usage, onRemove, onRename }) => {
    const usedIconName = React.useMemo(() => new Set(usage?.used), [usage]);
    const unusedIconName = React.useMemo(() => new Set(usage?.unused), [usage]);

    return (
        <>
            <FontStyle metadata={metadata} />
            <div className=" grid grid-cols-8 gap-3">
                {metadata.map(item => {
                    return (
                        <FontIconCard
                            useType={usedIconName.has(item.fileName) ? "used" : unusedIconName.has(item.fileName) ? "unused" : undefined}
                            key={item.fileName}
                            data={item}
                            onRemove={onRemove}
                            onRename={onRename}
                        />
                    );
                })}
            </div>
        </>
    );
});

export default FontIconGrid;
