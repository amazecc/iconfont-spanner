import React from "react";
import classnames from "classnames";
import type { FontMetadata } from "server/utils/FontManager/type";
import { type FontUsage } from "../../api/scanIcon";
import { FontStyle } from "./FontStyle";
import { FontCard } from "../FontCard";

export interface FontIconGridProps {
    metadata: FontMetadata[];
    usage?: FontUsage["font"];
    onRename?: (oldName: string, newName: string) => void;
    onRemove?: (name: string) => void;
}

const FontIconGrid: React.FC<FontIconGridProps> = React.memo(({ metadata, usage, onRemove, onRename }) => {
    const unusedIconName = React.useMemo(() => new Set(usage?.unused), [usage]);

    return (
        <>
            <FontStyle metadata={metadata} />
            <div className=" grid grid-cols-6 gap-3">
                {metadata.map(item => {
                    return (
                        <FontCard
                            key={item.fileName}
                            className={classnames(unusedIconName.has(item.fileName) && "bg-slate-200")}
                            name={item.fileName}
                            icon={<span className={`iconfont text-[52px] leading-none ${item.fileName}`} />}
                            onClickRemove={() => onRemove?.(item.fileName)}
                            onEditConfirm={value => onRename?.(item.fileName, value)}
                        />
                    );
                })}
            </div>
        </>
    );
});

export default FontIconGrid;
