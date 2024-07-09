import { useFoodApp } from "../hooks/appProvider";
import React, { useRef, useEffect, useState, useContext } from 'react';
import { GrRestaurant } from "react-icons/gr";
import { IoRestaurantOutline } from "react-icons/io5";
import moment from "moment";
import axios from "axios";
import { AuthContext } from "../context/protectedRoutes";
const baseUrl = import.meta.env.VITE_BASE_URL

const RestaurantCard = ({
    restaurantData,
    setNewRestaurants,
    setRestaurantData,
    setAdminId,
    adminId
}) => {
    const {
        setSuccessToast,
        setErrorToast,
        setRestaurants,
        getAllRestaurants
    } = useFoodApp();

    const handleStatusChange = async (confirmed) => {
        try {

            const { data } = await axios.post(`${baseUrl}/admin-actions/update-restaurant-status`,
                {
                    adminId: adminId,
                    restaurantId: restaurantData[0]._id,
                    adminApproved: confirmed,
                }
            )
            if (data.status === 1) {
                setRestaurantData(null);
                setAdminId('')
                setNewRestaurants((prev) =>
                    prev.filter(data => data.restaurantId !== restaurantData[0]._id)
                )
                if (confirmed) {
                    const allRes = await getAllRestaurants();
                    setRestaurants(allRes.restaurants);
                }
                confirmed
                    ? setSuccessToast('Restaurant added successfully')
                    : setErrorToast('Restaurant request declined')
                return
            }
            setErrorToast(data.message)
        } catch (error) {
            console.error('error:', error);
        }
    }

    return (
        <div className="menu-list-card">
            <div className="card-title">
                <h1>Restaurant Details</h1>
            </div>
            <div className="req-restaurant-image">
                <img src={restaurantData[0].image} alt="restaurant image" />
            </div>
            <div className="card-contents">
                <div className="item-name-quantity">
                    <div>
                        <label for="restauranName">
                            <strong>Restaurant Name: </strong>
                        </label>
                        <span id="restauranName">{restaurantData[0].restaurantName}</span>
                    </div>
                    <div>
                        <label for="address">
                            <strong>Address: </strong>
                        </label>
                        <span id="address">{restaurantData[0].address}, {restaurantData[0].city}</span>
                    </div>
                    <div>
                        <label for="fullDescription">
                            <strong>Description: </strong>
                        </label>
                        <span id="fullDescription">{restaurantData[0].fullDescription}</span>
                    </div>
                </div>
            </div>
            <div className="card-buttons">
                <button onClick={() => handleStatusChange(true)}>Accept</button>
                <button onClick={() => handleStatusChange(false)}>Reject</button>
            </div>
        </div>
    )
}

const MenuListCard = ({ id, menu, setMenuItems, setOrderId, setOrdersData }) => {
    const {
        setSuccessToast,
        setErrorToast,
        setOrders
    } = useFoodApp();

    const handleStatusChange = async (confirmed) => {
        try {
            const { data } = await axios.post(`${baseUrl}/admin-actions/update-order-status`,
                {
                    orderId: id,
                    status: confirmed
                }
            )
            if (data.status === 1) {
                setOrdersData((prev) =>
                    prev.filter(data => data.orderId !== id)
                )
                setOrders((prev) =>
                    prev.filter(data => data.orderId !== id)
                )
                confirmed === 'confirmed'
                    ? setSuccessToast('Order placed successfully')
                    : setErrorToast('Order rejected')
                setMenuItems(null)
                setOrderId('')
                return
            }
            setErrorToast(data.message)
        } catch (error) {
            console.error('error:', error);
        }
    }

    return (
        <div className="menu-list-card">
            <div className="card-title">
                <div className="title-back-btn">
                    <h1>Ordered Items</h1>
                    <button
                        onClick={() => {
                            setMenuItems(null)
                            setOrderId('')
                        }}
                    >Back</button>
                </div>
                <span>{id}</span>
            </div>
            {menu.map((data, index) => (
                <div key={index} className="card-contents">
                    <div>
                        <img src={data.image} alt="item image" />
                    </div>
                    <div className="item-name-quantity">
                        <div>
                            <label for="itemName">
                                <strong>Item Name: </strong>
                            </label>
                            <span id="itemName">{data.itemName}</span>
                        </div>
                        <div>
                            <label for="quantity">
                                <strong>Quantity: </strong>
                            </label>
                            <span id="quantity">{data.quantity}</span>
                        </div>
                        <div>
                            <label for="price">
                                <strong>Price: </strong>
                            </label>
                            <span id="price">{data.price}</span>
                        </div>
                        <div>
                            <label for="total">
                                <strong>Total: </strong>
                            </label>
                            <span id="total">{data.price}</span>
                        </div>
                    </div>
                </div>
            ))}
            <div className="card-buttons">
                <button onClick={() => handleStatusChange('confirmed')}>Accept</button>
                <button onClick={() => handleStatusChange('rejected')}>Reject</button>
            </div>
        </div>
    )
}

