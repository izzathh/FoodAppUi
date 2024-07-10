import axios from "axios";
const baseUrl = import.meta.env.VITE_BASE_URL
import { useFoodApp } from "../hooks/appProvider";

export const MenuListCard = ({ id, menu, setMenuItems, setOrderId, setOrdersData }) => {
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

export const DeliveryJobCard = ({ data }) => {
    return (
        <div className="menu-list-card">
            <div className="card-title">
                <h1>Job Applicant</h1>
            </div>
            <div className="card-contents">
                <div className="item-name-quantity">
                    <div>
                        <label for="name">
                            <strong>Name: </strong>
                        </label>
                        <span id="name">{data.name}</span>
                    </div>
                    <div>
                        <label for="phoneNumber">
                            <strong>Phone Number: </strong>
                        </label>
                        <span id="phoneNumber">{data.phoneNumber}</span>
                    </div>
                    <div>
                        <label for="vehicleNumber">
                            <strong>Vehicle Number: </strong>
                        </label>
                        <span id="vehicleNumber">{data.vehicleNumber}</span>
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