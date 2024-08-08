import axios from "axios";
const baseUrl = import.meta.env.VITE_BASE_URL
import { useFoodApp } from "../hooks/appProvider";
import { AuthContext } from "../context/protectedRoutes";
import { useContext } from "react";

export const MenuListCard = ({ id, menu, setMenuItems, setOrderId, setOrdersData }) => {
    const {
        setSuccessToast,
        setErrorToast,
        setOrders,
        setOrderList
    } = useFoodApp();

    const { adminRestaurantId } = useContext(AuthContext);

    const handleStatusChange = async (confirmed) => {
        try {
            const { data } = await axios.post(`${baseUrl}/admin-actions/update-order-status`,
                {
                    orderId: id,
                    status: confirmed,
                    restaurantId: adminRestaurantId
                }
            )
            if (data.status === 1) {
                setOrdersData((prev) =>
                    prev.filter(data => data.orderId !== id)
                )
                setOrders((prev) =>
                    prev.filter(data => data.orderId !== id)
                )
                setOrderList((prev) => [...prev, data.updateStatus])
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
        <div className="menu-list-card menu-items">
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
            <div className="card">
                {menu.map((data, index) => (
                    <div key={index} className="card-contents">
                        <div>
                            <img src={data.image} alt="item image" />
                        </div>
                        <div className="item-name-quantity">
                            <div>
                                <label htmlFor="itemName">
                                    <strong>Item Name: </strong>
                                </label>
                                <span id="itemName">{data.itemName}</span>
                            </div>
                            <div>
                                <label htmlFor="quantity">
                                    <strong>Quantity: </strong>
                                </label>
                                <span id="quantity">{data.quantity}</span>
                            </div>
                            <div>
                                <label htmlFor="price">
                                    <strong>Price: </strong>
                                </label>
                                <span id="price">{data.price}</span>
                            </div>
                            <div>
                                <label htmlFor="total">
                                    <strong>Total: </strong>
                                </label>
                                <span id="total">{data.price}</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
            <div className="card-buttons">
                <button onClick={() => handleStatusChange('confirmed')}>Accept</button>
                <button onClick={() => handleStatusChange('rejected')}>Reject</button>
            </div>
        </div>
    )
}

export const RestaurantCard = ({
    restaurantData,
    setNewRestaurants,
    setRestaurantData,
    setAdminId,
    adminId
}) => {
    const {
        setSuccessToast,
        setErrorToast,
        setRestaurants
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
                    setRestaurants(prev =>
                        [...prev, {
                            _id: data.updateRestaurant._id,
                            image: data.updateRestaurant.image,
                            restaurantName: data.updateRestaurant.restaurantName,
                            rating: data.updateRestaurant.rating,
                            deliveryTime: data.updateRestaurant.deliveryTime,
                            address: data.updateRestaurant.address,
                            city: data.updateRestaurant.city,
                        }]
                    )
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
                        <label htmlFor="restauranName">
                            <strong>Restaurant Name: </strong>
                        </label>
                        <span id="restauranName">{restaurantData[0].restaurantName}</span>
                    </div>
                    <div>
                        <label htmlFor="address">
                            <strong>Address: </strong>
                        </label>
                        <span id="address">{restaurantData[0].address}, {restaurantData[0].city}</span>
                    </div>
                    <div>
                        <label htmlFor="fullDescription">
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

export const DeliveryJobCard = ({ deliveryJob, setDeliveryJob, setDeliveryJobData }) => {

    const {
        setSuccessToast,
        setErrorToast,
        setNewDeliveryPeople
    } = useFoodApp();

    const handleStatusChange = async (confirmed) => {
        try {
            console.log('confirmed:', deliveryJob._id, confirmed);
            const { data } = await axios.post(`${baseUrl}/admin-actions/update-deliveryjob-status`,
                {
                    id: deliveryJob._id,
                    adminApproved: confirmed,
                }
            )
            if (data.status === 1) {
                setNewDeliveryPeople((prev) =>
                    prev.filter(data => deliveryJob._id !== data._id)
                )
                setDeliveryJobData((prev) =>
                    prev.filter(data => deliveryJob._id !== data._id)
                )
                setDeliveryJob(null)
                confirmed
                    ? setSuccessToast(`${deliveryJob.name} has been assigned for the delivery job`)
                    : setErrorToast('Job request declined')
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
                <h1>Job Applicant</h1>
            </div>
            <div className="card-contents">
                <div className="item-name-quantity">
                    <div>
                        <label htmlFor="name">
                            <strong>Name: </strong>
                        </label>
                        <span id="name">{deliveryJob.name}</span>
                    </div>
                    <div>
                        <label htmlFor="phoneNumber">
                            <strong>Phone Number: </strong>
                        </label>
                        <span id="phoneNumber">{deliveryJob.phoneNumber}</span>
                    </div>
                    <div>
                        <label htmlFor="vehicleNumber">
                            <strong>Vehicle Number: </strong>
                        </label>
                        <span id="vehicleNumber">{deliveryJob.vehicleNumber}</span>
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