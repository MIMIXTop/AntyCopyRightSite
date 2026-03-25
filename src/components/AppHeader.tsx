import { Avatar, Button, Dropdown, Layout, type MenuProps, theme, Typography } from "antd";
import {
    LogoutOutlined,
    MenuFoldOutlined,
    MenuUnfoldOutlined,
    UserOutlined,
    GoogleOutlined // Добавим иконку Google
} from '@ant-design/icons';
import React from "react";
import { useAuth } from "./AuthContext.tsx";
import { useGoogleLogin } from "@react-oauth/google"; // Используем только хук

const { Header } = Layout;
const { Title } = Typography;

interface AppHeaderProps {
    collapsed: boolean;
    onToggle: () => void;
}

export const AppHeader: React.FC<AppHeaderProps> = ({ collapsed, onToggle }) => {
    const { token: { colorBgContainer } } = theme.useToken();
    const { user, login, logout, isAuthenticated } = useAuth();

    // Настраиваем логику входа для получения Access Token (для Classroom API)
    const handleLogin = useGoogleLogin({
        onSuccess: (tokenResponse) => {
            console.log('Login Success:', tokenResponse);
            login(tokenResponse);
        },
        onError: (error) => {
            console.error('Ошибка входа через Google:', error);
        },
        // Добавляем необходимые права для работы с Classroom
        scope: 'https://www.googleapis.com/auth/classroom.courses.readonly',
    });

    const userMenuItems: MenuProps['items'] = [
        {
            key: 'info',
            label: (
                <div style={{ padding: '4px 0' }}>
                    <div style={{ fontWeight: 'bold' }}>{user?.name}</div>
                    <div style={{ color: 'gray', fontSize: '12px' }}>{user?.email}</div>
                </div>
            ),
            disabled: true,
        },
        { type: 'divider' },
        {
            key: 'logout',
            icon: <LogoutOutlined />,
            danger: true,
            label: 'Выйти',
            onClick: logout,
        },
    ];

    return (
        <Header style={{
            padding: '0 24px 0 0',
            background: colorBgContainer,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
        }}>
            <div style={{ display: 'flex', alignItems: 'center' }}>
                <Button
                    type="text"
                    icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
                    onClick={onToggle}
                    style={{ fontSize: '16px', width: 64, height: 64 }}
                />
                <Title level={4} style={{ margin: 0 }}>Dashboard</Title>
            </div>

            <div style={{ paddingRight: '8px' }}>
                {isAuthenticated ? (
                    <Dropdown menu={{ items: userMenuItems }} placement="bottomRight" arrow>
                        <div style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', gap: '8px' }}>
                            <span style={{ fontWeight: 500 }}>{user?.name?.split(' ')[0]}</span>
                            <Avatar
                                src={user?.picture}
                                icon={<UserOutlined />}
                                style={{ border: '1px solid #d9d9d9' }}
                            />
                        </div>
                    </Dropdown>
                ) : (
                    <Button
                        type="default"
                        icon={<GoogleOutlined />}
                        onClick={() => handleLogin()}
                        size="large"
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            borderRadius: '4px'
                        }}
                    >
                        Войти через Google
                    </Button>
                )}
            </div>
        </Header>
    );
};