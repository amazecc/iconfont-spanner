import React from "react";
import type { SvgComponentMetadata } from "server/src/utils/FontManager/type";
import { SvgIconCard, type SvgIconCardProps } from "./SvgIconCard";

export interface SvgIconGridProps extends Pick<SvgIconCardProps, "onRemove" | "onRename"> {
    metadata: SvgComponentMetadata[];
}

const SvgIconGrid: React.FC<SvgIconGridProps> = React.memo(({ metadata, onRemove, onRename }) => {
    return (
        <div className=" grid grid-cols-8 gap-3">
            {metadata.map(item => {
                return <SvgIconCard key={item.fileName} data={item} onRemove={onRemove} onRename={onRename} />;
            })}
        </div>
    );
});

export default SvgIconGrid;
