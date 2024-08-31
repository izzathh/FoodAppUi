import React, { createContext, useContext, useEffect, useState } from "react";
import toast from 'react-hot-toast';
import axios from "axios"
const FoodAppContext = createContext();
const baseUrl = import.meta.env.VITE_BASE_URL
const webSocUrl = import.meta.env.VITE_WEB_SOCKET_URL
import { confirmAlert } from 'react-confirm-alert';
import 'react-confirm-alert/src/react-confirm-alert.css';
import { useNavigate } from "react-router-dom";
import notificationSound from "../assets/notification.mp3";
import { AuthContext } from "../context/protectedRoutes";
import moment from "moment";
import Cookies from 'js-cookie';

export const FoodAppProvider = ({ children }) => {
    const navigate = useNavigate();
    const [closeMenu, setCloseMenu] = useState(false);
    const [errorToast, setErrorToast] = useState('');
    const [successToast, setSuccessToast] = useState('');
    const [openProfileSettings, setOpenProfileSettings] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [restaurants, setRestaurants] = useState([]);
    const [openNotifications, setOpenNotifications] = useState(false);
    const [orders, setOrders] = useState([]);
    const [newRestaurants, setNewRestaurants] = useState([]);
    const [newDeliveryPeople, setNewDeliveryPeople] = useState([]);
    const [animateBell, setAnimateBell] = useState(false);
    const [mainBlurred, setMainBlurred] = useState(false);
    const [orderList, setOrderList] = useState([])
    const [dishes, setDishes] = useState([]);
    const [categories, setCategories] = useState([]);
    const [subCategories, setSubCategories] = useState([]);
    const [loadingNotification, setLoadingNotification] = useState(false);

    const { adminType, adminId, adminRestaurantId } = useContext(AuthContext);

    const client = axios.create({ baseURL: baseUrl })

    const IsValidJson = (data) => {
        try {
            JSON.parse(data)
        } catch (error) {
            return false
        }
        return true
    }

    const getMinAgo = (orderTime) => {
        const currentTime = moment();
        const diff = currentTime.diff(orderTime)
        const timeDur = moment.duration(diff)

        if (timeDur.days() !== 0)
            return `${timeDur.days()} day${timeDur.days() > 1 ? 's' : ''} ago`

        if (timeDur.hours() !== 0) {
            return `${timeDur.hours()} hour${timeDur.hours() > 1 ? 's' : ''} ago`;
        }

        if (timeDur.minutes() !== 0) {
            return `${timeDur.minutes()} min${timeDur.minutes() > 1 ? 's' : ''} ago`;
        }

        return 'just now'
    }

    useEffect(() => {
        let ws;
        const connectWebSocket = () => {
            ws = new WebSocket(webSocUrl);

            ws.onopen = () => {
                console.log('connected to web socker server');
            }

            ws.onmessage = (e) => {
                const message = IsValidJson(e.data) ? JSON.parse(e.data) : e.data;
                console.log('msg --->', message);
                if (
                    message.type === 'newOrder'
                    && adminType === 'shop-admin'
                    && message.data.restaurantId === adminRestaurantId
                ) {
                    playNotificationSound();
                    setSuccessToast('An Order Received')
                    setAnimateBell(true);
                    setOrders((prev) => [message.data, ...prev])
                } else if (message.type === 'orderConirmed') {
                    setOrders((prev) =>
                        prev.map(order =>
                            order._id === message.data._id ? message.data : order
                        )
                    )
                } else if (
                    message.type === 'newRestaurant'
                    && adminType === 'admin'
                    && message.data.restaurantId === adminRestaurantId
                ) {
                    playNotificationSound();
                    setAnimateBell(true);
                    message.data.registeredAt = getMinAgo(message.data.registeredAt)
                    setNewRestaurants((prev) => [message.data, ...prev])
                } else if (message.type === 'newDeliveryPeople' && adminType === 'admin') {
                    playNotificationSound();
                    setAnimateBell(true);
                    setNewDeliveryPeople((prev) => [message.application, ...prev])
                }
            }

            ws.onerror = (error) => {
                console.error('WebSocket error:', error);
            };

            ws.onclose = () => {
                console.log('WebSocket connection closed. Reconnecting...');
                setTimeout(connectWebSocket, 0)
            };
        }

        setTimeout(connectWebSocket, 0)

        return () => { if (ws) ws.close() }
    }, [adminType])

    useEffect(() => {
        if (errorToast !== '') {
            toast.error(errorToast)
            setErrorToast('')
        }
    }, [errorToast])

    useEffect(() => {
        if (successToast !== '') {
            toast.success(successToast)
            setSuccessToast('')
        }
    }, [successToast])

    useEffect(() => {
        if (adminType === 'shop-admin' && orders.length === 0) {
            setLoadingNotification(true);
            const getPendingOrders = async () => {
                const { data } = await axios.get(`${baseUrl}/admin-actions/get-pending-orders?id=${adminRestaurantId}`);
                if (data.orders.length !== 0) setOrders(data.orders);
            }
            getPendingOrders();
            setLoadingNotification(false);
        } else if (adminType === 'admin' && newRestaurants.length === 0) {
            setLoadingNotification(true);
            const getRestaurantRequests = async () => {
                const { data } = await axios
                    .get(`${baseUrl}/admin-actions/get-restaurant-requests?admin=1&restaurantId=none`);
                if (data.status === 1 && data.restaurants.length !== 0) {
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
    }, [adminType, orders])

    const handleAddRestaurant = async (
        address,
        city,
        restaurantName,
        image,
        offer,
        veg,
        description,
        fullDescription,
        locationValue,
        id
    ) => {
        try {

            const formData = new FormData();
            formData.append('address', address)
            formData.append('city', city)
            formData.append('restaurantName', restaurantName)
            formData.append('offer', offer)
            formData.append('veg', veg)
            formData.append('description', description)
            formData.append('fullDescription', fullDescription)
            formData.append('coordinates', locationValue)
            formData.append('image', image)

            const { data } = await axios.post(`${baseUrl}/admin-actions/add-restaurant`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            if (data.status === 1) {
                setSuccessToast('Restaurant added!')
                return data;
            }
            setErrorToast(data.message)
        } catch (error) {
            console.error('error:', error);
        }
    }

    async function getBase64(imageFile) {
        const response = await axios({
            url: imageFile,
            method: 'GET',
            responseType: 'arraybuffer'
        })
        const base65Img = bufferToBase64(response.data)
        return 'data:image/png;base64,' + base65Img;
    }

    function bufferToBase64(buffer) {
        let binary = ''
        const uInt8 = new Uint8Array(buffer);
        const lenght = uInt8.byteLength
        for (let i = 0; i < lenght; i++) {
            binary += String.fromCharCode(uInt8[i])
        }
        return btoa(binary)
    }

    const handleEditRestaurant = async (
        address,
        city,
        restaurantName,
        image,
        offer,
        veg,
        description,
        fullDescription,
        locationValue,
        id
    ) => {
        try {
            const formData = new FormData();
            formData.append('address', address)
            formData.append('id', id)
            formData.append('city', city)
            formData.append('restaurantName', restaurantName)
            formData.append('offer', offer)
            formData.append('veg', veg)
            formData.append('description', description)
            formData.append('fullDescription', fullDescription)
            formData.append('coordinates', locationValue)
            const base64Regex = /^data:image\/(png|jpeg|jpg|gif|bmp|webp);base64,([A-Za-z0-9+/=]+)$/;
            const imageData = !base64Regex.test(image)
                ? await getBase64(URL.createObjectURL(image))
                : image
            formData.append('image', imageData)

            const { data } = await axios.post(`${baseUrl}/admin-actions/edit-restaurant`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            })

            if (data.status === 1) {
                setSuccessToast('Restaurant updated!')
                return data;
            }
            setErrorToast(data.message)
        } catch (error) {
            console.error(error);
        }
    }

    const getAllRestaurants = async () => {
        if (restaurants.length === 0) {
            setIsLoading(true);
            const { data } = await axios.get(`${baseUrl}/admin-actions/get-all-restaurants`);
            setRestaurants(data.data.restaurants);
            setIsLoading(false);
            return data;
        }
    }

    const getEditRestaurantDetails = async (restaurantId) => {
        setIsLoading(true);
        const { data } = await axios
            .get(`${baseUrl}/admin-actions/get-edit-restaurant-data?id=${restaurantId}`);
        setIsLoading(false);
        return data;
    }

    const handleResturantDelete = async (id) => {
        confirmAlert({
            title: "Confirm to delete!",
            message: "Are you sure to delete this restaurant?",
            buttons: [
                {
                    label: "Yes",
                    onClick: async () => {
                        const { data } = await axios
                            .delete(`${baseUrl}/admin-actions/delete-restaurant?id=${id}`)
                        const getAllRes = await getAllRestaurants();
                        setRestaurants(getAllRes.data.restaurants)
                        return data;
                    }
                },
                {
                    label: "No",
                    onClick: () => { return }
                }
            ]
        });
    }

    const adminLogout = async () => {
        try {
            await axios.post(`${baseUrl}/admin-actions/logout`)
            Cookies.remove('auth_token', { path: '/' });
            window.location.href = '/login'
        } catch (error) {
            console.error('error:', error);
        }
    }

    const handleAddMenuSubmission = async (another, restaurantId, inputValues, imageFile1, veg) => {
        try {
            const formData = new FormData();
            formData.append('itemName', inputValues.itemName);
            formData.append('description', inputValues.description);
            formData.append('fullDescription', inputValues.fullDescription);
            formData.append('offer', inputValues.offer || "");
            formData.append('price', inputValues.price);
            formData.append('address', inputValues.address);
            formData.append('category', inputValues.category);
            formData.append('subCategory', inputValues.subCategory);
            formData.append('veg', veg);
            formData.append('restaurantId', restaurantId);
            formData.append('image', imageFile1);

            const { data } = await axios.post(`${baseUrl}/admin-actions/add-menu-items`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            })

            if (data.status === 1) {
                setSuccessToast('Item added successfully!')
                if (another) {
                    return
                } else {
                    navigate('/');
                }
            } else {
                setErrorToast(data.message)
            }
        } catch (error) {
            console.error(error);
        }
    }

    const handleDeleteCategory = async (setIsSaving, id) => {
        try {
            setIsSaving(prev => ({ ...prev, deleteCat: true }))
            const { data } = await client.delete('admin-actions/delete-category', {
                data: {
                    categoryId: id,
                    restaurantId: adminRestaurantId
                }
            })
            if (data.status === 1) {
                setIsSaving(prev => ({ ...prev, deleteCat: false }))
                setCategories(prev =>
                    prev.filter(cat => cat._id !== id)
                )
                setSubCategories(prev =>
                    prev.filter(sub => sub.categoryId !== id)
                )
                setDishes(prev =>
                    prev.filter(dish => dish.categoryId !== id)
                )
                setSuccessToast(data.message)
            }
        } catch (error) {
            console.error(error);
            if (error.response && error.response.data)
                setErrorToast(error.response.data.message || error.response.data.error)
            else
                setErrorToast('Something went wrong')
        }
    }

    const handleAddDishesApi = async (form) => {
        try {
            form.append('restaurantId', adminRestaurantId)
            const { data } = await axios.post(`${baseUrl}/admin-actions/add-menu-items`, form, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            })
            return data
        } catch (error) {
            console.error(error);
            return Error
        }
    }

    const handleMenuItemEdit = async (values, image, veg) => {
        try {

            const formData = new FormData();
            formData.append("itemName", values.itemName)
            formData.append("description", values.description)
            formData.append("fullDescription", values.fullDescription)
            formData.append("price", values.price)
            formData.append("offer", values.offer || "")
            formData.append("menuId", values.menuId)
            formData.append("restaurantId", values.restaurantId)
            formData.append("veg", veg)
            const base64Regex = /^data:image\/(png|jpeg|jpg|gif|bmp|webp);base64,([A-Za-z0-9+/=]+)$/;
            const imageData = !base64Regex.test(image)
                ? await getBase64(URL.createObjectURL(image))
                : image
            formData.append('image', imageData)
            const { data } = await axios.post(`${baseUrl}/admin-actions/edit-menu-items`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            })

            if (data.status === 1) {
                setSuccessToast('Menu updated!')
                return data;
            }
            setErrorToast(data.message)
        } catch (error) {
            console.error('handleMenuItemEdit:', error);
        }
    }

    const handleMenuDelete = async (restaurantId, menuId) => {
        try {
            await axios
                .delete(`${baseUrl}/admin-actions/delete-menu-item`, {
                    data: {
                        restaurantId: restaurantId,
                        menuId: menuId
                    }
                })
            return true;
        } catch (error) {
            console.error(error);
            setErrorToast("Can't delete menu!")
        }
    }

    const handleRegisterRestaurant = async (
        email,
        password,
        username,
        address,
        city,
        restaurantName,
        image,
        offer,
        veg,
        description,
        fullDescription,
        location
    ) => {
        try {

            const formData = new FormData();
            formData.append("email", email)
            formData.append("password", password)
            formData.append("username", username)
            formData.append("address", address)
            formData.append("city", city)
            formData.append("restaurantName", restaurantName)
            formData.append("description", description)
            formData.append("fullDescription", fullDescription)
            formData.append("offer", offer || null)
            formData.append("veg", veg)
            // const getBase = await getBase64(URL.createObjectURL(image))
            formData.append("coordinates", location)
            formData.append("image", image)

            const { data } = await axios.post(`${baseUrl}/admin-actions/register-restaurant`, formData,
                {
                    headers: {
                        'Content-Type': 'multipart/form-data'
                    }
                }
            );

            if (data.status === 1) {
                setSuccessToast(data.message)
                return true
            }
            setErrorToast(data.message)
            return false
        } catch (error) {
            console.log('error:', error);
        }
    }

    const playNotificationSound = () => {
        console.log('audio gonna play');
        const audio = new Audio(notificationSound);
        audio.play();
    };

    const getAllCategory = async () => {
        try {
            const { data } = await axios
                .get(`${baseUrl}/admin-actions/get-all-categories/${adminRestaurantId}`)
            if (data.status === 1 && data.categories.length !== 0) {
                return data.categories
            }
            return []
        } catch (error) {
            console.error(error);
        }
    }

    const getAllSubCategory = async () => {
        try {
            const { data } = await axios
                .get(`${baseUrl}/admin-actions/get-all-subcategories/${adminRestaurantId}`)
            if (data.status === 1 && data.subcategories.length !== 0) {
                return data.subcategories
            }
            return []
        } catch (error) {
            console.error(error);
        }
    }

    const handleEditDishesApi = async (formData) => {
        try {
            formData.append('restaurantId', adminRestaurantId)
            const { data } = await axios.post(`${baseUrl}/admin-actions/edit-menu-items`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            })
            return data
        } catch (error) {
            console.error(error);
            return Error
        }
    }

    const updateCategory = async (id, updatedCategory, setIsSaving, setErrors, setOpenCategoryEditor) => {
        try {
            setIsSaving(prev => ({ ...prev, updateCat: true }))
            const { data } = await client.post('admin-actions/update-category', {
                categoryId: id,
                categoryName: updatedCategory
            })
            if (data.status === 1) {
                setIsSaving(prev => ({ ...prev, updateCat: false }))
                setCategories((prev) =>
                    prev.map(data => {
                        if (data._id === id) {
                            return { ...data, categoryName: updatedCategory };
                        }
                        return data
                    })
                )
                setSubCategories((prev) =>
                    prev.map(data => {
                        if (data.categoryId === id) {
                            return { ...data, categoryId: id, categoryName: updatedCategory }
                        }
                        return data
                    })
                )
                setDishes((prev) =>
                    prev.map(data => {
                        if (data.categoryId === id) {
                            return { ...data, categoryId: id, categoryName: updatedCategory }
                        }
                        return data
                    })
                )
                setErrors(prev => ({ ...prev, categoryUpdate: '' }))
                setOpenCategoryEditor(null);
                setSuccessToast(data.message)
            }
        } catch (error) {
            console.error(error);
            if (error.response && error.response.data)
                setErrorToast(error.response.data.message || error.response.data.error)
            else
                setErrorToast('Something went wrong')
        }
    }

    return (
        <FoodAppContext.Provider
            value={{
                closeMenu,
                setCloseMenu,
                errorToast,
                setErrorToast,
                successToast,
                setSuccessToast,
                openProfileSettings,
                handleAddRestaurant,
                getAllRestaurants,
                isLoading,
                getEditRestaurantDetails,
                handleEditRestaurant,
                handleResturantDelete,
                restaurants,
                setRestaurants,
                adminLogout,
                navigate,
                openNotifications,
                setOpenNotifications,
                setOpenProfileSettings,
                confirmAlert,
                handleAddMenuSubmission,
                handleMenuItemEdit,
                handleMenuDelete,
                orders,
                setOrders,
                animateBell,
                setAnimateBell,
                handleRegisterRestaurant,
                newRestaurants,
                setNewRestaurants,
                setMainBlurred,
                mainBlurred,
                orderList,
                setOrderList,
                newDeliveryPeople,
                setNewDeliveryPeople,
                getMinAgo,
                dishes,
                setDishes,
                categories,
                setCategories,
                client,
                subCategories,
                setSubCategories,
                getAllCategory,
                getAllSubCategory,
                handleAddDishesApi,
                handleEditDishesApi,
                getBase64,
                handleDeleteCategory,
                updateCategory,
                loadingNotification,
                setLoadingNotification
            }}
        >
            {children}
        </FoodAppContext.Provider>
    )
}

export const useFoodApp = () => {
    const context = useContext(FoodAppContext);
    if (!context) {
        throw new Error("useFoodApp must be used within a FoodAppProvider")
    }
    return context;
}