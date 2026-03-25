import {UploadOutlined, UserOutlined, VideoCameraOutlined } from '@ant-design/icons'
import React from "react";
import {Layout, Menu} from "antd";

const { Sider } = Layout;

interface SidebarProps {
    collapsed: boolean;
}

export const Sidebar : React.FC<SidebarProps> = ({ collapsed }) => {

    const items = [
        { key: '1', icon: <UserOutlined />, label: 'Профиль' },
        { key: '2', icon: <VideoCameraOutlined />, label: 'Видео' },
        { key: '3', icon: <UploadOutlined />, label: 'Загрузки' },
    ];

    return (
        <Sider trigger={null} collapsible collapsed={collapsed}>
            <div style={{
                height: 32, margin: 16, backgroundColor: 'rgba(255,255,255,.2)',
                borderRadius: 6, display: 'flex', justifyContent: 'center',
                alignItems: 'center', color: '#fff',
            }}>
                {collapsed ? 'A' : 'ANT DESIGN'}
            </div>
            <Menu theme='dark' mode='inline' defaultSelectedKeys={['1']} items={items} />
        </Sider>
    );
};