import React from "react";
import {MainLayout} from "./components/MainLayout.tsx";
import {AuthProvider} from "./components/AuthContext.tsx";
import {GoogleOAuthProvider} from "@react-oauth/google";
import ClassroomProvider from "./components/ClassroomContext.tsx";

const App: React.FC = () => {
    return (
        <GoogleOAuthProvider clientId={"874149477634-36fv6jdap0t0su0b9heuf8f7ko86qg2v.apps.googleusercontent.com"}>
            <AuthProvider>
                <ClassroomProvider>
                    <div className="App">
                        <MainLayout/>
                    </div>
                </ClassroomProvider>
            </AuthProvider>
        </GoogleOAuthProvider>
    );
};

export default App;