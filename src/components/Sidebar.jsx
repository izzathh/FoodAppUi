import { MdOutlineSpaceDashboard } from "react-icons/md";
import { GrRestaurant } from "react-icons/gr";
import { BiDish } from "react-icons/bi";
import { IoRestaurantOutline } from "react-icons/io5";
import { FaRegHandshake } from "react-icons/fa";
import { useEffect, useState } from "react";
import { MdOutlineDeliveryDining } from "react-icons/md";
import { useFoodApp } from "../hooks/appProvider";
import { useNavigate } from 'react-router-dom';

const Sidebar = () => {
    const navigate = useNavigate();
    const [activePage, setActivePage] = useState('dashboard');
    const { closeMenu } = useFoodApp();

    useEffect(() => {
        if (sessionStorage.getItem('active')) {
            setActivePage(sessionStorage.getItem('active'))
        }
    }, [])

    const handleNavClick = (activePg) => {
        setActivePage(activePg)
        sessionStorage.setItem('active', activePg)
        navigate(`${activePg}`)
    }

    return (
        <div className="sidebar-container">
            <div className={`sidebar-navs ${closeMenu ? 'close-sidebar-navs' : ''}`}>
                <button
                    onClick={() => handleNavClick('/dashboard')}
                    className={`${(activePage === '/dashboard') && 'active'}`}
                >
                    <MdOutlineSpaceDashboard /><span>Dashboard</span>
                </button>
                <button
                    onClick={() => handleNavClick('/')}
                    className={`${(activePage === '/') && 'active'}`}
                >
                    <GrRestaurant /><span>Restaurant</span>
                </button>
                <button
                    onClick={() => handleNavClick('/clients')}
                    className={`${(activePage === '/clients') && 'active'}`}
                >
                    <FaRegHandshake /><span>Clients</span>
                </button>
                <button
                    onClick={() => handleNavClick('/orders')}
                    className={`${(activePage === '/orders') && 'active'}`}
                >
                    <IoRestaurantOutline /><span>Orders</span>
                </button>
                <button
                    onClick={() => handleNavClick('/delivery-people')}
                    className={`${(activePage === '/delivery-people') && 'active'}`}
                >
                    <MdOutlineDeliveryDining /><span>Delivery People</span>
                </button>
            </div>
        </div>
    )
}

export default Sidebar;