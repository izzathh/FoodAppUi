import { FaStar } from "react-icons/fa6";
import { useNavigate } from "react-router-dom";
import { useFoodApp } from "../../hooks/appProvider";
import { useEffect, useState } from "react";
import Loader from "../../components/Loader"
import { RiDeleteBin5Line } from "react-icons/ri";

const Restaurant = () => {
    const navigate = useNavigate();
    const {
        getAllRestaurants,
        isLoading,
        handleResturantDelete,
        restaurants,
        setRestaurants,
        closeMenu } = useFoodApp();

    useEffect(() => {
        async function getRestaurants() {
            const allRes = await getAllRestaurants();
            console.log('allRes:', allRes);
            setRestaurants(allRes.data.restaurants);
        }
        getRestaurants();
    }, [])

    const handleEditRestaurant = (id) => {
        sessionStorage.setItem('edit-id', id)
        navigate('/edit-restaurant')
    }

    const loaderStyle = {
        position: 'relative',
        bottom: '7em',
        right: '13em'
    }

    return (
        <div className="restaurant-container">
            {isLoading ? (
                <Loader style={loaderStyle} />
            ) : (
                <>
                    <div className="page-title">
                        <h2>Top Restaurants</h2>
                        <button onClick={() => navigate('/add-restaurant')}>Add Restaurant</button>
                    </div>
                    <div className="filter-options">
                        <button>Filter</button>
                        <button>Sort by</button>
                        <button>Ratings 4.0+</button>
                        <button>Pure Veg</button>
                        <button>Fast Delivery</button>
                        <button>Offers</button>
                    </div>
                    <div className={`all-restaurants ${closeMenu ? 'all-restaurants-close' : ''}`}>
                        {restaurants.map((shop, index) => (
                            <div onClick={() => handleEditRestaurant(shop._id)} key={index} className="restaurant-contents">
                                <div className="restaurant-image">
                                    <img src={shop.image} alt="shop" />
                                </div>
                                <div className="shop-name">{shop.restaurantName}</div>
                                <div className="shop-rat-delivery">
                                    <span><FaStar style={{ color: '#ffce39' }} />{shop.rating}</span>
                                    <span>•</span>
                                    <span>{shop.deliveryTime}</span>
                                </div>
                                <div className="res-address-city">
                                    <span>{shop.address}, {shop.city}</span>
                                    <button onClick={(e) => {
                                        e.stopPropagation();
                                        handleResturantDelete(shop._id);
                                    }}>
                                        <RiDeleteBin5Line />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </>
            )}
        </div>
    )
}
export default Restaurant;