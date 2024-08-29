import { useFoodApp } from "../hooks/appProvider";
import React, { useRef, useEffect, useState, useContext } from 'react';
import { GrRestaurant } from "react-icons/gr";
import { IoRestaurantOutline } from "react-icons/io5";
import axios from "axios";
import { AuthContext } from "../context/protectedRoutes";
const baseUrl = import.meta.env.VITE_BASE_URL
import { MdOutlineDeliveryDining } from "react-icons/md";
import { MenuListCard, RestaurantCard, DeliveryJobCard } from "./NotificationCards";

const Notifications = () => {
    const {
        setOpenNotifications,
        openNotifications,
        orders,
        setOrders,
        newRestaurants,
        setNewRestaurants,
        newDeliveryPeople,
        setNewDeliveryPeople,
        getMinAgo
    } = useFoodApp();

    const { adminType, adminRestaurantId } = useContext(AuthContext);

    const divRef = useRef(null);
    const [ordersData, setOrdersData] = useState([]);
    const [deliveryJobData, setDeliveryJobData] = useState([]);
    const [restaurantData, setRestaurantData] = useState(null);
    const [orderUniqueId, setOrderUniqueId] = useState('');
    const [orderId, setOrderId] = useState('');
    const [adminId, setAdminId] = useState('');
    const [menuItems, setMenuItems] = useState(null);
    const [deliveryJob, setDeliveryJob] = useState(null);
    const [loadingNotification, setLoadingNotification] = useState(false);

    const handleClickOutside = (event) => {
        if (divRef.current && !divRef.current.contains(event.target)) {
            setOrderUniqueId('')
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

    useEffect(() => {
        orders.map(item => {
            if (
                !item.orderedAt.includes('min') &&
                !item.orderedAt.includes('hour') &&
                !item.orderedAt.includes('just') &&
                !item.orderedAt.includes('day')
            ) {
                item.orderedAt = getMinAgo(item.orderedAt)
            }
        })
        setOrdersData(orders)
    }, [orders])

    useEffect(() => {
        newDeliveryPeople?.map(people => {
            if (
                !people.registeredAt?.includes('min') &&
                !people.registeredAt?.includes('hour') &&
                !people.registeredAt?.includes('just') &&
                !people.registeredAt?.includes('day')
            ) {
                people.registeredAt = getMinAgo(people.registeredAt)
            }
        })
        setDeliveryJobData(newDeliveryPeople)
    }, [newDeliveryPeople])

    useEffect(() => {
        if (openNotifications && adminType === 'shop-admin' && orders.length === 0) {
            setLoadingNotification(true);
            const getPendingOrders = async () => {
                const { data } = await axios.get(`${baseUrl}/admin-actions/get-pending-orders?id=${adminRestaurantId}`);
                console.log('data:', data.orders);
                setOrders(data.orders);
            }
            getPendingOrders();
            setLoadingNotification(false);
            console.log('orders:', orders);
        } else if (openNotifications && adminType === 'admin' && newRestaurants.length === 0) {
            setLoadingNotification(true);
            const getRestaurantRequests = async () => {
                const { data } = await axios
                    .get(`${baseUrl}/admin-actions/get-restaurant-requests?admin=1&restaurantId=none`);
                if (data.status === 1) {
                    data.restaurants?.map(rest => {
                        rest.registeredAt = getMinAgo(rest.registeredAt)
                    })
                    setNewRestaurants(data.restaurants);
                }
            }
            const getPendingDpRegistration = async () => {
                const { data } = await axios.get(`${baseUrl}/admin-actions/get-pending-registration`);
                setNewDeliveryPeople(data.registrations);
            }
            getPendingDpRegistration();
            getRestaurantRequests();
            setLoadingNotification(false);
        }
    }, [openNotifications])

    const handleOrderClick = (id, menu, orderId) => {
        setOrderUniqueId(id)
        setOrderId(orderId)
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

    const handleDeliveryJobClick = async (data) => {

    }


    return (
        <div
            ref={divRef}
            style={{
                transform: `translate(${openNotifications ? '0em' : '22em'}, 0px)`,
                opacity: `${openNotifications ? '1' : '0'}`
            }}
            className={`notifications-container ${loadingNotification ? 'notifications-container-blur' : ''}`}
        >
            {!orderUniqueId && !restaurantData && !deliveryJob && (
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
                                    <h4>Request For Restaurant</h4>
                                    <div className="notify-time-process">
                                        <p>{data.registeredAt}</p>•
                                        <span>Restaurant</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                        {adminType === 'shop-admin' && ordersData.map((data, index) => (
                            <div
                                key={index}
                                onClick={() => handleOrderClick(data._id, data.menu, data.orderId)}
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
                        {adminType === 'admin' && deliveryJobData.map((data, index) => (
                            <div
                                key={index}
                                onClick={() => setDeliveryJob(data)}
                                className="order-request"
                            >
                                <div className="notify-image">
                                    <MdOutlineDeliveryDining />
                                </div>
                                <div className="message-contents">
                                    <h4>{`Application for delivery job`}</h4>
                                    <div className="notify-time-process">
                                        <p>{data.registeredAt}</p>•
                                        <span>Delivery People</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                        {/* <span className="no-notify">No notifications</span> */}
                    </div>
                </>
            )}
            {deliveryJob && (
                <DeliveryJobCard
                    deliveryJob={deliveryJob}
                    setDeliveryJob={setDeliveryJob}
                    setDeliveryJobData={setDeliveryJobData}
                />
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
            {orderUniqueId && menuItems && (
                <MenuListCard
                    id={orderUniqueId}
                    orderId={orderId}
                    menu={menuItems}
                    setOrderId={setOrderId}
                    setOrderUniqueId={setOrderUniqueId}
                    setMenuItems={setMenuItems}
                    setOrdersData={setOrdersData}
                />
            )}
        </div>
    )
}

export default Notifications;