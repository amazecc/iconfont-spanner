import React from "react";
import type { SvgComponentMetadata } from "server/utils/FontManager/type";
import { EditableText } from "../basic/EditableText";

export interface SvgIconCardProps {
    data: SvgComponentMetadata;
    useType?: "used" | "unused";
    onRename?: (oldName: string, newName: string) => void;
    onRemove?: (name: string) => void;
}

export const SvgIconCard: React.FC<SvgIconCardProps> = React.memo(({ data, useType, onRename, onRemove }) => {
    return (
        <div key={data.fileName} className="relative flex flex-col items-center justify-center">
            <span className="text-[52px]" dangerouslySetInnerHTML={{ __html: data.svgOptimizeString }} />
            <EditableText onConfirm={value => onRename?.(data.fileName, value)}>
                {start => (
                    <span className="leading-6" onDoubleClick={() => start(data.fileName)}>
                        {data.fileName}
                    </span>
                )}
            </EditableText>
            <span>{data.name}</span>
            <span
                className="cursor-pointer text-red-600"
                onClick={() => {
                    onRemove?.(data.fileName);
                }}
            >
                删除
            </span>
            {useType === "unused" && <span className="absolute right-0 top-0 text-xs text-red-600">未使用</span>}
            {useType === "used" && <span className="absolute right-0 top-0 text-xs text-green-600">已使用</span>}
        </div>
    );
});
