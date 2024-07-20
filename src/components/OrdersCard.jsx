import { IoCloseCircleOutline } from "react-icons/io5";

const OrdersCard = ({
    itemData,
    setMainBlurred,
    openOrderedDishesCard,
    setOpenOrderedDishesCard
}) => {
    return (
        <div id="orders-card-container-id" className="orders-card-container">
            <div className="orderid-title-close">
                <div>
                    <span>{openOrderedDishesCard}</span>
                    <h2>Ordered Dishes</h2>
                </div>
                <div>
                    <button
                        onClick={() => {
                            setOpenOrderedDishesCard(null)
                            setMainBlurred(false)
                        }}
                    >
                        <IoCloseCircleOutline />
                    </button>
                </div>
            </div>
            <hr />
            <div className="ordered-item-contents">
                {itemData?.menu.map((item, index) => (
                    <div key={index} className="ordered-item">
                        <div>
                            <img src={item.image} alt="" />
                        </div>
                        <div className="item-details">
                            <div>
                                <label htmlFor="item-name"><strong>ID: </strong></label>
                                <span id="item-name">{item.id}</span>
                            </div>
                            <div>
                                <label htmlFor="item-name"><strong>Item Name: </strong></label>
                                <span id="item-name">{item.itemName}</span>
                            </div>
                            <div>
                                <label htmlFor="price"><strong>Price: </strong></label>
                                <span id="price">{item.price}</span>
                            </div>
                            <div>
                                <label htmlFor="quantity"><strong>Quantity: </strong></label>
                                <span id="quantity">{item.quantity}</span>
                            </div>
                            <div>
                                <label htmlFor="quantity"><strong>Veg: </strong></label>
                                <span id="quantity">{item.veg == true ? 'Yes' : 'No'}</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
            <div className="sub-grand-total">
                <div>
                    <label htmlFor="subtotal"><strong>Sub total: </strong></label>
                    <span id="subtotal">{itemData.subtotal}</span>
                </div>
                <div>
                    <label htmlFor="grandtotal"><strong>Grand total: </strong></label>
                    <span id="grandtotal">{itemData.total}</span>
                </div>
            </div>
        </div>
    )
}

export default OrdersCard;