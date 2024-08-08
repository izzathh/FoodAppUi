import { FaRegEdit } from "react-icons/fa";
import { RiDeleteBin5Line } from "react-icons/ri";
import { IoMdAdd } from "react-icons/io";
import { useContext, useEffect, useState } from "react";
import { newSubCategoryValidation } from "../../schema";
import { useFoodApp } from "../../hooks/appProvider";
import { AuthContext } from "../../context/protectedRoutes";
import { MdOutlineEditOff } from "react-icons/md";
import { RiSaveLine } from "react-icons/ri";

const SubCategory = () => {
    const [openSubcategoryInput, setOpenSubcategoryInput] = useState(false);
    const [newSubCategory, setNewSubCategory] = useState('');
    const [updatedCatSubCat, setUpdatedCatSubCat] = useState({
        updatedCategory: null,
        updatedSubCategory: null,
        updatedCategoryId: null
    });
    const [errors, setErrors] = useState({});
    const [isSaving, setIsSaving] = useState({});
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [editSubCategory, setEditSubCategory] = useState(null);
    const { adminType, adminId, adminRestaurantId } = useContext(AuthContext);

    const {
        setSuccessToast,
        subCategories,
        categories,
        setSubCategories,
        client,
        confirmAlert,
        getAllCategory,
        setCategories,
        getAllSubCategory
    } = useFoodApp();

    const handleValidation = async (e) => {
        try {
            setNewSubCategory(e.target.value)
            await subCategories.map(sub => {
                if (sub.subCategoryName.toLowerCase() === e.target.value.toLowerCase())
                    throw new Error('This sub category already exists')
            })
            if (selectedCategory?.value.toLowerCase() === e.target.value.toLowerCase())
                throw new Error('Sub category connot be the same as category')
            await newSubCategoryValidation.validate({ subcategory: e.target.value })
            setErrors(prev => ({ ...prev, subcategory: '' }))
        } catch (error) {
            console.error(error.message);
            setErrors(prev => ({ ...prev, subcategory: error.message }))
        }
    }

    const handleAddSubCategory = async () => {
        try {
            if (!selectedCategory || selectedCategory.value === 'Select category') {
                setErrors(prev => ({ ...prev, category: 'Category is required' }))
                return
            }
            if (selectedCategory.value.toLowerCase() === newSubCategory.toLowerCase()) {
                setErrors(prev => ({ ...prev, subcategory: 'Sub category connot be the same as category' }))
                return
            }
            await subCategories.map(sub => {
                if (sub.subCategoryName.toLowerCase() === newSubCategory.toLowerCase())
                    throw new Error('This sub category already exists')
            })
            await newSubCategoryValidation.validate({ subcategory: newSubCategory })
            const selectedOptionId = selectedCategory.options[selectedCategory.selectedIndex]
            setIsSaving((prev) => ({ ...prev, addSub: true }))
            const { data } = await client.post('admin-actions/add-new-subcategory', {
                restaurantId: adminRestaurantId,
                subCategoryName: newSubCategory,
                categoryName: selectedCategory.value,
                categoryId: selectedOptionId.dataset.id,
                createdAdminId: adminId
            })
            if (data.status === 1) {
                setNewSubCategory('')
                setSelectedCategory(null)
                setSuccessToast(data.message)
                setSubCategories((prev) =>
                    [...prev, data.subCategory]
                )
                setOpenSubcategoryInput(false)
                setErrors((prev) => ({ ...prev, subcategory: '', category: '' }))
                setIsSaving((prev) => ({ ...prev, addSub: false }))
            }
        } catch (error) {
            console.error(error);
            setIsSaving((prev) => ({ ...prev, addSub: false }))
            setErrors((prev) => ({ ...prev, subcategory: error.message }))
        }
    }

    const handleSelectCategoryChange = async (e) => {
        try {
            setSelectedCategory(e.target)
            if (!e.target || e.target.value === 'Select category') {
                throw new Error('Category is required')
            }
            setErrors(prev => ({ ...prev, category: '' }))
        } catch (error) {
            setErrors(prev => ({ ...prev, category: error.message }))
        }
    }

    const handleDeleteSubcategory = async (id) => {
        try {
            confirmAlert({
                title: "Confirm to delete this sub category!",
                message: "This action will remove all the dishes associated with this sub category",
                buttons: [
                    {
                        label: "Yes",
                        onClick: async () => {
                            setIsSaving(prev => ({ ...prev, deleteSubCat: true }))
                            const { data } = await client.delete('admin-actions/delete-sub-category', {
                                data: {
                                    subCategoryId: id,
                                    restaurantId: adminRestaurantId
                                }
                            })
                            if (data.status === 1) {
                                setIsSaving(prev => ({ ...prev, deleteSubCat: false }))
                                setSubCategories(prev =>
                                    prev.filter(data => data._id !== id)
                                )
                                setSuccessToast(data.message)
                            }
                        }
                    },
                    {
                        label: "No",
                        onClick: () => { return }
                    }
                ]
            });
        } catch (error) {
            console.error(error);
            setIsSaving(prev => ({ ...prev, deleteSubCat: false }))
        }
    }

    const handleUpdateCategoryChange = (e) => {
        const selectedOptionId = e.target.options[e.target.selectedIndex]
        setUpdatedCatSubCat((prev) => ({
            ...prev,
            updatedCategory: e.target.value,
            updatedCategoryId: selectedOptionId.dataset.id
        }))
    }

    const handleUpdateSubCatClick = async (id) => {
        try {
            setIsSaving((prev) => ({ ...prev, updateSubCat: true }))
            const { data } = await client.post('admin-actions/update-sub-category', {
                subCategoryId: id,
                categoryId: updatedCatSubCat.updatedCategoryId,
                subCategory: updatedCatSubCat.updatedSubCategory,
                category: updatedCatSubCat.updatedCategory
            })

            if (data.status === 1) {
                setUpdatedCatSubCat({
                    updatedCategory: null,
                    updatedSubCategory: null,
                    updatedCategoryId: null
                })
                setSuccessToast(data.message)
                setCategories((prev) =>
                    prev.map(data => {
                        if (data.id === updatedCatSubCat.updatedCategoryId) {
                            return { ...data, categoryName: updatedCatSubCat.updatedCategory }
                        }
                        return data
                    })
                )
                setSubCategories((prev) =>
                    prev.map(data => {
                        if (data._id === id) {
                            let updated = { ...data }
                            if (updatedCatSubCat.updatedCategory) {
                                updated.categoryName = updatedCatSubCat.updatedCategory
                                updated.categoryId = updatedCatSubCat.updatedCategoryId
                            }
                            if (updatedCatSubCat.updatedSubCategory)
                                updated.subCategoryName = updatedCatSubCat.updatedSubCategory
                            return updated
                        }
                        return data
                    })
                )
                setEditSubCategory(null)
                setIsSaving((prev) => ({ ...prev, updateSubCat: false }))
            }
        } catch (error) {
            console.error(error);
            setIsSaving((prev) => ({ ...prev, updateSubCat: false }))
        }
    }

    useEffect(() => {
        async function getCategory() {
            const getCategory = await getAllCategory()
            if (getCategory.length !== 0)
                setCategories(getCategory)
        }
        if (categories.length === 0)
            getCategory()
    }, [categories])

    useEffect(() => {
        async function getSubCategories() {
            const getSubC = await getAllSubCategory();
            if (getSubC.length !== 0)
                setSubCategories(getSubC)
        }
        if (subCategories.length === 0)
            getSubCategories()
    }, [subCategories])

    return (
        <div className="categories-container">
            <div className="category-title-add">
                <h1>Sub Categories</h1>
                {!openSubcategoryInput && (
                    <button
                        onClick={() => setOpenSubcategoryInput(true)}
                    ><IoMdAdd />
                    </button>
                )}
                {(isSaving.deleteSubCat || isSaving.updateSubCat) && (
                    <div
                        style={{ marginLeft: '1em' }}
                        className="notification-loader category"
                    >
                    </div>
                )}
                {openSubcategoryInput && (
                    <div className="add-category-option">
                        <div className="category-select-error">
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
                                {categories.map((catagory, index) => (
                                    <option
                                        key={index}
                                        value={catagory.categoryName}
                                        data-id={catagory._id}
                                    >
                                        {catagory.categoryName}
                                    </option>
                                ))}
                            </select>
                            {errors.category && (
                                <>
                                    <br />
                                    <label className="select-category-error" htmlFor="category-select">
                                        {errors.category}
                                    </label>
                                </>
                            )}
                        </div>
                        <div className="category-error-label">
                            <input
                                id="subCategory"
                                value={newSubCategory}
                                onChange={handleValidation}
                                type="text"
                                placeholder="enter new sub category"
                            />
                            {errors.subcategory && (
                                <label htmlFor="subCategory">{errors.subcategory}</label>
                            )}
                        </div>
                        <div>
                            {isSaving.addSub ? (
                                <div className="notification-loader category"></div>
                            ) : (
                                <button
                                    onClick={handleAddSubCategory}
                                >
                                    <RiSaveLine />
                                </button>
                            )}
                        </div>
                    </div>
                )}
            </div>
            <div className="category-table">
                <table>
                    <thead>
                        <tr>
                            <th>Id</th>
                            <th>Sub Category</th>
                            <th>Category</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {subCategories.map((sub, index) => (
                            <tr key={index}>
                                <td>{index + 1}</td>
                                {editSubCategory === sub._id && (
                                    <td>
                                        <input
                                            value={updatedCatSubCat.updatedSubCategory}
                                            onChange={(e) =>
                                                setUpdatedCatSubCat(prev =>
                                                    ({ ...prev, updatedSubCategory: e.target.value }))
                                            }
                                            type="text"
                                            placeholder="enter sub category"
                                        />
                                    </td>
                                )}
                                {editSubCategory !== sub._id && (
                                    <td>{sub.subCategoryName}</td>
                                )}
                                {editSubCategory === sub._id && (
                                    <td>
                                        <div className="add-category-option">
                                            <div className="category-select-error">
                                                <select
                                                    onChange={handleUpdateCategoryChange}
                                                    name="category-option"
                                                    id="category-select-edit"
                                                >
                                                    {categories.map((catagory, index) => (
                                                        <option
                                                            key={index}
                                                            value={catagory.categoryName}
                                                            selected={catagory.categoryName === sub.categoryName}
                                                            data-id={catagory._id}
                                                        >
                                                            {catagory.categoryName}
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>
                                        </div>
                                    </td>
                                )}
                                {editSubCategory !== sub._id && (
                                    <td>{sub.categoryName}</td>
                                )}
                                <td className="category-edit-delete">
                                    {editSubCategory !== sub._id && (
                                        <button
                                            onClick={() => {
                                                setEditSubCategory(sub._id)
                                                setUpdatedCatSubCat({
                                                    updatedCategory: sub.categoryName,
                                                    updatedSubCategory: sub.subCategoryName,
                                                    updatedCategoryId: sub.categoryId
                                                })
                                            }}
                                            className="category-edit"
                                        >
                                            <FaRegEdit />
                                        </button>
                                    )}
                                    {editSubCategory === sub._id && (
                                        <button
                                            onClick={() => {
                                                setUpdatedCatSubCat({
                                                    updatedCategory: null,
                                                    updatedSubCategory: null,
                                                    updatedCategoryId: null,
                                                })
                                                setEditSubCategory(null)
                                            }}
                                            className="category-edit-close"
                                        >
                                            <MdOutlineEditOff />
                                        </button>
                                    )}
                                    {editSubCategory !== sub._id && (
                                        <button
                                            onClick={() => handleDeleteSubcategory(sub._id)}
                                            className="category-delete"
                                        >
                                            <RiDeleteBin5Line />
                                        </button>
                                    )}
                                    {editSubCategory === sub._id && (
                                        <button
                                            onClick={() => handleUpdateSubCatClick(sub._id)}
                                            className="save-edited-changes"
                                        >
                                            <RiSaveLine />
                                        </button>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    )
}

export default SubCategory;