const Notifications = () => {
    const {
        setOpenNotifications,
        openNotifications,
        orders,
        setOrders,
        newRestaurants,
        setNewRestaurants
    } = useFoodApp();

    const { adminType } = useContext(AuthContext);

    const divRef = useRef(null);
    const [ordersData, setOrdersData] = useState([]);
    const [restaurantData, setRestaurantData] = useState(null);
    const [orderId, setOrderId] = useState('');
    const [adminId, setAdminId] = useState('');
    const [menuItems, setMenuItems] = useState(null);
    const [loadingNotification, setLoadingNotification] = useState(false);

    const handleClickOutside = (event) => {
        if (divRef.current && !divRef.current.contains(event.target)) {
            setOrderId('')
            setMenuItems(null)
            setOpenNotifications(false);
        }
    };

    useEffect(() => {
        document.addEventListener('mousedown', handleClickOutside);

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const getMinAgo = (orderTime) => {
        const currentTime = moment();
        const diff = currentTime.diff(orderTime)
        const timeDur = moment.duration(diff)
        return timeDur.minutes() == 0 ? 'just now' : `${timeDur.minutes()} mins ago`
    }

    useEffect(() => {
        orders.map(item => {
            if (!item.orderedAt.includes('mins')) {
                item.orderedAt = getMinAgo(item.orderedAt)
            }
        })
        setOrdersData(orders)
    }, [orders])

    useEffect(() => {
        if (openNotifications && adminType === 'shop-admin') {
            setLoadingNotification(true);
            const getPendingOrders = async () => {
                const { data } = await axios.get(`${baseUrl}/admin-actions/get-pending-orders`);
                console.log('data:', data.orders);
                setOrders(data.orders);
                setLoadingNotification(false);
            }
            getPendingOrders();
            console.log('orders:', orders);
        } else if (openNotifications && adminType === 'admin') {
            setLoadingNotification(true);
            const getRestaurantRequests = async () => {
                const { data } = await axios
                    .get(`${baseUrl}/admin-actions/get-restaurant-requests?admin=1&restaurantId=none`);
                if (data.status === 1) setNewRestaurants(data.restaurants);
                setLoadingNotification(false);
            }
            getRestaurantRequests();
        }
    }, [openNotifications])

    const handleOrderClick = (id, menu) => {
        setOrderId(id)
        setMenuItems(menu)
    }

    const handleNewResClick = async (restaurantId, adminId) => {
        try {
            setLoadingNotification(true);
            const { data } = await axios
                .get(`${baseUrl}/admin-actions/get-restaurant-requests?admin=0&restaurantId=${restaurantId}`)
            if (data.status === 1) {
                setRestaurantData(data.restaurants)
                setAdminId(adminId)
                setLoadingNotification(false);
            }
        } catch (error) {
            console.log('handleNewResClick:', error);
        }
    }

    return (
        <div
            ref={divRef}
            style={{
                transform: `translate(${openNotifications ? '0em' : '22em'}, 0px)`,
                opacity: `${openNotifications ? '1' : '0'}`
            }}
            className="notifications-container"
        >
            {!orderId && !restaurantData && (
                <>
                    <div className="notifications-title">
                        <h1>Notifications</h1>
                        <button><span>Mark all as read</span></button>
                    </div>
                    <div className="all-req-notification-line">
                        <div className="all-req-notification">
                            <button>All</button>
                            <button>Requests</button>
                        </div>
                        <span></span>
                    </div>
                    <div className="notification-contents">
                        {loadingNotification && <div className="notification-loader"></div>}
                        {adminType === 'admin' && newRestaurants?.map((data, index) => (
                            <div
                                onClick={() => handleNewResClick(data.restaurantId, data._id)}
                                key={index}
                                className="restaurant-request"
                            >
                                <div className="notify-image">
                                    <GrRestaurant />
                                </div>
                                <div className="message-contents">
                                    <h4>{data.username} Requested For Restaurant</h4>
                                    <div className="notify-time-process">
                                        <p>42 mins ago</p>•
                                        <span>Restaurant</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                        {adminType === 'shop-admin' && ordersData.map((data, index) => (
                            <div
                                key={index}
                                onClick={() => handleOrderClick(data.orderId, data.menu)}
                                className="order-request"
                            >
                                <div className="notify-image">
                                    <IoRestaurantOutline />
                                </div>
                                <div className="message-contents">
                                    <h4>{`${data.menucount} Items were Ordered`}</h4>
                                    <div className="notify-time-process">
                                        <p>{data.orderedAt}</p>•
                                        <span>Order</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                        {/* <span className="no-notify">No notifications</span> */}
                    </div>
                </>
            )}
            {restaurantData && (
                <RestaurantCard
                    adminId={adminId}
                    setAdminId={setAdminId}
                    restaurantData={restaurantData}
                    setRestaurantData={setRestaurantData}
                    setNewRestaurants={setNewRestaurants}
                    newRestaurants={newRestaurants}
                />
            )}
            {orderId && menuItems && (
                <MenuListCard
                    id={orderId}
                    menu={menuItems}
                    setOrderId={setOrderId}
                    setMenuItems={setMenuItems}
                    setOrdersData={setOrdersData}
                />
            )}
        </div>
    )
}

export default Notifications;