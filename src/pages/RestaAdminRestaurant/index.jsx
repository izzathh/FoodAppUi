import { useState } from "react";

const AdminRestaurant = () => {
    const [delivery, setDelivery] = useState(false);

    return (
        <div className="admin-restaurant-container">
            <div>
                <h1>Restaurant</h1>
            </div>
            <div className="restaurant-data">
                <div className="resta-image-details">
                    <div className={`restaurant-page-image ${delivery ? 'delivery-on-img' : ''}`}>
                        <img
                            src="https://media-assets.swiggy.com/swiggy/image/upload/fl_lossy,f_auto,q_auto,w_660/2b4f62d606d1b2bfba9ba9e5386fabb7"
                            alt="Restaurant Image"
                        />
                    </div>
                    <div className="restaurant-details">
                        <div>
                            <label htmlFor="name">Name: </label>
                            <span id="name">Domino's Pizza</span>
                        </div>
                        <div>
                            <label htmlFor="name">Veg: </label>
                            <span id="name">No</span>
                        </div>
                        <div>
                            <label htmlFor="name">Offer: </label>
                            <span id="name">No offers were added</span>
                        </div>
                        <div>
                            <label htmlFor="name">Address: </label>
                            <span id="name">307, Anna nagar, Madurai - 09</span>
                        </div>
                        <div>
                            <label htmlFor="name">Description: </label>
                            <span id="name">National pizza restaurant</span>
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