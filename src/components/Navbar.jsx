import { IoFastFoodSharp } from "react-icons/io5";
import { IoSettingsOutline } from "react-icons/io5";
import { IoSearchOutline } from "react-icons/io5";
import ProfileSettings from "./ProfileSettings";
import { useFoodApp } from "../hooks/appProvider";
import { RiMenu2Fill } from "react-icons/ri";
import { IoMdNotificationsOutline } from "react-icons/io";
import { useState } from "react";
import Notifications from "./Notifications";

const Navbar = () => {
    const {
        openProfileSettings,
        setOpenProfileSettings,
        closeMenu,
        setCloseMenu,
        openNotifications,
        setOpenNotifications,
        animateBell,
        setAnimateBell
    } = useFoodApp();

    return (
        <div className="navbar">
            <div className="app-logo-menu">
                <div className="app-logo-svg">
                    <svg width="0" height="0">
                        <defs>
                            <linearGradient id="gradient1" x1="0%" y1="0%" x2="100%" y2="100%">
                                <stop offset="0%" style={{ stopColor: '#d444eb', stopOpacity: 1 }} />
                                <stop offset="100%" style={{ stopColor: '#73257f', stopOpacity: 1 }} />
                            </linearGradient>
                        </defs>
                    </svg>
                    <IoFastFoodSharp
                        className="gradient-icon"
                        style={{
                            fontSize: '3em',
                            fill: 'url(#gradient1)'
                        }}
                    />
                    <span>FOOD APP</span>
                </div>
                <div>
                    <button onClick={() => setCloseMenu(!closeMenu)} className="menu-button">
                        <RiMenu2Fill style={{ fontSize: '2em' }} />
                    </button>
                </div>
            </div>
            <div className="search-bar-profile">
                <div className="search-bar">
                    <IoSearchOutline />
                    <input type="text" placeholder="Search" />
                </div>
                <div className="profile-settings">
                    <button
                        onClick={() => {
                            setOpenNotifications(!openNotifications)
                            openProfileSettings ? setOpenProfileSettings(false) : null
                        }}
                        onMouseEnter={() => setAnimateBell(true)}
                        onMouseLeave={() => setAnimateBell(false)}
                    >
                        <span></span>
                        <IoMdNotificationsOutline
                            className={`${animateBell ? 'animate-notification-svg' : ''}`}
                        />
                    </button>
                    <button onClick={() => {
                        setOpenProfileSettings(!openProfileSettings)
                        openNotifications ? setOpenNotifications(false) : null
                    }}>
                        <div className="profile-container">
                            <img src="./src/assets/images/admin-profile.jpg" alt="profile" />
                        </div>
                        <IoSettingsOutline />
                    </button>
                </div>
            </div>
            <Notifications />
            <ProfileSettings />
        </div>
    )
}

export default Navbar;