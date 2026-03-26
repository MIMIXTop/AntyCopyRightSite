import {useState} from "react";
import {Layout} from "antd";
import {Sidebar} from "./Sidebar";
import {AppHeader} from "./AppHeader.tsx";
import {AppContent} from "./AppContent.tsx";

export const MainLayout = () => {
    const [collapsed, setCollapsed] = useState(false);

    return (
        <Layout style={{ minHeight: '100vh' }}>
            <Sidebar collapsed={collapsed} />
            <Layout>
                <AppHeader
                    collapsed={collapsed}
                    onToggle={() => setCollapsed(!collapsed)}
                />
                <AppContent/>
            </Layout>
        </Layout>
    );
};  