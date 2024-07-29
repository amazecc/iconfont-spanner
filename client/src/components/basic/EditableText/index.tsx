import { Input, type InputProps } from "antd";
import React from "react";

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

    const start = (defaultValue?: string) => {
        setState({ editable: true, defaultValue: defaultValue ?? "" });
    };

    const end = () => {
        setState({ editable: false, defaultValue: "" });
    };

    return editable ? (
        <Input
            size="small"
            autoFocus
            style={{ textAlign: "center" }}
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
