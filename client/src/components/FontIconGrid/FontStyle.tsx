import React from "react";
import type { FontMetadata } from "@/utils/FontManager/type";

export interface FontStyleProps {
    metadata: FontMetadata[];
}

export const FontStyle: React.FC<FontStyleProps> = React.memo(({ metadata }) => {
    return (
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
${metadata
    .map(item => {
        return `
.${item.fileName}::before {
  content: "\\${item.unicodeHex.toString(16)}";
}
`;
    })
    .join("")}
				`}
        </style>
    );
});
