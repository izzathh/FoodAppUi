import { useContext, useEffect, useState } from "react";
import axios from "axios";
import { AuthContext } from "../../context/protectedRoutes";
const baseUrl = import.meta.env.VITE_BASE_URL
import { RiDeleteBin5Line } from "react-icons/ri";
import { IoExpandOutline } from "react-icons/io5";
import OrdersCard from "../../components/OrdersCard";
import { useFoodApp } from "../../hooks/appProvider";

const RestaurantOrders = () => {
    const {
        setMainBlurred,
        orderList,
        setOrderList,
        setErrorToast,
        setSuccessToast,
        confirmAlert
    } = useFoodApp();
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

    const confirmOrderDelete = (orderId) => {
        confirmAlert({
            title: "Confirm to delete!",
            message: "Are you sure to delete this order?",
            buttons: [
                {
                    label: "Yes",
                    onClick: async () => {
                        await deleteUserOrder(orderId);
                        return
                    }
                },
                {
                    label: "No",
                    onClick: () => { return }
                }
            ]
        });
    }

    const deleteUserOrder = async (orderId) => {
        try {
            isLoading(true)
            const { data } = await axios.delete(`${baseUrl}/admin-actions/delete-order`, {
                data: {
                    restaurantId: adminRestaurantId,
                    orderId
                }
            })
            isLoading(false)
            if (data.status === 1) {
                setSuccessToast(data.message)
                setOrderList((prev) =>
                    prev.filter(order => order.orderId !== orderId)
                )
                return
            }
            setErrorToast(data.message)
            return
        } catch (error) {
            console.error(error);
            isLoading(false)
        }
    }

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
            <>
                <div className="category-title-add">
                    <h1>Orders</h1>
                </div>
                <div className="category-table">
                    <table>
                        <thead>
                            <tr>
                                <th>Order Id</th>
                                <th>Status</th>
                                <th>Ordered At</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {orderList.map((order, index) => (
                                <tr key={index}>
                                    <td>{order.orderId}</td>
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
                                            onClick={async () => {
                                                confirmOrderDelete(order.orderId)
                                            }}
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
        </div>
    )
}

export default RestaurantOrders;