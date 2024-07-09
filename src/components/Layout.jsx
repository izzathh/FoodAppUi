import Sidebar from "./Sidebar"
import RestaAdminSidebar from "./RestaAdminSidebar"
import Navbar from "./Navbar"
import { useFoodApp } from "../hooks/appProvider";
import { useContext } from "react";
import { AuthContext } from "../context/protectedRoutes";

const Layout = ({ children }) => {
    const { closeMenu, mainBlurred } = useFoodApp();
    const { adminType } = useContext(AuthContext);

    return (
        <div className={`layout-container ${mainBlurred ? 'blur-layout-container' : ''}`}>
            <Navbar />
            {adminType === 'shop-admin' ? (
                <RestaAdminSidebar />
            ) : (
                <Sidebar />
            )}
            <div style={{ marginLeft: closeMenu ? '5em' : '21em' }} className="sidebar-main">
                <main>
                    {children}
                </main>
            </div>
        </div>
    )
}

export default Layout;