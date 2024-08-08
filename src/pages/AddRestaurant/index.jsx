import { useEffect, useState } from "react";
import { useFoodApp } from "../../hooks/appProvider";
import { IoCloseCircleOutline } from "react-icons/io5";
import axios from "axios";
import { AddRestaurantValidation, RestaurantImgValidation } from "../../schema";
import * as Yup from "yup"
import { useNavigate } from "react-router-dom";
import AddEditMenu from "../../components/addEditMenu";

const AddRestaurant = ({ editPage }) => {
    const navigate = useNavigate();
    const [imagePreview, setImagePreview] = useState(null);
    const [imageFile1, setImageFile] = useState(null);
    const {
        setErrorToast,
        handleAddRestaurant,
        handleEditRestaurant,
        getEditRestaurantDetails,
        confirmAlert
    } = useFoodApp();
    const [address, setAddress] = useState('');
    const [city, setCity] = useState('');
    const [restaurantName, setRestaurantName] = useState('');
    const [veg, setVeg] = useState(false);
    const [offer, setOffer] = useState('');
    const [description, setDescription] = useState('');
    const [fullDescription, setFullDescription] = useState('');
    const [openMenuAddComp, setOpenMenuAddComp] = useState(false);
    const [openMenuEditComp, setOpenMenuEditComp] = useState(false);
    const [menuItemRestaurantId, setMenuItemRestaurantId] = useState('');

    const [errors, setErrors] = useState({});

    useEffect(() => {
        if (editPage) {
            async function getEditRestaurant() {
                const restaurantId = sessionStorage.getItem('edit-id')
                const getEditingResDetails = await getEditRestaurantDetails(restaurantId);
                setAddress(getEditingResDetails.restaurantData.address)
                setCity(getEditingResDetails.restaurantData.city)
                setFullDescription(getEditingResDetails.restaurantData.fullDescription);
                setDescription(getEditingResDetails.restaurantData.description);
                setOffer(getEditingResDetails.restaurantData.offer);
                setVeg(getEditingResDetails.restaurantData.veg)
                setRestaurantName(getEditingResDetails.restaurantData.restaurantName)
                setImagePreview(getEditingResDetails.restaurantData.image)
                setImageFile(getEditingResDetails.restaurantData.image)
            }
            getEditRestaurant();
        }
    }, [])

    const handleValidation = async (e) => {
        const { name, value } = e.target;
        console.log(name, value);
        try {
            const validateData = Yup.object().shape({
                [name]: AddRestaurantValidation.fields[name],
            })
            await validateData.validate({ [name]: value });
            setErrors((prevErrors) => ({ ...prevErrors, [name]: '' }));
        } catch (error) {
            console.log('error:', error.message);
            setErrors((prevErrors) => ({ ...prevErrors, [name]: error.message }));
        }
    }

    const handleFileChange = async (e) => {
        try {
            const imageFile = e.target.files[0]
            await RestaurantImgValidation.validate(imageFile);
            setImageFile(imageFile)
            setImagePreview(URL.createObjectURL(imageFile))
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

    const handleDragOver = (e) => {
        e.preventDefault();
    }

    useEffect(() => {
        window.addEventListener("beforeunload", (e) => e.preventDefault());
    }, [])

    const handleSubmit = async () => {
        try {
            await AddRestaurantValidation.validate({
                address,
                city,
                restaurantName,
                description,
                fullDescription
            },
                { abortEarly: false }
            )

            const base64Regex = /^data:image\/(png|jpeg|jpg|gif|bmp|webp);base64,([A-Za-z0-9+/=]+)$/;
            if (!base64Regex.test(imageFile1) && !editPage) {
                await RestaurantImgValidation.validate(imageFile1);
            }

            const response = await (editPage
                ? handleEditRestaurant(
                    address,
                    city,
                    restaurantName,
                    imageFile1,
                    offer,
                    veg,
                    description,
                    fullDescription,
                    sessionStorage.getItem('edit-id')
                )
                : handleAddRestaurant(
                    address,
                    city,
                    restaurantName,
                    imageFile1,
                    offer,
                    veg,
                    description,
                    fullDescription,
                    sessionStorage.getItem('edit-id')
                ))

            if (!editPage) {
                confirmAlert({
                    title: "Confirm to Add!",
                    message: "Want to add menu items to this restaurant?",
                    buttons: [
                        {
                            label: "Add",
                            onClick: () => {
                                setMenuItemRestaurantId(response.restaurant._id)
                                setOpenMenuAddComp(true)
                                return
                            }
                        },
                        {
                            label: "Not Now",
                            onClick: () => { return }
                        }
                    ]
                });
            }

            setAddress('')
            setCity('')
            setRestaurantName('')
            setOffer('')
            setVeg(false)
            setDescription('')
            setFullDescription('')
            setImagePreview(null)
            setImageFile(null)
            setErrors({})
        } catch (validationErrors) {
            if (validationErrors instanceof Yup.ValidationError) {
                const formattedErrors = validationErrors.inner.reduce((acc, error) => {
                    return { ...acc, [error.path]: error.message };
                }, {});
                console.log('formattedErrors:', formattedErrors);
                if (!imageFile1) formattedErrors.image = 'Restaurant image is required'
                setErrors(formattedErrors);
            } else {
                console.log('error:', validationErrors);
                setErrorToast('Please enter all the fields');
            }
        }
    }

    const handleCancelSubmit = () => {
        sessionStorage.setItem('edit-id', null)
        navigate('/')
    }

    return (
        <>
            <AddEditMenu
                restaurantId={menuItemRestaurantId}
                openMenuAddComp={openMenuAddComp}
                setOpenMenuAddComp={setOpenMenuAddComp}
                openMenuEditComp={openMenuEditComp}
                setOpenMenuEditComp={setOpenMenuEditComp}
                handleValidation={handleValidation}
                setErrors={setErrors}
                errors={errors}
            />
            {!openMenuAddComp && !openMenuEditComp && (
                <div className={`add-restaurant-container`}>
                    <div className="add-res-title">
                        <h1>{`${editPage ? 'Edit' : 'Add'} Restaurant`}</h1>
                    </div>
                    <div className="resname-resimg">
                        <div>
                            <input
                                value={restaurantName}
                                type="text"
                                name="restaurantName"
                                placeholder="restaurant name *"
                                onChange={(e) => {
                                    setRestaurantName(e.target.value)
                                    handleValidation(e)
                                }}
                            />
                            {
                                errors.restaurantName && <p className="add-res-error1">{errors.restaurantName}</p>
                            }
                        </div>
                        <div>
                            <input
                                value={fullDescription}
                                type="text"
                                name="fullDescription"
                                placeholder="full description *"
                                onChange={(e) => {
                                    setFullDescription(e.target.value)
                                    handleValidation(e)
                                }}
                            />
                            {
                                errors.fullDescription && <p className="add-res-error1">{errors.fullDescription}</p>
                            }
                        </div>
                        <div>
                            <input
                                value={description}
                                type="text"
                                name="description"
                                placeholder="description *"
                                onChange={(e) => {
                                    setDescription(e.target.value)
                                    handleValidation(e)
                                }}
                            />
                            {
                                errors.description && <p className="add-res-error1">{errors.description}</p>
                            }
                        </div>
                        <div
                            onDrop={handleDrop}
                            onDragOver={handleDragOver}
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
                                            className="image-upload"
                                            type="file"
                                            name="image"
                                            accept=".jpg, .jpeg, .png"
                                            onChange={handleFileChange}
                                        />
                                        Browse Files
                                    </label>
                                    {
                                        errors.image && <p className="add-res-error">{errors.image}</p>
                                    }
                                </>
                            )}
                        </div>
                        <div className="veg-checkbox">
                            <label htmlFor="veg">Veg</label>
                            <input
                                value={veg}
                                checked={veg}
                                type="checkbox"
                                name="veg"
                                id="veg"
                                placeholder="veg"
                                className="res-veg"
                                onChange={(e) => {
                                    setVeg(e.target.checked)
                                    handleValidation(e)
                                }}
                            />
                        </div>
                        <div>
                            <input
                                value={offer}
                                type="text"
                                name="offer"
                                placeholder="offer"
                                className="res-offer"
                                onChange={(e) => {
                                    setOffer(e.target.value)
                                }}
                            />
                        </div>
                        <div>
                            <input
                                value={address}
                                type="text"
                                name="address"
                                placeholder="address *"
                                className="res-address"
                                onChange={(e) => {
                                    setAddress(e.target.value)
                                    handleValidation(e)
                                }}
                            />
                            {
                                errors.address && <p className="add-res-error2">{errors.address}</p>
                            }
                        </div>
                        <div>
                            <input
                                value={city}
                                type="text"
                                placeholder="city *"
                                name="city"
                                className="res-city"
                                onChange={(e) => {
                                    setCity(e.target.value)
                                    handleValidation(e)
                                }}
                            />
                            {
                                errors.city && <p className="add-res-error3">{errors.city}</p>
                            }
                        </div>
                        {editPage && (
                            <div className="add-menu">
                                <button onClick={() => {
                                    setMenuItemRestaurantId(sessionStorage.getItem('edit-id'))
                                    setOpenMenuAddComp(true)
                                }}>
                                    Add Menu Items
                                </button>
                                <br />
                                <br />
                                <button onClick={() => {
                                    setMenuItemRestaurantId(sessionStorage.getItem('edit-id'))
                                    setOpenMenuEditComp(true);
                                }}>
                                    Edit Menu Items
                                </button>
                            </div>
                        )}
                    </div>
                    <div className="add-res-btn">
                        <button
                            className="add-restaurant-submit"
                            onClick={handleSubmit}
                        >
                            {`${editPage ? 'Update' : 'Add'} Restaurant`}
                        </button>
                        <button
                            className="cancel-restaurant-submit"
                            onClick={handleCancelSubmit}
                        >
                            Cancel
                        </button>
                    </div>
                </div >
            )}
        </>
    )
}

export default AddRestaurant;