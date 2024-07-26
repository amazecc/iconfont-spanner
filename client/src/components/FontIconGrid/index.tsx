import React from "react";
import type { FontMetadata } from "@/utils/FontManager/type";
import { type FontIconCardProps, FontIconCard } from "./FontCard";
import { type FontUsage } from "../../api/scanIcon";

export interface FontIconGridProps extends Pick<FontIconCardProps, "onRemove" | "onRename"> {
    metadata: FontMetadata[];
    usage?: FontUsage["font"];
}

const FontIconGrid: React.FC<FontIconGridProps> = React.memo(({ metadata, usage, onRemove, onRename }) => {
    const usedIconName = React.useMemo(() => new Set(usage?.used), [usage]);
    const unusedIconName = React.useMemo(() => new Set(usage?.unused), [usage]);

    return (
        <>
            <style>
                {`
@font-face {
    font-family: "iconfont";
    src:
        url("/api/ttf") format("truetype"),
        url("/api/woff") format("woff"),
        url("/api/woff2") format("woff2");
}

.iconfont {
    font-family: "iconfont" !important;
    font-style: normal;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
}
				`}
            </style>
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
