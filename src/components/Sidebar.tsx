import {UploadOutlined, AppstoreOutlined, UserOutlined, VideoCameraOutlined, BookOutlined } from '@ant-design/icons'
import React, {useEffect, useState} from "react";
import {Layout, Menu, type MenuProps, Spin} from "antd";
import type {Course} from '../types/auth';
import { classroomService } from "../services/ClassroomService.ts";
import {useAuth} from "./AuthContext.tsx";
import {data} from "autoprefixer";
import {Spinner} from "@material-tailwind/react";
import {useClassroom} from "./ClassroomContext.tsx";

const { Sider } = Layout;

interface SidebarProps {
    collapsed: boolean;
}

export const Sidebar : React.FC<SidebarProps> = ({ collapsed }) => {

    const {isAuthenticated} = useAuth();

   const {courses, selectCourse , loadingCourse} = useClassroom();

    const menuItems: MenuProps['items'] = [
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
            children: loadingCourse ? [{ key: 'loading', label: <Spin size="small" /> }]
                : courses?.length > 0 ? courses?.map(course => ({
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
    ];

    return (
        <Sider trigger={null} collapsible collapsed={collapsed} width={250} style={{overflowX: 'auto', height: '100vh'}}>
            <div style={{
                height: 32, margin: 16, backgroundColor: 'rgba(255,255,255,.2)',
                borderRadius: 6, display: 'flex', justifyContent: 'center',
                alignItems: 'center', color: '#fff',
            }}>
                {collapsed ? 'Anty' : 'AntyCopyRight'}
            </div>
            <Menu theme='dark' mode='inline' defaultSelectedKeys={['dashboard']} items={menuItems} onClick={(info) => selectCourse(info.key) } />
        </Sider>
    );
};