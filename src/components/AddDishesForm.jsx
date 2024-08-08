import { FiLoader } from "react-icons/fi";
import { RestaurantImgValidation, EditRestaurantValidation } from "../schema";
import { IoCloseCircleOutline } from "react-icons/io5";
import { useEffect, useState } from "react";
import { useFoodApp } from "../hooks/appProvider";
import * as Yup from "yup"

const DishesForm = ({ setOpenDishesInput }) => {
    const [errors, setErrors] = useState({});
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [selectedSubCategory, setSelectedSubCategory] = useState(null);
    const [imagePreview, setImagePreview] = useState(null)
    const [filteredSubCategories, setFilteredSubCategories] = useState([])
    const [imageFile, setImageFile] = useState(null)
    const [isCategorySelected, setIsCategorySelected] = useState(false)
    const [isDelivery, setIsDelivery] = useState(false)
    const [isVeg, setIsVeg] = useState(false)
    const [formData, setFormData] = useState(new FormData())
    const [isLoading, setIsLoading] = useState(false)

    const {
        dishes,
        setDishes,
        categories,
        setCategories,
        getAllCategory,
        subCategories,
        getAllSubCategory,
        setSubCategories,
        handleAddDishesApi,
        setErrorToast,
        setSuccessToast
    } = useFoodApp();

    const appendFormdata = async (e) => {
        const { name, value } = e.target
        try {
            await dishes.map(dish => {
                if (dish.itemName.toLowerCase() === value.toLowerCase().trim())
                    throw new Error('This dish already exists')
            })
            if (selectedCategory?.value.toLowerCase() === value.toLowerCase().trim())
                throw new Error('Dish name connot be the same as category')
            if (selectedSubCategory?.value.toLowerCase() === value.toLowerCase().trim())
                throw new Error('Dish name connot be the same as sub category')
            const validation = Yup.object().shape({
                [name]: EditRestaurantValidation.fields[name]
            })
            await validation.validate({ [name]: value })
            setErrors(prev => ({ ...prev, [name]: '' }))
            if (formData.has(name))
                formData.set(name, value)
            else
                formData.append(name, value)
        } catch (error) {
            console.error(error);
            setErrors(prev => ({ ...prev, [name]: error.message }))
        }
    }

    const handleSubmit = async () => {
        try {
            setIsLoading(true)
            await EditRestaurantValidation.validate({
                address: formData.get('address'),
                description: formData.get('description'),
                fullDescription: formData.get('fullDescription'),
                itemName: formData.get('itemName'),
                price: formData.get('price'),
            }, { abortEarly: false })

            const base64Regex = /^data:image\/(png|jpeg|jpg|gif|bmp|webp);base64,([A-Za-z0-9+/=]+)$/;
            if (!base64Regex.test(imageFile)) {
                await RestaurantImgValidation.validate(imageFile);
            }

            const categoryId = selectedCategory.options[selectedCategory.selectedIndex]
            const subCategoryId = selectedSubCategory.options[selectedSubCategory.selectedIndex]
            formData.append('categoryId', categoryId.dataset.id)
            formData.append('subCategoryId', subCategoryId.dataset.id)
            formData.append('categoryName', selectedCategory.value)
            formData.append('subCategoryName', selectedSubCategory.value)
            formData.append('delivery', isDelivery)
            formData.append('veg', isVeg)
            formData.append('image', imageFile)
            const data = await handleAddDishesApi(formData)
            console.log('data:', data);
            if (data.status === 1) {
                setIsLoading(false)
                setDishes((prev) => [...prev, data.newMenu])
                setOpenDishesInput(false)
                setSuccessToast('Item added successfully!')
            } else {
                setIsLoading(false)
                setErrorToast(data.message)
            }
        } catch (errors) {
            setIsLoading(false)
            if (errors instanceof Yup.ValidationError) {
                const formatErrors = errors.inner.reduce((acc, error) => {
                    return { ...acc, [error.path]: error.message }
                }, {})
                if (!imageFile) formatErrors.image = "Dish image is required"
                if (!selectedCategory) formatErrors.category = "Category is required"
                if (!selectedSubCategory) formatErrors.subCategory = "Sub category is required"
                setErrors(formatErrors)
            } else {
                console.error(errors);
                setErrorToast('Error adding new dish');
            }
        }
    }

    const handleSelectCategoryChange = async (e) => {
        try {
            setSelectedCategory(e.target)
            if (!e.target || e.target.value === 'Select category') {
                setIsCategorySelected(false)
                throw new Error('Category is required')
            }
            const categoryId = e.target.options[e.target.selectedIndex]
            setFilteredSubCategories(subCategories.filter(sub =>
                sub.categoryId === categoryId.dataset.id
            ))
            setIsCategorySelected(true)
            setErrors(prev => ({ ...prev, category: '' }))
        } catch (error) {
            setErrors(prev => ({ ...prev, category: error.message }))
            setIsCategorySelected(false)
        }
    }

    const handleSelectSubCategoryChange = async (e) => {
        try {
            setSelectedSubCategory(e.target)
            if (!e.target || e.target.value === 'Select sub category') {
                throw new Error('Sub category is required')
            }
            setErrors(prev => ({ ...prev, subCategory: '' }))
        } catch (error) {
            setErrors(prev => ({ ...prev, subCategory: error.message }))
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

    useEffect(() => {
        async function getCategory() {
            const getCategory = await getAllCategory()
            if (getCategory.length !== 0) setCategories(getCategory)
        }
        if (categories.length === 0) getCategory()
    }, [categories])

    useEffect(() => {
        async function getSubCategories() {
            const getSubC = await getAllSubCategory();
            if (getSubC.length !== 0) {
                setSubCategories(getSubC)
            }
        }
        if (subCategories.length === 0) getSubCategories()
    }, [subCategories])

    return (
        <>
            <div className="menu-page-head dish-edit">
                <h1 className="add-dishes-title">Add Dishes</h1>
                <button onClick={() => setOpenDishesInput(false)}>Back</button>
            </div>
            <div className="dishes-form-cont" >
                <div className="dishes-form-fields">
                    <div>

                        <select
                            onChange={handleSelectCategoryChange}
                            name="category-option"
                            id="category-select"
                        >
                            <option
                                style={{ color: 'rgb(128 128 128)' }}
                                value={null}
                            >
                                Select category
                            </option>
                            {categories.map((category, index) => (
                                <option
                                    key={index}
                                    value={category.categoryName}
                                    data-id={category._id}
                                >
                                    {category.categoryName}
                                </option>
                            ))}
                        </select>
                        {
                            errors.category &&
                            <>
                                <br />
                                <label htmlFor="category-select" className="error-label">{errors.category}</label>
                            </>
                        }
                    </div>
                    <div>
                        <select
                            disabled={!isCategorySelected}
                            onChange={handleSelectSubCategoryChange}
                            name="category-sub-option"
                            id="category-sub-select"
                        >
                            <option
                                style={{ color: 'rgb(128 128 128)' }}
                                value={null}
                            >
                                Select sub category
                            </option>
                            {filteredSubCategories.map((subcategory, index) => (
                                <option
                                    key={index}
                                    value={subcategory.subCategoryName}
                                    data-id={subcategory._id}
                                >
                                    {subcategory.subCategoryName}
                                </option>
                            ))}
                        </select>
                        {
                            errors.subCategory &&
                            <>
                                <br />
                                <label htmlFor="category-sub-select" className="error-label">{errors.subCategory}</label>
                            </>
                        }
                    </div>
                    <div>

                        <input
                            onChange={appendFormdata}
                            name="itemName"
                            id="itemName"
                            type="text"
                            placeholder="item name"
                        />

                        {
                            errors.itemName &&
                            <>
                                <br />
                                <label htmlFor="itemName" className="error-label">{errors.itemName}</label>
                            </>
                        }
                    </div>
                    <div>
                        <input
                            onChange={appendFormdata}
                            name="description"
                            id="description"
                            type="text"
                            placeholder="description"
                        />
                        {
                            errors.description &&
                            <>
                                <br />
                                <label htmlFor="description" className="error-label">{errors.description}</label>
                            </>
                        }
                    </div>
                    <div>
                        <input
                            onChange={appendFormdata}
                            name="fullDescription"
                            id="fullDescription"
                            type="text"
                            placeholder="full description"
                        />
                        {
                            errors.fullDescription &&
                            <>
                                <br />
                                <label htmlFor="fullDescription" className="error-label">{errors.fullDescription}</label>
                            </>
                        }
                    </div>
                    <div
                        onDragOver={(e) => e.preventDefault()}
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
                                    <label htmlFor="image" className="error-label">{errors.image}</label>
                                }
                            </>
                        )}
                    </div>
                    <div className="dishes-veg-delivery">
                        <div>
                            <label htmlFor="veg">Veg</label>
                            <input
                                onClick={(e) => {
                                    setIsVeg(e.target.checked)
                                }}
                                checked={isVeg}
                                id="veg"
                                type="checkbox"
                            />
                        </div>
                        <div>
                            <label htmlFor="delivery">Delivery</label>
                            <input
                                onClick={(e) => {
                                    setIsDelivery(e.target.checked)
                                }}
                                checked={isDelivery}
                                id="delivery"
                                type="checkbox"
                            />
                        </div>
                    </div>
                    <div>
                        <input
                            onChange={appendFormdata}
                            name="offer"
                            id="offer"
                            type="text"
                            placeholder="offer"
                        />
                    </div>
                    <div>
                        <input
                            onChange={appendFormdata}
                            name="price"
                            id="price"
                            type="text"
                            placeholder="price"
                        />
                        {
                            errors.price &&
                            <>
                                <br />
                                <label htmlFor="price" className="error-label">{errors.price}</label>
                            </>
                        }
                    </div>
                    <div>
                        <input
                            onChange={appendFormdata}
                            name="address"
                            id="address"
                            type="text"
                            placeholder="address"
                        />
                        {
                            errors.address &&
                            <>
                                <br />
                                <label htmlFor="address" className="error-label">{errors.address}</label>
                            </>
                        }
                    </div>
                </div>
            </div>
            <div className="add-dishes-submit">
                <button
                    onClick={handleSubmit}
                    disabled={isLoading}
                >
                    {isLoading && (
                        <FiLoader />
                    )}
                    {!isLoading && (
                        'Add'
                    )}
                </button>
                <button onClick={() => setOpenDishesInput(false)} >Cancel</button>
            </div>
        </>
    )
}

export default DishesForm