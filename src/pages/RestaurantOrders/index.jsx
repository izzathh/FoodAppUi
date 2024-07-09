import { useContext, useEffect, useState } from "react";
import axios from "axios";
import { AuthContext } from "../../context/protectedRoutes";
const baseUrl = import.meta.env.VITE_BASE_URL
import { RiDeleteBin5Line } from "react-icons/ri";
import { IoExpandOutline } from "react-icons/io5";
import OrdersCard from "../../components/OrdersCard";
import { useFoodApp } from "../../hooks/appProvider";
import Loader from "../../components/Loader";

const RestaurantOrders = () => {
    const { setMainBlurred, orderList, setOrderList } = useFoodApp();
    const { adminRestaurantId } = useContext(AuthContext);
    const [openOrderedDishesCard, setOpenOrderedDishesCard] = useState(null)
    const [orderMenu, setOrderMenu] = useState(null)
    const [loading, isLoading] = useState(false);

    useEffect(() => {
        const getOrderList = async () => {
            isLoading(true)
            const { data } = await axios
                .get(`${baseUrl}/admin-actions/get-restaurant-order-list?restaurantId=${adminRestaurantId}`)
            setOrderList(data.orders)
            isLoading(false)
        }
        if (orderList.length === 0) getOrderList();
    }, [])

    const handleOutsideClick = (e) => {
        const getMenuCard = document.getElementById('orders-card-container-id');
        if (getMenuCard && !getMenuCard.contains(e.target)) {
            setOpenOrderedDishesCard(null)
            setOrderMenu(null)
            setMainBlurred(false)
        }
    }

    useEffect(() => {
        document.addEventListener('mousedown', handleOutsideClick)
        return () => {
            document.removeEventListener('mousedown', handleOutsideClick)
        }
    }, [])

    return (
        <div className="categories-container orders-containder">
            {openOrderedDishesCard &&
                <OrdersCard
                    itemData={orderMenu}
                    openOrderedDishesCard={openOrderedDishesCard}
                    setOpenOrderedDishesCard={setOpenOrderedDishesCard}
                    setMainBlurred={setMainBlurred}
                />
            }
            {loading && <Loader />}
            {!loading && (
                <>
                    <div className="category-title-add">
                        <h1>Orders</h1>
                    </div>
                    <div className="category-table">
                        <table>
                            <thead>
                                <tr>
                                    <th>Order Id</th>
                                    <th>Category</th>
                                    <th>Sub Category</th>
                                    <th>Status</th>
                                    <th>Ordered At</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {orderList.map((order, index) => (
                                    <tr key={index}>
                                        <td>{order.orderId}</td>
                                        <td>Rice</td>
                                        <td>Briyani</td>
                                        <td>{order.status}</td>
                                        <td>{order.orderedAt}</td>
                                        <td className="category-edit-delete">
                                            <button
                                                onClick={() => {
                                                    setOpenOrderedDishesCard(order.orderId)
                                                    setOrderMenu(order)
                                                    setMainBlurred(true)
                                                }}
                                                className="category-edit"
                                            >
                                                <IoExpandOutline />
                                            </button>
                                            <button
                                                className="category-delete"
                                            >
                                                <RiDeleteBin5Line />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </>
            )}
        </div>
    )
}

export default RestaurantOrders;