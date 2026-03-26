import { AppstoreOutlined, UserOutlined, BookOutlined } from '@ant-design/icons'
import React, { useMemo } from "react";
import { Layout, Menu, type MenuProps, Spin } from "antd";
import { useClassroom } from "./ClassroomContext.tsx";

const { Sider } = Layout;

interface SidebarProps {
    collapsed: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({ collapsed }) => {
    const { courses, selectCourse, loadingCourses } = useClassroom();

    // Используем useMemo, чтобы пункты меню не пересчитывались при каждом мигании курсора
    const menuItems: MenuProps['items'] = useMemo(() => [
        {
            key: 'dashboard',
            icon: <AppstoreOutlined />,
            label: 'Главная',
        },
        {
            type: 'divider',
        },
        {
            key: 'courses_group',
            label: 'Мои курсы',
            type: 'group', // добавим тип группа для красоты
            children: loadingCourses
                ? [{ key: 'loading', label: <Spin size="small" /> }]
                : courses && courses.length > 0
                    ? courses.map(course => ({
                        key: course.id,
                        icon: <BookOutlined />,
                        label: course.name,
                        title: course.name,
                    }))
                    : [{ key: 'no_courses', label: 'Нет курсов', disabled: true }]
        },
        {
            type: 'divider',
        },
        {
            key: 'profile',
            icon: <UserOutlined />,
            label: 'Настройки',
        },
    ], [courses, loadingCourses]);

    return (
        <Sider
            trigger={null}
            collapsible
            collapsed={collapsed}
            width={250}
            style={{ overflow: 'auto', height: '100vh', position: 'sticky', top: 0, left: 0 }}
        >
            <div style={{
                height: 32, margin: 16, backgroundColor: 'rgba(255,255,255,.2)',
                borderRadius: 6, display: 'flex', justifyContent: 'center',
                alignItems: 'center', color: '#fff', fontWeight: 'bold'
            }}>
                {collapsed ? 'A' : 'AntyCopyRight'}
            </div>
            <Menu
                theme='dark'
                mode='inline'
                defaultSelectedKeys={['dashboard']}
                items={menuItems}
                onClick={(info) => selectCourse(info.key)}
            />
        </Sider>
    );
};