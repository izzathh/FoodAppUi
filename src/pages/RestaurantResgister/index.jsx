import { useEffect, useState } from "react";
import { useFoodApp } from "../../hooks/appProvider";
import { IoCloseCircleOutline } from "react-icons/io5";
import { RegisterRestaurantValidation, RestaurantImgValidation } from "../../schema";
import * as Yup from "yup"
import { IoFastFoodSharp } from "react-icons/io5";

const ResgisterRestaurant = () => {
    const [restaurantInputs, setRestaurantInputs] = useState({ offer: null });
    const [veg, setVeg] = useState(false);
    const [errors, setErrors] = useState({});
    const [imagePreview, setImagePreview] = useState(null);
    const [imageFile, setImageFile] = useState(null);
    const {
        setErrorToast,
        handleRegisterRestaurant
    } = useFoodApp();

    const handleValidation = async (e) => {
        const { name, value } = e.target;
        console.log(name, value);
        try {
            const validateData = Yup.object().shape({
                [name]: RegisterRestaurantValidation.fields[name],
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
            const image = e.target.files[0]
            await RestaurantImgValidation.validate(image);
            setImageFile(image)
            setImagePreview(URL.createObjectURL(image))
        } catch (error) {
            setErrors((prevErrors) => ({ ...prevErrors, image: error.message }));
        }
    }

    const handleDrop = async (e) => {
        try {
            e.preventDefault();
            const image = e.dataTransfer.files[0];
            await RestaurantImgValidation.validate(image);
            setImageFile(image)
            setImagePreview(URL.createObjectURL(image))
        } catch (error) {
            console.log(error);
            setErrors((prevErrors) => ({ ...prevErrors, image: error.message }));
        }
    }

    const handleDragOver = (e) => {
        e.preventDefault();
    }

    const handleSubmit = async () => {
        try {
            await RegisterRestaurantValidation.validate({
                email: restaurantInputs.email,
                password: restaurantInputs.password,
                username: restaurantInputs.username,
                address: restaurantInputs.address,
                city: restaurantInputs.city,
                restaurantName: restaurantInputs.restaurantName,
                description: restaurantInputs.description,
                fullDescription: restaurantInputs.fullDescription
            },
                { abortEarly: false }
            )

            const base64Regex = /^data:image\/(png|jpeg|jpg|gif|bmp|webp);base64,([A-Za-z0-9+/=]+)$/;
            if (!base64Regex.test(imageFile)) {
                await RestaurantImgValidation.validate(imageFile);
            }

            const response = await handleRegisterRestaurant(
                restaurantInputs.email,
                restaurantInputs.password,
                restaurantInputs.username,
                restaurantInputs.address,
                restaurantInputs.city,
                restaurantInputs.restaurantName,
                imageFile,
                restaurantInputs.offer,
                veg,
                restaurantInputs.description,
                restaurantInputs.fullDescription,
            )

            if (response) {
                setRestaurantInputs({})
                setVeg(false)
                setImagePreview(null)
                setImageFile(null)
                setErrors({})
            }

        } catch (validationErrors) {
            if (validationErrors instanceof Yup.ValidationError) {
                const formattedErrors = validationErrors.inner.reduce((acc, error) => {
                    return { ...acc, [error.path]: error.message };
                }, {});
                console.log('formattedErrors:', formattedErrors);
                if (!imageFile) formattedErrors.image = 'Restaurant image is required'
                setErrors(formattedErrors);
            } else {
                console.log('error:', validationErrors);
                setErrorToast('Please enter all the fields');
            }
        }
    }

    return (
        <div className="registration-container">
            <div className="register-restaurant-logo">
                <div>
                    <svg width="0" height="0">
                        <defs>
                            <linearGradient id="gradient1" x1="0%" y1="0%" x2="100%" y2="100%">
                                <stop offset="0%" style={{ stopColor: '#d444eb', stopOpacity: 1 }} />
                                <stop offset="100%" style={{ stopColor: '#73257f', stopOpacity: 1 }} />
                            </linearGradient>
                        </defs>
                    </svg>
                    <IoFastFoodSharp className="gradient-icon" style={{
                        fontSize: '3em',
                        fill: 'url(#gradient1)'
                    }} />
                    <h1>Food App</h1>
                    <span>Some description about the food app.</span>
                </div>
            </div>
            <div className={`restaurant-resgister-container`}>
                <div className="register add-res-title">
                    <h1>Register Restaurant</h1>
                </div>
                <div className="resname-resimg register-resname-resimg">
                    <div className="name-pass-container">
                        <div className="username-pass-email">
                            <div>
                                <input
                                    value={restaurantInputs.username || ''}
                                    type="text"
                                    name="username"
                                    placeholder="username *"
                                    onChange={(e) => {
                                        setRestaurantInputs((pre) => ({ ...pre, username: e.target.value }))
                                        handleValidation(e)
                                    }}
                                />
                                {
                                    errors.username && <p className="add-res-error1">{errors.username}</p>
                                }
                            </div>
                            <div>
                                <input
                                    value={restaurantInputs.email || ''}
                                    type="text"
                                    name="email"
                                    placeholder="email *"
                                    onChange={(e) => {
                                        setRestaurantInputs((pre) => ({ ...pre, email: e.target.value }))
                                        handleValidation(e)
                                    }}
                                />
                                {
                                    errors.email && <p className="add-res-error1">{errors.email}</p>
                                }
                            </div>
                            <div>
                                <input
                                    value={restaurantInputs.password || ''}
                                    type="password"
                                    name="password"
                                    placeholder="password *"
                                    onChange={(e) => {
                                        setRestaurantInputs((pre) => ({ ...pre, password: e.target.value }))
                                        handleValidation(e)
                                    }}
                                />
                                {
                                    errors.password && <p className="add-res-error1">{errors.password}</p>
                                }
                            </div>
                        </div>
                        <div className="resname-desc-fulldesc">
                            <div>
                                <input
                                    value={restaurantInputs.restaurantName || ''}
                                    type="text"
                                    name="restaurantName"
                                    placeholder="restaurant name *"
                                    onChange={(e) => {
                                        setRestaurantInputs((pre) => ({ ...pre, restaurantName: e.target.value }))
                                        handleValidation(e)
                                    }}
                                />
                                {
                                    errors.restaurantName && <p className="add-res-error1">{errors.restaurantName}</p>
                                }
                            </div>
                            <div>
                                <input
                                    value={restaurantInputs.fullDescription || ''}
                                    type="text"
                                    name="fullDescription"
                                    placeholder="full description *"
                                    onChange={(e) => {
                                        setRestaurantInputs((pre) => ({ ...pre, fullDescription: e.target.value }))
                                        handleValidation(e)
                                    }}
                                />
                                {
                                    errors.fullDescription && <p className="add-res-error1">{errors.fullDescription}</p>
                                }
                            </div>
                            <div>
                                <input
                                    value={restaurantInputs.description || ''}
                                    type="text"
                                    name="description"
                                    placeholder="description *"
                                    onChange={(e) => {
                                        setRestaurantInputs((pre) => ({ ...pre, description: e.target.value }))
                                        handleValidation(e)
                                    }}
                                />
                                {
                                    errors.description && <p className="add-res-error1">{errors.description}</p>
                                }
                            </div>
                        </div>
                    </div>
                    <div
                        onDrop={handleDrop}
                        onDragOver={handleDragOver}
                        className="res-image-uploader reg-res-image-uploader"
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
                    <div className="vegoffer-addresscity-cont">
                        <div className="veg-offer">
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
                                    value={restaurantInputs.offer || ''}
                                    type="text"
                                    name="offer"
                                    placeholder="offer"
                                    className="res-offer"
                                    onChange={(e) => {
                                        setRestaurantInputs((pre) => ({ ...pre, offer: e.target.value }))
                                    }}
                                />
                            </div>
                        </div>
                        <div className="address-city">
                            <div>
                                <input
                                    value={restaurantInputs.address || ''}
                                    type="text"
                                    name="address"
                                    placeholder="address *"
                                    className="res-address"
                                    onChange={(e) => {
                                        setRestaurantInputs((pre) => ({ ...pre, address: e.target.value }))
                                        handleValidation(e)
                                    }}
                                />
                                {
                                    errors.address && <p className="add-res-error2">{errors.address}</p>
                                }
                            </div>
                            <div>
                                <input
                                    value={restaurantInputs.city || ''}
                                    type="text"
                                    placeholder="city *"
                                    name="city"
                                    className="res-city"
                                    onChange={(e) => {
                                        setRestaurantInputs((pre) => ({ ...pre, city: e.target.value }))
                                        handleValidation(e)
                                    }}
                                />
                                {
                                    errors.city && <p className="add-res-error3">{errors.city}</p>
                                }
                            </div>
                        </div>
                    </div>
                </div>
                <div className="add-res-btn">
                    <button
                        className="add-restaurant-submit register-res-btn"
                        onClick={handleSubmit}
                    >
                        Request Registration
                    </button>
                </div>
            </div >
        </div>
    )
}

export default ResgisterRestaurant;