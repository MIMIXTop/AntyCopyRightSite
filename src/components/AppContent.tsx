import React from 'react';
import { Layout, theme } from 'antd';

const { Content } = Layout;

interface AppContentProps {
    children: React.ReactNode;
}

export const AppContent : React.FC<AppContentProps> = ({ children }: AppContentProps) => {
    const {
        token: { colorBgContainer, borderRadiusLG },
    } = theme.useToken();

    return (
        <Content
            style={{
                margin: '24px 16px',
                padding: 24,
                minHeight: 280,
                background: colorBgContainer,
                borderRadius: borderRadiusLG,
            }}>
            {children}
        </Content>
    );
}