import React from "react";
import { useMemoizedFn } from "ahooks";
import { DropFileScanner } from "./utils/DropFileScanner";

type IsArray<M, T> = M extends true ? T[] : T;

export interface FilePickerProps<M> {
    className?: string;
    style?: React.CSSProperties;
    children?: React.ReactNode;
    /** 文件类型 */
    accept?: string;
    /** 支持多选 */
    multiple?: M;
    /** 支持拖拽文件夹 */
    dirDrop?: M;
    /** 文件选择 */
    onSelect?: (file: IsArray<M, File>) => void;
}

/** 文件选择器，支持多文件选择以及文件夹拖拽 */
export const FilePicker = <M extends boolean = false>(props: FilePickerProps<M>) => {
    const { accept, multiple, dirDrop, onSelect, children, ...restProps } = props;
    const labelRef = React.useRef<HTMLLabelElement>(null);
    const isMultiple = dirDrop || multiple;

    const onSelectMemo = useMemoizedFn((files: IsArray<M, File>) => onSelect?.(files));

    React.useEffect(() => {
        const scanner = new DropFileScanner(labelRef.current!);
        if (dirDrop) {
            scanner.addScanListener(
                files => {
                    onSelectMemo?.(files as IsArray<M, File>);
                },
                {
                    filter: fullPath => fullPath.endsWith(".svg"),
                },
            );
        }
        return () => {
            scanner.removeScanListener();
        };
    }, [dirDrop, onSelectMemo]);

    return (
        <label {...restProps} ref={labelRef}>
            <input
                multiple={isMultiple}
                accept={accept}
                hidden
                type="file"
                onChange={e => {
                    const files = Array.from(e.target.files ?? []);
                    if (files.length) {
                        onSelectMemo((isMultiple ? files : files[0]) as IsArray<M, File>);
                    }
                }}
            />
            {children}
        </label>
    );
};
