import { useEffect, useState } from "react";
import { useFoodApp } from "../../hooks/appProvider";
import { IoCloseCircleOutline } from "react-icons/io5";
import { AddRestaurantValidation, RestaurantImgValidation } from "../../schema";
import * as Yup from "yup"
import AddEditMenu from "../../components/addEditMenu";
import { FaMapLocationDot } from "react-icons/fa6";
import { Loader } from '@googlemaps/js-api-loader';

const AddRestaurant = ({ editPage }) => {
    const [imagePreview, setImagePreview] = useState(null);
    const [imageFile1, setImageFile] = useState(null);
    const {
        setErrorToast,
        handleAddRestaurant,
        handleEditRestaurant,
        getEditRestaurantDetails,
        confirmAlert,
        navigate
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
    const [restaurantLocation, setRestaurantLocation] = useState(null);
    const [locationValue, setLocationValue] = useState('');
    const [mapIns, setMapIns] = useState(null);
    const [markerIns, setMarkerIns] = useState(null);

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
                setLocationValue(getEditingResDetails.restaurantData.coordinates)
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
                fullDescription,
                location: locationValue
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
                    locationValue,
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
                    locationValue,
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
            navigate('/')
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

    const handleMapClick = (event) => {
        const latLng = {
            lat: event.latLng.lat(),
            lng: event.latLng.lng(),
        };
        setErrors((pre) => ({ ...pre, location: '' }))
        const locationVal = latLng.lat + ',' + latLng.lng
        setLocationValue(locationVal)
        setRestaurantLocation(latLng);
    };

    useEffect(() => {
        async function initMap() {
            try {
                const loader = new Loader({
                    apiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
                    version: "weekly",
                    libraries: ["places"],
                });
                loader.load().then(async (google) => {
                    const { Map } = await google.maps.importLibrary("maps");
                    const { AdvancedMarkerElement } = await google.maps.importLibrary("marker")

                    const currentZoom = mapIns ? mapIns.getZoom() : 15;

                    const mapOptions = {
                        zoom: currentZoom,
                        center: restaurantLocation || { lat: 0, lng: 0 },
                        mapId: 'restaurant'
                    };
                    let map
                    if (!mapIns) {
                        map = new Map(document.getElementById("map"), mapOptions)
                        map.addListener('click', handleMapClick)
                        setMapIns(map)
                    } else {
                        map = mapIns;
                        map.setCenter(restaurantLocation || { lat: 0, lng: 0 });
                    }

                    if (markerIns) {
                        markerIns.setMap(null);
                    }

                    const marker = new AdvancedMarkerElement({
                        map: map,
                        position: restaurantLocation || { lat: 0, lng: 0 },
                    })
                    setMarkerIns(marker)
                })
            } catch (e) {
                console.error("Error loading Google Maps API:", e);
            }
        }
        initMap()
    }, [restaurantLocation]);

    const getCurrentLocation = (e) => {
        e.stopPropagation()
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const latLng = {
                        lat: position.coords.latitude,
                        lng: position.coords.longitude
                    };
                    const locationVal = latLng.lat + ',' + latLng.lng
                    setErrors((pre) => ({ ...pre, location: '' }))
                    setLocationValue(locationVal)
                    setRestaurantLocation(latLng);
                },
                (error) => {
                    console.error('Error getting location:', error);
                }
            );
        } else {
            console.error('Geolocation is not supported by this browser.');
        }
    };

    useEffect(() => {
        console.log('restaurantLocation:', restaurantLocation);
    }, [restaurantLocation])

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
                                disabled={editPage && !restaurantName}
                                value={restaurantName}
                                type="text"
                                name="restaurantName"
                                placeholder='restaurant name *'
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
                                disabled={editPage && !fullDescription}
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
                                disabled={editPage && !description}
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
                        <div className="location">
                            <input
                                disabled={editPage && !description}
                                type="text"
                                name="location"
                                id="location"
                                placeholder="Enter restaurant coordinates"
                                value={locationValue}
                                onChange={(e) => {
                                    setLocationValue(e.target.value)
                                    handleValidation(e)
                                }}
                                onClick={() => {
                                    setRestaurantLocation(null)
                                    setMapIns(null)
                                }}
                            />
                            <button
                                title="Get my current location"
                                onClick={getCurrentLocation}
                            >
                                <FaMapLocationDot />
                            </button>
                            {restaurantLocation && (
                                <div id="map" style={{ width: '100%', height: '400px' }}></div>
                            )}
                            {
                                errors.location && <p className="add-res-error2">{errors.location}</p>
                            }
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
                                disabled={editPage && !address}
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
                                disabled={editPage && !city}
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