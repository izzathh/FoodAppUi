import { FaRegEdit } from "react-icons/fa";
import { RiDeleteBin5Line } from "react-icons/ri";
import { IoMdAdd } from "react-icons/io";
import { useContext, useEffect, useState } from "react";
const baseUrl = import.meta.env.VITE_BASE_URL
import { AuthContext } from "../../context/protectedRoutes";
import axios from "axios"
import { useFoodApp } from "../../hooks/appProvider";
const Dishes = () => {
    const { adminRestaurantId } = useContext(AuthContext);
    const {
        dishes,
        setDishes
    } = useFoodApp();

    useEffect(() => {
        const getRestaurantDishes = async () => {
            try {
                const { data } = await axios
                    .get(`${baseUrl}/admin-actions/get-restaurant-dishes?restaurantId=${adminRestaurantId}`)
                if (data.status === 1 && data.dishes.menu.length !== 0) {
                    setDishes(data.dishes.menu)
                }
            } catch (error) {
                console.error('error fetching dishes', error);
            }
        }
        if (dishes.length === 0) getRestaurantDishes()
    }, [dishes])

    return (
        <div className="categories-container categories-container-dishes">
            <div className="category-title-add">
                <h1>Dishes</h1>
                <button><IoMdAdd /></button>
            </div>
            <div className="category-table">
                <table>
                    <thead>
                        <tr>
                            <th>Id</th>
                            <th>Dish</th>
                            <th>Category</th>
                            <th>Sub Category</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {dishes.map((dish, index) => (
                            <tr key={index}>
                                <td>{dish.id}</td>
                                <td>{dish.itemName}</td>
                                <td>{dish.category || ''}</td>
                                <td>{dish.subCategory || ''}</td>
                                <td className="category-edit-delete">
                                    <button className="category-edit"><FaRegEdit /></button>
                                    <button className="category-delete"><RiDeleteBin5Line /></button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    )
}

export default Dishes;