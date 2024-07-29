import React from "react";
import type { FontMetadata } from "server/utils/FontManager/type";
import { EditableText } from "../basic/EditableText";

export interface FontIconCardProps {
    data: FontMetadata;
    useType?: "used" | "unused";
    onRename?: (oldName: string, newName: string) => void;
    onRemove?: (name: string) => void;
}

export const FontIconCard: React.FC<FontIconCardProps> = React.memo(({ data, useType, onRename, onRemove }) => {
    return (
        <div key={data.fileName} className="relative flex flex-col items-center justify-center">
            <span className={`iconfont text-[52px] leading-none ${data.fileName}`} />
            <EditableText onConfirm={value => onRename?.(data.fileName, value)}>
                {start => (
                    <span className="leading-6" onDoubleClick={() => start(data.fileName)}>
                        {data.fileName}
                    </span>
                )}
            </EditableText>
            <span>&#x{data.unicodeHex.toString(16)};</span>
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
