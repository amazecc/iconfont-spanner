import React from "react";
import classnames from "classnames";

export type UsageType = "已使用" | "未使用" | "未扫描";

export interface UsageCheckboxGroupProps {
    value?: UsageType;
    onChange?: (value?: UsageType) => void;
}

export const UsageCheckboxGroup: React.FC<UsageCheckboxGroupProps> = React.memo(({ value, onChange }) => {
    const itemClass = (type: UsageType) => classnames("flex cursor-pointer items-center text-sm text-gray-700", value?.includes(type) && "font-bold text-blue-600");

    return (
        <div className="inline-flex gap-4">
            <span className={itemClass("已使用")} onClick={() => onChange?.(value === "已使用" ? undefined : "已使用")}>
                <span className="mr-1 h-[1em] w-[1em] border border-gray-300 bg-green-200" />
                已使用
            </span>
            <span className={itemClass("未使用")} onClick={() => onChange?.(value === "未使用" ? undefined : "未使用")}>
                <span className="mr-1 h-[1em] w-[1em] border border-gray-300 bg-slate-200" />
                未使用
            </span>
            <span className={itemClass("未扫描")} onClick={() => onChange?.(value === "未扫描" ? undefined : "未扫描")}>
                <span className="mr-1 h-[1em] w-[1em] border border-gray-300" />
                未扫描
            </span>
        </div>
    );
});
