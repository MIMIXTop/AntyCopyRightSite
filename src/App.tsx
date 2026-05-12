import React from "react";
import {MainLayout} from "./components/MainLayout.tsx";
import {AuthProvider} from "./components/AuthContext.tsx";
import ClassroomProvider from "./components/ClassroomContext.tsx";
import {ConfigProvider} from "antd";

const md3Theme = {
    token: {
        colorPrimary: '#6750A4',
        colorBgLayout: '#FEF7FF', // Светлый фон MD3
        borderRadius: 16,
        lineWidth: 0, // Убираем границы
    },
    components: {
        Table: {
            colorRowHover: '#EADDFF',
            headerBg: 'transparent',
            colorFillAlter: '#F7F2FA', // Цвет чередующихся строк
            colorBgContainer: 'transparent',
        },
        Tabs: {
            itemSelectedColor: '#6750A4',
            inkBarColor: '#6750A4',
        },
        Card: {
            colorBgContainer: '#F3EDF7',
        }
    },
};

const App: React.FC = () => {
    return (
        <AuthProvider>
            <ClassroomProvider>
                <div className="App">
                    <ConfigProvider
                        theme={md3Theme}
                    >
                        <MainLayout/>
                    </ConfigProvider>
                </div>
            </ClassroomProvider>
        </AuthProvider>
    );
};

export default App;
