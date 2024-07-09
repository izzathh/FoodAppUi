import { IoSettingsOutline } from "react-icons/io5";
import { FiLogOut } from "react-icons/fi";
import { useFoodApp } from "../hooks/appProvider";
import { useRef, useEffect } from "react";

const ProfileSettings = () => {
    const { setOpenProfileSettings, openProfileSettings, adminLogout } = useFoodApp();

    const divRef = useRef(null);

    const handleClickOutside = (event) => {
        if (divRef.current && !divRef.current.contains(event.target)) {
            setOpenProfileSettings(false);
        }
    };

    useEffect(() => {
        document.addEventListener('mousedown', handleClickOutside);

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    return (
        <div
            ref={divRef}
            style={{
                transform: `translate(${openProfileSettings ? '0em' : '17em'}, 0px)`,
                opacity: `${openProfileSettings ? '1' : '0'}`
            }}
            className="profile-setting-container"
        >
            <div className="admin-greetings">
                <span>Good Morning, Admin</span>
            </div>
            <div className="darkmode-notification">
                <div className="dark-mode">
                    <span>Dark Mode</span>
                    <div className="darkmode-switch">
                        <input className="switch-toggle1" type="checkbox" id="switch1" />
                        <label className="darkmode-lable" for="switch1">Toggle</label>
                    </div>
                </div>
                <div className="allow-notification">
                    <span>Allow Notifications</span>
                    <div className="allownotify-switch">
                        <input className="switch-toggle2" type="checkbox" id="switch2" />
                        <label className="allownotify-lable" for="switch2">Toggle</label>
                    </div>
                </div>
            </div>
            <div className="account-settings">
                <button className="account-setting-btn">
                    <IoSettingsOutline />
                    <span>Account Settings</span>
                </button>
                <button onClick={adminLogout} className="logout-btn">
                    <FiLogOut />
                    <span>Logout</span>
                </button>
            </div>
        </div>
    )
}

export default ProfileSettings;