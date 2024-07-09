import { useEffect, useState } from "react";
import { EditRestaurantValidation, RestaurantImgValidation, EditMenuValidation } from "../schema";
import { useFoodApp } from "../hooks/appProvider";
import { IoCloseCircleOutline } from "react-icons/io5";
import * as Yup from "yup"
import { FaRegEdit } from "react-icons/fa";
import { RiDeleteBin5Line } from "react-icons/ri";
import Loader from "./Loader";
import { MdOutlineEditOff } from "react-icons/md";
import { RiSaveLine } from "react-icons/ri";

const AddEditMenu = ({
    restaurantId,
    openMenuAddComp,
    openMenuEditComp,
    setOpenMenuAddComp,
    setOpenMenuEditComp,
    setErrors,
    errors
}) => {
    const [imagePreview, setImagePreview] = useState(null)
    const [imageFile1, setImageFile] = useState(null)
    const [veg, setVeg] = useState(false)
    const [inputValues, setInputValues] = useState({ offer: null })

    const [editImagePreview, setEditImagePreview] = useState(null)
    const [editImageFile1, setEditImageFile] = useState(null)
    const [editVeg, setEditVeg] = useState(false)
    const [editInputValues, setEditInputValues] = useState({ offer: null })

    const [menu, setMenu] = useState([])
    const [editMenu, setEditMenu] = useState(null)

    const {
        handleAddMenuSubmission,
        setErrorToast,
        getEditRestaurantDetails,
        isLoading,
        handleMenuItemEdit,
        handleMenuDelete,
        setSuccessToast,
        confirmAlert
    } = useFoodApp();

    async function getMenuItems() {
        const getEditingResDetails = await getEditRestaurantDetails(restaurantId);
        console.log('getEditingResDetails:', getEditingResDetails);
        setMenu(getEditingResDetails.restaurantData?.menu || []);
    }

    useEffect(() => {
        if (openMenuEditComp) {
            getMenuItems();
        }
    }, [openMenuEditComp])

    useEffect(() => {
        window.addEventListener("beforeunload", (e) => e.preventDefault());
    }, [])

    const handleMenuImageChange = async (e) => {
        try {
            const imageFile = e.target.files[0]
            await RestaurantImgValidation.validate(imageFile);
            setImageFile(imageFile)
            setImagePreview(URL.createObjectURL(imageFile))
        } catch (error) {
            setErrors((prevErrors) => ({ ...prevErrors, image: error.message }));
        }
    }

    const handleMenuEditImageChange = async (e) => {
        try {
            const imageFile = e.target.files[0]
            await RestaurantImgValidation.validate(imageFile);
            setEditImageFile(imageFile)
            setEditImagePreview(URL.createObjectURL(imageFile))
        } catch (error) {
            setErrors((prevErrors) => ({ ...prevErrors, image: error.message }));
        }
    }

    const handleDrop = async (e) => {
        try {
            e.preventDefault();
            const imageFile = e.dataTransfer.files[0];
            console.log('imageFile:', imageFile);
            await RestaurantImgValidation.validate(imageFile);
            setImageFile(imageFile)
            setImagePreview(URL.createObjectURL(imageFile))
        } catch (error) {
            console.log(error);
            setErrors((prevErrors) => ({ ...prevErrors, image: error.message }));
        }
    }

    const handleEditDrop = async (e) => {
        try {
            e.preventDefault();
            const imageFile = e.dataTransfer.files[0];
            console.log('imageFile:', imageFile);
            await RestaurantImgValidation.validate(imageFile);
            setEditImageFile(imageFile)
            setEditImagePreview(URL.createObjectURL(imageFile))
        } catch (error) {
            console.log(error);
            setErrors((prevErrors) => ({ ...prevErrors, image: error.message }));
        }
    }

    const handleDragOver = (e) => {
        e.preventDefault();
    }

    const handleValidation = async (e) => {
        const { name, value } = e.target;
        console.log(name, value);
        try {
            const validateData = Yup.object().shape({
                [name]: EditRestaurantValidation.fields[name],
            })
            await validateData.validate({ [name]: value });
            setErrors((prevErrors) => ({ ...prevErrors, [name]: '' }));
        } catch (error) {
            console.log('error:', error.message);
            setErrors((prevErrors) => ({ ...prevErrors, [name]: error.message }));
        }
    }

    const handleMenuValidation = async (e) => {
        const { name, value } = e.target;
        console.log(name, value);
        try {
            const validateData = Yup.object().shape({
                [name]: EditMenuValidation.fields[name],
            })
            await validateData.validate({ [name]: value });
            setErrors((prevErrors) => ({ ...prevErrors, [name]: '' }));
        } catch (error) {
            console.log('error:', error.message);
            setErrors((prevErrors) => ({ ...prevErrors, [name]: error.message }));
        }
    }

    const handleMenuSubmit = async (e) => {
        try {
            await EditRestaurantValidation.validate({
                address: inputValues?.address,
                itemName: inputValues?.itemName,
                description: inputValues?.description,
                fullDescription: inputValues?.fullDescription,
                price: inputValues?.price
            },
                { abortEarly: false }
            )

            const base64Regex = /^data:image\/(png|jpeg|jpg|gif|bmp|webp);base64,([A-Za-z0-9+/=]+)$/;
            if (!base64Regex.test(imageFile1)) {
                await RestaurantImgValidation.validate(imageFile1);
            }

            const addMenu = e.target.innerText == 'Add another'
            await handleAddMenuSubmission(addMenu, restaurantId, inputValues, imageFile1, veg)

            setImageFile(null);
            setVeg(false);
            setInputValues({});
            setImagePreview(null);
            setErrors({});
            setEditMenu(null)
        } catch (validationErrors) {
            if (validationErrors instanceof Yup.ValidationError) {
                const formattedErrors = validationErrors.inner.reduce((acc, error) => {
                    return { ...acc, [error.path]: error.message };
                }, {});
                console.log('formattedErrors:', formattedErrors);
                if (!imageFile1) formattedErrors.image = 'Item image is required'
                setErrors(formattedErrors);
            } else {
                console.log('error:', validationErrors);
                setErrorToast('Please enter all the fields');
            }
        }
    }

    const handleEditClick = (data, index) => {
        editMenu === index
            ? setEditMenu(null)
            : setEditMenu(index)
        setEditImagePreview(data.image)
        setEditImageFile(data.image)
        setEditVeg(data.veg == 'true')
        setEditInputValues((pre) => ({
            ...pre,
            itemName: data.itemName,
            description: data.description,
            fullDescription: data.fullDescription,
            price: data.price,
            offer: data.offer,
            menuId: data.id,
            restaurantId: restaurantId
        }))
    }

    const handleSaveEditChanges = async () => {
        try {
            await EditMenuValidation.validate({
                itemName: editInputValues?.itemName,
                description: editInputValues?.description,
                fullDescription: editInputValues?.fullDescription,
                price: editInputValues?.price
            },
                { abortEarly: false }
            )

            const base64Regex = /^data:image\/(png|jpeg|jpg|gif|bmp|webp);base64,([A-Za-z0-9+/=]+)$/;
            if (!base64Regex.test(editImageFile1)) {
                await RestaurantImgValidation.validate(editImageFile1);
            }

            await handleMenuItemEdit(editInputValues, editImageFile1, editVeg)

            setEditImageFile(null);
            setEditVeg(false);
            setEditInputValues({});
            setEditImagePreview(null);
            setErrors({});
            await getMenuItems();
            setEditMenu(null)

        } catch (validationErrors) {
            if (validationErrors instanceof Yup.ValidationError) {
                const formattedErrors = validationErrors.inner.reduce((acc, error) => {
                    return { ...acc, [error.path]: error.message };
                }, {});
                console.log('formattedErrors:', formattedErrors);
                if (!editImageFile1) formattedErrors.image = 'Item image is required'
                setErrors(formattedErrors);
            } else {
                console.log('error:', validationErrors);
                setErrorToast('Please enter all the fields');
            }
        }
    }

    const handleMenuDeleteClick = async (menuId) => {
        try {
            confirmAlert({
                title: "Confirm to delete!",
                message: "Are you sure to delete this item?",
                buttons: [
                    {
                        label: "Yes",
                        onClick: async () => {
                            const data = await handleMenuDelete(restaurantId, menuId);
                            console.log('data:', data);
                            if (data) {
                                setSuccessToast('Menu deleted!')
                                setEditImageFile(null);
                                setEditVeg(false);
                                setEditInputValues({});
                                setEditImagePreview(null);
                                setErrors({});
                                await getMenuItems();
                                setEditMenu(null)
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
        <div
            className={`${openMenuAddComp || openMenuEditComp ? 'add-edit-menu-container' : 'close-add-edit-menu-container'}`}

        >
            {openMenuAddComp && (
                <>
                    <div className="menu-page-head">
                        <h1> Add Menu Items</h1>
                    </div>
                    {isLoading && <Loader />}
                    <div className="add-edit-menu-fields">
                        <input
                            id="itemName"
                            type="text"
                            placeholder="item name"
                            name="itemName"
                            value={inputValues.itemName || ''}
                            onChange={(e) => {
                                handleValidation(e)
                                setInputValues(prev => ({ ...prev, itemName: e.target.value }))
                            }}
                        />
                        {
                            errors.itemName && <label for="itemName" className="error-label">{errors.itemName}</label>
                        }
                        <input
                            type="text"
                            id="description"
                            placeholder="description"
                            name="description"
                            value={inputValues.description || ''}
                            onChange={(e) => {
                                handleValidation(e)
                                setInputValues(prev => ({ ...prev, description: e.target.value }))
                            }}
                        />
                        {
                            errors.description &&
                            <label for="description" className="error-label">{errors.description}</label>
                        }
                        <input
                            id="fullDescription"
                            type="text"
                            placeholder="full description"
                            name="fullDescription"
                            value={inputValues.fullDescription || ''}
                            onChange={(e) => {
                                handleValidation(e)
                                setInputValues(prev => ({ ...prev, fullDescription: e.target.value }))
                            }}
                        />
                        {
                            errors.fullDescription &&
                            <label for="fullDescription" className="error-label">{errors.fullDescription}</label>
                        }
                        <div
                            onDragOver={handleDragOver}
                            onDrop={handleDrop}
                            className="res-image-uploader"
                        >
                            {imagePreview ? (
                                <>
                                    <button
                                        onClick={() => {
                                            setImagePreview(null)
                                            setImageFile(null)
                                        }}
                                    >
                                        <IoCloseCircleOutline />
                                    </button>
                                    <img src={imagePreview} className="restaurant-image" alt="image" />
                                </>
                            ) : (
                                <>
                                    <p>Drag and drop a image or</p>
                                    <label className="img-upload-btn">
                                        <input
                                            id="image"
                                            name="image"
                                            type="file"
                                            accept=".jpg, .jpeg, .png"
                                            className="image-upload"
                                            onChange={handleMenuImageChange}
                                        />
                                        Browse Files
                                    </label>
                                    {
                                        errors.image &&
                                        <label for="image" className="error-label">{errors.image}</label>
                                    }
                                </>
                            )}
                        </div>
                        <div className="veg-checkbox">
                            <label for="veg">Veg</label>
                            <input
                                type="checkbox"
                                name="veg"
                                id="veg"
                                placeholder="veg"
                                className="res-veg"
                                onChange={(e) => {
                                    setVeg(e.target.checked)
                                }}
                            />
                        </div>
                        <input
                            id="price"
                            value={inputValues.price || ''}
                            type="number"
                            name="price"
                            placeholder="price"
                            onChange={(e) => {
                                handleValidation(e)
                                setInputValues(prev => ({ ...prev, price: e.target.value }))
                            }}
                        />
                        {
                            errors.price &&
                            <label for="price" className="error-label">{errors.price}</label>
                        }
                        <input
                            value={inputValues.offer || ''}
                            type="text"
                            name="offer"
                            placeholder="offer"
                            onChange={(e) => {
                                handleValidation(e)
                                setInputValues(prev => ({ ...prev, offer: e.target.value }))
                            }}
                        />
                        <input
                            id="address"
                            value={inputValues.address || ''}
                            type="text"
                            name="address"
                            placeholder="address"
                            onChange={(e) => {
                                handleValidation(e)
                                setInputValues(prev => ({ ...prev, address: e.target.value }))
                            }}
                        />
                        {
                            errors.address &&
                            <label for="address" className="error-label">{errors.address}</label>
                        }
                    </div>
                    <div className="add-edit-menu-btns">
                        <button onClick={handleMenuSubmit}>Add item</button>
                        <button onClick={handleMenuSubmit}>Add another</button>
                        <button onClick={() => setOpenMenuAddComp(false)}>Cancel</button>
                    </div>
                </>)}
            {openMenuEditComp && (
                <>
                    <div className="menu-page-head">
                        <button onClick={() => {
                            setOpenMenuEditComp(false)
                            setEditMenu(null)
                        }}>back</button>
                        <h1> Edit Menu Items</h1>
                    </div>
                    <div className="category-table add-edit-menu-table">
                        <table>
                            <tr>
                                <th>Id</th>
                                <th>Item</th>
                                <th>Image</th>
                                <th>Description</th>
                                <th>Full Description</th>
                                <th>Price</th>
                                <th>Veg</th>
                                <th>Offer</th>
                                <th>Actions</th>
                            </tr>
                            {isLoading && <Loader />}
                            {menu?.map((data, index) => (
                                <tr key={index}>
                                    <td>{data.id}</td>
                                    <td>
                                        {editMenu === index ? (
                                            <>
                                                <input
                                                    id="itemName"
                                                    value={editInputValues.itemName}
                                                    type="text"
                                                    name="itemName"
                                                    placeholder="item name"
                                                    onChange={(e) => {
                                                        handleMenuValidation(e)
                                                        setEditInputValues(pre => ({ ...pre, itemName: e.target.value }))
                                                    }}
                                                />
                                                {
                                                    errors.itemName &&
                                                    <label for="itemName" className="error-label">{errors.itemName}</label>
                                                }
                                            </>
                                        ) : (
                                            <>
                                                {data.itemName}
                                            </>
                                        )}
                                    </td>
                                    <td>
                                        {editMenu === index ? (
                                            <div
                                                onDragOver={handleDragOver}
                                                onDrop={handleEditDrop}
                                                className="res-image-uploader menu-image-uploader"
                                            >
                                                {editImagePreview ? (
                                                    <>
                                                        <button
                                                            onClick={() => {
                                                                setEditImagePreview(null)
                                                                setEditImageFile(null)
                                                            }}
                                                        >
                                                            <IoCloseCircleOutline />
                                                        </button>
                                                        <img src={editImagePreview} className="restaurant-image" alt="image" />
                                                    </>
                                                ) : (
                                                    <>
                                                        <p>Drag and drop a image or</p>
                                                        <label className="img-upload-btn">
                                                            <input
                                                                id="image"
                                                                name="image"
                                                                type="file"
                                                                accept=".jpg, .jpeg, .png"
                                                                className="image-upload"
                                                                onChange={handleMenuEditImageChange}
                                                            />
                                                            Browse Files
                                                        </label>
                                                        {
                                                            errors.image &&
                                                            <label for="image" className="error-label">{errors.image}</label>
                                                        }
                                                    </>
                                                )}
                                            </div>
                                        ) : (
                                            <img src={data.image} alt="item image" />
                                        )}
                                    </td>
                                    <td>
                                        {editMenu === index ? (
                                            <>
                                                <input
                                                    id="description"
                                                    value={editInputValues.description}
                                                    type="input"
                                                    name="description"
                                                    placeholder="description"
                                                    onChange={(e) => {
                                                        handleMenuValidation(e)
                                                        setEditInputValues(pre => ({ ...pre, description: e.target.value }))
                                                    }}
                                                />
                                                {
                                                    errors.description &&
                                                    <label for="description" className="error-label">{errors.description}</label>
                                                }
                                            </>
                                        ) : (
                                            <>
                                                {data.description}
                                            </>
                                        )}
                                    </td>
                                    <td>
                                        {editMenu === index ? (
                                            <>
                                                <textarea
                                                    id="fullDescription"
                                                    value={editInputValues.fullDescription}
                                                    type="text"
                                                    name="fullDescription"
                                                    placeholder="full description"
                                                    onChange={(e) => {
                                                        handleMenuValidation(e)
                                                        setEditInputValues(pre => ({ ...pre, fullDescription: e.target.value }))
                                                    }}
                                                />
                                                {
                                                    errors.fullDescription &&
                                                    <label for="fullDescription" className="error-label">{errors.fullDescription}</label>
                                                }
                                            </>
                                        ) : (
                                            <>
                                                {data.fullDescription}
                                            </>
                                        )}
                                    </td>
                                    <td>
                                        {editMenu === index ? (
                                            <>
                                                <input
                                                    id="price"
                                                    value={editInputValues.price}
                                                    type="number"
                                                    name="price"
                                                    placeholder="price"
                                                    onChange={(e) => {
                                                        handleMenuValidation(e)
                                                        setEditInputValues((pre) => ({ ...pre, price: e.target.value }))
                                                    }}
                                                />
                                                {
                                                    errors.price &&
                                                    <label for="price" className="error-label">{errors.price}</label>
                                                }
                                            </>
                                        ) : (
                                            <>
                                                {data.price}
                                            </>
                                        )}
                                    </td>
                                    <td className="veg-check">
                                        {editMenu === index ? (
                                            <input
                                                onClick={(e) => {
                                                    setEditVeg(e.target.checked)
                                                }}
                                                checked={editVeg}
                                                id="veg"
                                                type="checkbox"
                                            />
                                        ) : (
                                            <input
                                                checked={data.veg == 'true'}
                                                disabled
                                                id="veg"
                                                type="checkbox"
                                            />
                                        )}
                                    </td>
                                    <td>
                                        {editMenu === index ? (
                                            <input
                                                id="offer"
                                                value={editInputValues.offer}
                                                type="input"
                                                name="offer"
                                                placeholder="offer"
                                                onChange={(e) => {
                                                    setEditInputValues((pre) => ({ ...pre, offer: e.target.value }))
                                                }}
                                            />
                                        ) : (
                                            <>
                                                {data.offer}
                                            </>
                                        )}
                                    </td>
                                    <td className="category-edit-delete menuitem-edit-delete">
                                        <button
                                            onClick={() => handleEditClick(data, index)}
                                            className={`${editMenu === index ? 'category-edit-close' : 'category-edit'}`}
                                        >
                                            {editMenu === index ? (
                                                <MdOutlineEditOff />
                                            ) : (
                                                <FaRegEdit />
                                            )}
                                        </button>
                                        <br />
                                        <br />
                                        <button
                                            onClick={() => handleMenuDeleteClick(data.id)}
                                            className="category-delete"
                                        >
                                            <RiDeleteBin5Line />
                                        </button>
                                        {editMenu === index && (
                                            <>
                                                <br />
                                                <br />
                                                <button
                                                    onClick={handleSaveEditChanges}
                                                    className="save-edited-changes"
                                                >
                                                    <RiSaveLine />
                                                </button>
                                            </>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </table>
                    </div>
                </>
            )
            }
        </div >
    )
}

export default AddEditMenu;