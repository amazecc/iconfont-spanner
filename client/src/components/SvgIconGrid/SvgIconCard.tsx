import React from "react";
import type { SvgComponentMetadata } from "@/utils/FontManager/type";

export interface SvgIconCardProps {
    data: SvgComponentMetadata;
    useType?: "used" | "unused";
    onRename?: (oldName: string, newName: string) => void;
    onRemove?: (name: string) => void;
}

export const SvgIconCard: React.FC<SvgIconCardProps> = React.memo(({ data, useType, onRename, onRemove }) => {
    const [focus, setFocus] = React.useState(false);

    return (
        <div key={data.fileName} className="relative flex flex-col items-center justify-center">
            <span className="text-[52px]" dangerouslySetInnerHTML={{ __html: data.svgOptimizeString }} />
            {focus ? (
                <input
                    defaultValue={data.fileName}
                    onBlur={() => setFocus(false)}
                    onChange={e => e.target.value}
                    // eslint-disable-next-line jsx-a11y/no-autofocus
                    autoFocus
                    className="w-full rounded border-blue-400 bg-gray-100 text-center"
                    onKeyUp={e => {
                        const target = e.target as HTMLInputElement;
                        if (e.key === "Enter") {
                            onRename?.(data.fileName, target.value);
                        }
                    }}
                />
            ) : (
                <span onDoubleClick={() => setFocus(true)}>{data.fileName}</span>
            )}
            {/* <span>&amp;#x{data.unicodeHex.toString(16)};</span> */}
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
