import React, { createContext, useContext, useEffect, useState } from "react";
import toast from 'react-hot-toast';
import axios from "axios"
const FoodAppContext = createContext();
const baseUrl = import.meta.env.VITE_BASE_URL
import { confirmAlert } from 'react-confirm-alert';
import 'react-confirm-alert/src/react-confirm-alert.css';
import { useNavigate } from "react-router-dom";
import notificationSound from "../assets/notification.mp3";
import { AuthContext } from "../context/protectedRoutes";

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
    const [animateBell, setAnimateBell] = useState(false);
    const [mainBlurred, setMainBlurred] = useState(false);
    const [orderList, setOrderList] = useState([])
    const { adminType } = useContext(AuthContext)

    useEffect(() => {
        const ws = new WebSocket('ws://localhost:8080');
        ws.onopen = () => {
            console.log('connected to web socker server');
        }
        ws.onmessage = (e) => {
            const message = JSON.parse(e.data);
            console.log('message:', message);
            if (message.type === 'newOrder') {
                if (adminType === 'shop-admin') {
                    playNotificationSound();
                }
                setSuccessToast('An Order Received')
                setAnimateBell(true);
                setOrders((prev) => [...prev, message.data])
            } else if (message.type === 'orderConirmed') {
                setOrders((prev) =>
                    prev.map(order =>
                        order._id === message.data._id ? message.data : order
                    )
                )
            } else if (message.type === 'newRestaurant') {
                if (adminType === 'admin') {
                    playNotificationSound();
                }
                console.log('new restaurant');
                setAnimateBell(true);
                setNewRestaurants((prev) => [...prev, message.data])
            }
        }

        ws.onerror = (error) => {
            console.error('WebSocket error:', error);
        };

        ws.onclose = () => {
            console.log('WebSocket connection closed');
        };

        return () => ws.close()
    }, [])

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

    const handleAddRestaurant = async (
        address,
        city,
        restaurantName,
        image,
        offer,
        veg,
        description,
        fullDescription,
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
            formData.append('image', image)

            const { data } = await axios.post(`${baseUrl}/admin-actions/add-restaurant`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            if (data.status === '1') {
                setSuccessToast('Restaurant added!')
                console.log('data:', data);
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

            if (data.status === '1') {
                setSuccessToast('Restaurant updated!')
                return data;
            }
            setErrorToast(data.message)
        } catch (error) {
            console.error(error);
        }
    }

    const getAllRestaurants = async () => {
        setIsLoading(true);
        const { data } = await axios.get(`${baseUrl}/admin-actions/get-all-restaurants`);
        setIsLoading(false);
        return data;
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
                        setRestaurants(getAllRes.restaurants)
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
            formData.append('offer', inputValues.offer || null);
            formData.append('price', inputValues.price);
            formData.append('address', inputValues.address);
            formData.append('veg', veg);
            formData.append('restaurantId', restaurantId);
            formData.append('image', imageFile1);

            const { data } = await axios.post(`${baseUrl}/admin-actions/add-menu-items`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            })

            if (data.status === '1') {
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

    const handleMenuItemEdit = async (values, image, veg) => {
        try {

            const formData = new FormData();
            formData.append("itemName", values.itemName)
            formData.append("description", values.description)
            formData.append("fullDescription", values.fullDescription)
            formData.append("price", values.price)
            formData.append("offer", values.offer || null)
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

            if (data.status === '1') {
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
        fullDescription
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
            const getBase = await getBase64(URL.createObjectURL(image))
            formData.append("image", getBase)

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
                setOrderList

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