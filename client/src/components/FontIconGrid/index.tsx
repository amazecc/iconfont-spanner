import React from "react";
import type { FontMetadata } from "server/src/utils/FontManager/type";
import { type FontIconCardProps, FontIconCard } from "./FontCard";

export interface FontIconGridProps extends Pick<FontIconCardProps, "onRemove" | "onRename"> {
    metadata: FontMetadata[];
}

const FontIconGrid: React.FC<FontIconGridProps> = React.memo(({ metadata, onRemove, onRename }) => {
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
                    return <FontIconCard key={item.fileName} data={item} onRemove={onRemove} onRename={onRename} />;
                })}
            </div>
        </>
    );
});

export default FontIconGrid;
