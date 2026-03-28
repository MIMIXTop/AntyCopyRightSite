import React from "react";
import {MainLayout} from "./components/MainLayout.tsx";
import {AuthProvider} from "./components/AuthContext.tsx";
import {GoogleOAuthProvider} from "@react-oauth/google";
import ClassroomProvider from "./components/ClassroomContext.tsx";
import {ConfigProvider, theme} from "antd";

const md3Theme = {
    token: {
        colorPrimary: '#6750A4',
        colorBgLayout: '#FEF7FF', // Светлый фон MD3
        borderRadius: 16,
        lineWidth: 0, // Убираем границы
    },
    components: {
        Table: {
            // Исправляет проблему черного прямоугольника при наведении
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
        <GoogleOAuthProvider clientId={"874149477634-36fv6jdap0t0su0b9heuf8f7ko86qg2v.apps.googleusercontent.com"}>
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
        </GoogleOAuthProvider>
    );
};

export default App;