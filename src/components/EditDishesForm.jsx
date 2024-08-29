import { RestaurantImgValidation, EditRestaurantValidation } from "../schema";
import { IoCloseCircleOutline, IoLogIn } from "react-icons/io5";
import { useEffect, useState } from "react";
import { useFoodApp } from "../hooks/appProvider";
import * as Yup from "yup"
import { FiLoader } from "react-icons/fi";

const EditDishDetails = ({ existingData, setOpenDishEditForm }) => {
    const [errors, setErrors] = useState({});
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [selectedSubCategory, setSelectedSubCategory] = useState(null);
    const [imagePreview, setImagePreview] = useState(null)
    const [imageFile, setImageFile] = useState(null)
    const [isCategorySelected, setIsCategorySelected] = useState(false)
    const [isDelivery, setIsDelivery] = useState(false)
    const [isVeg, setIsVeg] = useState(false)
    const [formData, setFormData] = useState(new FormData())
    const [filteredSubCategories, setFilteredSubCategories] = useState([])
    const [inputValues, setInputValues] = useState({})
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
        handleEditDishesApi,
        setErrorToast,
        setSuccessToast,
        getBase64
    } = useFoodApp();

    useEffect(() => {
        if (existingData) {
            setIsCategorySelected(existingData.categoryId ? true : false)
            setSelectedCategory(existingData.categoryId)
            setSelectedSubCategory(existingData.subCategoryId)
            setImagePreview(existingData.image)
            setImageFile(existingData.image)
            setIsDelivery(existingData.delivery)
            setIsVeg(existingData.veg)
            const existingInputValues = {
                offer: existingData.offer || "",
                description: existingData.description,
                fullDescription: existingData.fullDescription,
                itemName: existingData.itemName,
                price: existingData.price
            }
            setInputValues(existingInputValues)
            formData.set('offer', existingData.offer || "")
            formData.set('description', existingData.description)
            formData.set('fullDescription', existingData.fullDescription)
            formData.set('itemName', existingData.itemName)
            formData.set('price', existingData.price)
        }
    }, [existingData])

    useEffect(() => {
        if (subCategories.length > 0)
            if ((existingData && !selectedCategory) || filteredSubCategories.length === 0) {
                setFilteredSubCategories(subCategories.filter(sub =>
                    sub.categoryId === existingData.categoryId
                ))
            }
    }, [filteredSubCategories, subCategories])

    const appendFormdata = async (e) => {
        const { name, value } = e.target
        try {
            await dishes.map(dish => {
                if (dish.itemName.toLowerCase() === value.toLowerCase().trim())
                    throw new Error('This dish already exists')
            })
            if (selectedCategory?.value && selectedCategory?.value.toLowerCase() === value.toLowerCase().trim())
                throw new Error('Dish name connot be the same as category')
            if (selectedSubCategory?.value && selectedSubCategory?.value.toLowerCase() === value.toLowerCase().trim())
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

    const handleSubmit = async () => {
        try {
            setIsLoading(true)
            await EditRestaurantValidation.validate({
                description: formData.get('description'),
                address: 'Just a dummy address',
                fullDescription: formData.get('fullDescription'),
                itemName: formData.get('itemName'),
                price: formData.get('price'),
            }, { abortEarly: false })

            let image = imageFile
            const base64Regex = /^data:image\/(png|jpeg|jpg|gif|bmp|webp);base64,([A-Za-z0-9+/=]+)$/;
            if (!base64Regex.test(imageFile)) {
                image = await getBase64(URL.createObjectURL(imageFile))
                await RestaurantImgValidation.validate(imageFile);
            }

            const categoryId = selectedCategory.options
                ? selectedCategory.options[selectedCategory.selectedIndex].dataset.id
                : selectedCategory
            const subCategoryId = selectedSubCategory.options
                ? selectedSubCategory.options[selectedSubCategory.selectedIndex].dataset.id
                : selectedSubCategory
            formData.append('categoryId', categoryId)
            formData.append('subCategoryId', subCategoryId)
            formData.append('delivery', isDelivery)
            formData.append('veg', isVeg)
            formData.append('image', image)
            formData.append('menuId', existingData.id)
            const data = await handleEditDishesApi(formData)
            console.log('data:', data);
            if (data.status === 1) {
                setSuccessToast('Item updated successfully!')
                setDishes(prev =>
                    prev.map(dish => {
                        if (dish.id == existingData.id) {
                            return {
                                ...dish,
                                ...data.updated
                            }
                        } else {
                            return dish
                        }
                    })
                )
                setIsLoading(false)
                setOpenDishEditForm(false)
            } else {
                setIsLoading(false)
                setErrorToast('Error updating dish details')
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
                setErrorToast('Error updating dish');
            }
        }
    }

    useEffect(() => {
        async function getCategory() {
            const getCategory = await getAllCategory()
            if (getCategory.length !== 0) setCategories(getCategory)
        }
        if (categories.length === 0) getCategory()
    }, [])

    useEffect(() => {
        async function getSubCategories() {
            const getSubC = await getAllSubCategory();
            if (getSubC.length !== 0) setSubCategories(getSubC)
        }
        if (subCategories.length === 0) getSubCategories()
    }, [])

    return (
        <>
            <div className="menu-page-head dish-edit">
                <h1 className="add-dishes-title">Edit Dish</h1>
                <button onClick={() => setOpenDishEditForm(false)}>Back</button>
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
                                    selected={category._id === existingData.categoryId}
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
                                    selected={subcategory._id === existingData.subCategoryId}
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
                            onChange={(e) => {
                                appendFormdata(e)
                                setInputValues(pre => ({ ...pre, itemName: e.target.value }))
                            }}
                            name="itemName"
                            id="itemName"
                            type="text"
                            value={inputValues.itemName || ''}
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
                            onChange={(e) => {
                                appendFormdata(e)
                                setInputValues(pre => ({ ...pre, description: e.target.value }))
                            }}
                            name="description"
                            id="description"
                            type="text"
                            placeholder="description"
                            value={inputValues.description || ''}
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
                            onChange={(e) => {
                                appendFormdata(e)
                                setInputValues(pre => ({ ...pre, fullDescription: e.target.value }))
                            }}
                            name="fullDescription"
                            id="fullDescription"
                            type="text"
                            placeholder="full description"
                            value={inputValues.fullDescription || ''}
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
                        // onDrop={handleDrop}
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
                                onChange={(e) => {
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
                                onChange={(e) => {
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
                            onChange={(e) => {
                                appendFormdata(e)
                                setInputValues(pre => ({ ...pre, offer: e.target.value }))
                            }}
                            name="offer"
                            id="offer"
                            type="text"
                            placeholder="offer"
                            value={inputValues.offer || ''}
                        />
                    </div>
                    <div>
                        <input
                            onChange={(e) => {
                                appendFormdata(e)
                                setInputValues(pre => ({ ...pre, price: e.target.value }))
                            }}
                            name="price"
                            id="price"
                            type="text"
                            placeholder="price"
                            value={inputValues.price || ''}
                        />
                        {
                            errors.price &&
                            <>
                                <br />
                                <label htmlFor="price" className="error-label">{errors.price}</label>
                            </>
                        }
                    </div>
                </div>
            </div>
            <div className="add-dishes-submit">
                <button
                    disabled={isLoading}
                    onClick={handleSubmit}
                >
                    {isLoading && (
                        <FiLoader />
                    )}
                    {!isLoading &&
                        'Update'
                    }
                </button>
                <button onClick={() => setOpenDishEditForm(false)} >Cancel</button>
            </div>
        </>
    )
}

export default EditDishDetails;