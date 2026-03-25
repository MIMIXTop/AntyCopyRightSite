import {Avatar, Button, Dropdown, Layout, type MenuProps, theme, Typography} from "antd";
import { LogoutOutlined, MenuFoldOutlined, MenuUnfoldOutlined, UserOutlined} from '@ant-design/icons';
import React from "react";
import {useAuth} from "./AuthContext.tsx";
import {GoogleLogin} from "@react-oauth/google";

const { Header } = Layout;
const { Title } = Typography;

interface AppHeaderProps {
    collapsed: boolean;
    onToggle: () => void;
}

export const AppHeader : React.FC<AppHeaderProps> = ({ collapsed, onToggle }) => {
    const { token: { colorBgContainer }} = theme.useToken();

    const { user, login, logout, isAuthenticated } = useAuth();

    const userMenuItems: MenuProps['items'] = [
        {
            key: 'info',
            label: (
                <div style={{ padding: '4px 0' }}>
                    <div style={{ fontWeight: 'bold' }}>{user?.name}</div>
                    <div style={{ color: 'gray', fontSize: '12px' }}>{user?.email}</div>
                </div>
            ),
            disabled: true, // Просто для информации, не кликабельно
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
            <div>
                {isAuthenticated ? (
                    <Dropdown menu={{items: userMenuItems}} placement="bottomRight" arrow>
                        <div style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', gap: '8px' }}>
                            <span style={{ fontWeight: 500 }}>{user?.name?.split(' ')[0]}</span>
                            <Avatar
                                src={user?.picture}
                                icon={<UserOutlined />}
                                style={{ border: '1px solid #d9d9d9'}}
                            />
                        </div>
                    </Dropdown>
                ) : (
                    <GoogleLogin
                        onSuccess={(credentialResponse) => {
                            login(credentialResponse);
                        }}
                        onError={ () => {
                            console.error('Ошибка входа через Googl');
                        }}
                        theme='outline'
                        size='large'
                        text='signin_with'
                        shape='rectangular'
                    />
                )}
            </div>
        </Header>
    );
}