import { Input, type InputProps } from "antd";
import React, { useEffect } from "react";
import { useMemoizedFn } from "ahooks";

export interface EditableTextProps extends Omit<InputProps, "defaultValue" | "onKeyUp" | "children"> {
    /** 按下 enter 键将值抛出 */
    onConfirm?: (value: string) => void | Promise<void | boolean>;
    children: (start: (defaultValue?: string) => void, end: () => void) => React.ReactElement;
}

export const EditableText: React.FC<EditableTextProps> = React.memo(props => {
    const { children, onConfirm, ...restInputProps } = props;
    const [{ editable, defaultValue }, setState] = React.useState({
        editable: false,
        defaultValue: "",
    });

    const start = useMemoizedFn((defaultValue?: string) => {
        setState({ editable: true, defaultValue: defaultValue ?? "" });
    });

    const end = useMemoizedFn(() => {
        setState({ editable: false, defaultValue: "" });
    });

    useEffect(() => {
        const listener = (e: KeyboardEvent) => {
            if (e.key === "Escape") {
                end();
            }
        };
        if (editable) {
            document.addEventListener("keyup", listener);
        }
        return () => {
            document.removeEventListener("keyup", listener);
        };
    }, [editable, end]);

    return editable ? (
        <Input
            size="small"
            autoFocus
            {...restInputProps}
            defaultValue={defaultValue}
            onKeyUp={e => {
                if (e.key === "Enter" && onConfirm) {
                    Promise.resolve(onConfirm(e.currentTarget.value)).then(res => res !== false && end());
                }
            }}
            onBlur={end}
        />
    ) : (
        children(start, end)
    );
});
