import { Button } from "antd";
import type { ButtonProps } from "antd/lib/button";
import React from "react";

export interface AutoLoadingButtonProps extends ButtonProps {
    /**
     * 返回 Promise 则根据 Promise 状态自动添加 loading 效果
     * @status
     * - pending -> loading
     * - resolve/reject -> 取消 loading
     */
    onClick?: (event: React.MouseEvent<HTMLElement, MouseEvent>) => void | Promise<any>;
}

export const AutoLoadingButton: React.FC<AutoLoadingButtonProps> = React.memo(props => {
    const [loading, setLoading] = React.useState(false);
    const onClick: React.MouseEventHandler<HTMLElement> = async event => {
        try {
            setLoading(true);
            return await props.onClick!(event);
        } finally {
            setLoading?.(false);
        }
    };

    return <Button {...props} loading={loading || props.loading} onClick={props.onClick ? onClick : undefined} />;
});
