import { FaRegEdit } from "react-icons/fa";
import { useState } from "react";

const AdminRestaurant = () => {
    const [delivery, setDelivery] = useState(false);

    return (
        <div className="admin-restaurant-container">
            <div className="header category-title-add">
                <h1>Restaurant</h1>
                <button
                >
                    <FaRegEdit />
                </button>
            </div>
            <div className="restaurant-data">
                <div className="resta-image-details">
                    <div className={`restaurant-page-image ${delivery ? 'delivery-on-img' : ''}`}>
                        <img
                            src="https://corporate.mcdonalds.com/content/dam/sites/corp/nfl/newsroom/Grimace%20Meal%20and%20Shake-sized.png"
                            alt="Restaurant Image"
                        />
                    </div>
                    <div className="restaurant-details">
                        <div>
                            <h3><strong id="name">McDonald's</strong></h3>
                        </div>
                        <div>
                            <span id="name">National pizza restaurant</span>
                        </div>
                        <div>
                            <span id="name">Non-veg</span>
                        </div>
                        <div>
                            <span id="name">No offers were added</span>
                        </div>
                        <div>
                            <span id="name">307, Anna nagar, Madurai - 09</span>
                        </div>
                        <div className={`delivery-on-off ${delivery ? 'delivery-on' : ''}`}>
                            <label htmlFor="switch3">Delivery</label>
                            <div className="allowdelivery-switch" >
                                <input
                                    checked={delivery}
                                    className="switch-toggle3"
                                    type="checkbox"
                                    id="switch3"
                                    onChange={() => setDelivery(!delivery)}
                                />
                                <label className="allowdelivery-lable" htmlFor="switch3"></label>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="resta-full-description">
                    <label htmlFor="full-description">Full description: </label>
                    <p id="full-description">Pizza Hut, LLC is an American multinational pizza restaurant chain and international franchise founded in 1958 in Wichita, Kansas by Dan and Frank Carney.</p>
                </div>
            </div>
        </div>
    )
}

export default AdminRestaurant;