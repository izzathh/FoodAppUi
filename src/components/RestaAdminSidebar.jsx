import { MdOutlineSpaceDashboard } from "react-icons/md";
import { GrRestaurant } from "react-icons/gr";
import { BiDish } from "react-icons/bi";
import { IoRestaurantOutline } from "react-icons/io5";
import { useEffect, useState } from "react";
import { useFoodApp } from "../hooks/appProvider";
import { useNavigate } from 'react-router-dom';
import { TbCategory2 } from "react-icons/tb";
import { BsFillMenuButtonWideFill } from "react-icons/bs";

const RestaAdminSidebar = () => {
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
                    onClick={() => handleNavClick('/restaurant-dashboard')}
                    className={`${(activePage === '/restaurant-dashboard') && 'active'}`}
                >
                    <MdOutlineSpaceDashboard /><span>Dashboard</span>
                </button>
                <button
                    onClick={() => handleNavClick('/my-restaurant')}
                    className={`${(activePage === '/my-restaurant') && 'active'}`}
                >
                    <GrRestaurant /><span>Restaurant</span>
                </button>
                <button
                    onClick={() => handleNavClick('/categories')}
                    className={`${(activePage === '/categories') && 'active'}`}
                >
                    <TbCategory2 /><span>Category</span>
                </button>
                <button
                    onClick={() => handleNavClick('/sub-categories')}
                    className={`subcategory ${(activePage === '/sub-categories') && 'active'}`}
                >
                    <BsFillMenuButtonWideFill /><span>Sub Category</span>
                </button>
                <button
                    onClick={() => handleNavClick('/dishes')}
                    className={`${(activePage === '/dishes') && 'active'}`}
                >
                    <BiDish /><span>Dishes</span>
                </button>
                <button
                    onClick={() => handleNavClick('/restaurant-orders')}
                    className={`${(activePage === '/restaurant-orders') && 'active'}`}
                >
                    <IoRestaurantOutline /><span>Orders</span>
                </button>
            </div>
        </div>
    )
}

export default RestaAdminSidebar;