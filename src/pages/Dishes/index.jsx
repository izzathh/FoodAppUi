import { FaRegEdit } from "react-icons/fa";
import { RiDeleteBin5Line } from "react-icons/ri";
import { IoMdAdd } from "react-icons/io";
import { lazy, useContext, useEffect, useState, Suspense } from "react";
const baseUrl = import.meta.env.VITE_BASE_URL
import { AuthContext } from "../../context/protectedRoutes";
import { useFoodApp } from "../../hooks/appProvider";
const AddDishes = lazy(() => import('../../components/AddDishesForm'))
const EditDishDetails = lazy(() => import('../../components/EditDishesForm'))

const Dishes = () => {
    const [openDishesInput, setOpenDishesInput] = useState(false);
    const [openDishEditForm, setOpenDishEditForm] = useState(null);
    const [isSaving, setIsSaving] = useState({});

    const { adminRestaurantId } = useContext(AuthContext);
    const {
        dishes,
        setDishes,
        client,
        setSuccessToast,
        handleMenuDelete,
        setErrorToast,
        confirmAlert
    } = useFoodApp();

    useEffect(() => {
        const getRestaurantDishes = async () => {
            try {
                const { data } = await client
                    .get(`${baseUrl}/admin-actions/get-restaurant-dishes?restaurantId=${adminRestaurantId}`)
                if (data.status === 1 && data.dishes.length !== 0) {
                    setDishes(data.dishes)
                }
            } catch (error) {
                console.error('error fetching dishes', error);
            }
        }
        if (dishes.length === 0) getRestaurantDishes()
    }, [dishes])

    const handleMenuDeleteClick = async (menuId) => {
        try {
            confirmAlert({
                title: "Confirm to delete!",
                message: "Are you sure to delete this item?",
                buttons: [
                    {
                        label: "Yes",
                        onClick: async () => {
                            const data = await handleMenuDelete(adminRestaurantId, menuId);
                            console.log('data:', data);
                            if (data) {
                                setSuccessToast('Menu deleted!')
                                setDishes((prev) =>
                                    prev.filter(dish => dish.id !== menuId)
                                )
                                return
                            }
                        }
                    },
                    {
                        label: "No",
                        onClick: () => { return false }
                    }
                ]
            });

        } catch (error) {
            console.error(error);
            setErrorToast("Can't delete menu!")
        }
    }

    return (
        <div className="categories-container categories-container-dishes">
            {openDishesInput &&
                <Suspense>
                    <AddDishes
                        setOpenDishesInput={setOpenDishesInput}
                    />
                </Suspense>
            }
            {openDishEditForm &&
                <Suspense>
                    <EditDishDetails
                        existingData={openDishEditForm}
                        setOpenDishEditForm={setOpenDishEditForm}
                    />
                </Suspense>

            }
            {!openDishesInput && !openDishEditForm && (
                <>
                    <div className="category-title-add">
                        <h1>Dishes</h1>
                        <button onClick={() => setOpenDishesInput(true)} ><IoMdAdd /></button>
                        {(isSaving.deleteDish || isSaving.updateDish) && (
                            <div
                                style={{ marginLeft: '1em' }}
                                className="notification-loader category"
                            >
                            </div>
                        )}
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
                                        <td>{dish.categoryName || ''}</td>
                                        <td>{dish.subCategoryName || ''}</td>
                                        <td className="category-edit-delete">
                                            <button
                                                onClick={() => setOpenDishEditForm(dish)}
                                                className="category-edit"
                                            >
                                                <FaRegEdit />
                                            </button>
                                            <button
                                                onClick={() => handleMenuDeleteClick(dish.id)}
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

export default Dishes;