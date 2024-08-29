import { FaRegEdit } from "react-icons/fa";
import { RiDeleteBin5Line } from "react-icons/ri";
import { IoMdAdd } from "react-icons/io";
import { useContext, useEffect, useState } from "react";
import { RiSaveLine } from "react-icons/ri";
import { useFoodApp } from "../../hooks/appProvider";
import { newCategoryValidation } from "../../schema";
import { AuthContext } from "../../context/protectedRoutes";
import { MdOutlineEditOff } from "react-icons/md";

const Category = () => {
    const [openCategoryInput, setOpenCategoryInput] = useState(false);
    const [newCategory, setNewCategory] = useState('');
    const [updatedCategory, setUpdatedCategory] = useState('');
    const [errors, setErrors] = useState({});
    const [openCategoryEditor, setOpenCategoryEditor] = useState(null);
    const [isSaving, setIsSaving] = useState({});

    const {
        setSuccessToast,
        categories,
        setCategories,
        client,
        confirmAlert,
        getAllCategory,
        handleDeleteCategory,
        updateCategory
    } = useFoodApp();
    const { adminId, adminRestaurantId } = useContext(AuthContext);

    const handleUpdateCategory = async (id) => {
        try {
            await newCategoryValidation.validate({ category: updatedCategory });
            await categories.map(category => {
                if (category.categoryName.toLowerCase() === updatedCategory.toLowerCase()) {
                    throw new Error('This category already exists')
                }
            })
            await updateCategory(id, updatedCategory, setIsSaving, setErrors, setOpenCategoryEditor)
        } catch (error) {
            console.error(error);
            setIsSaving(prev => ({ ...prev, updateCat: false }))
            setErrors(prev => ({ ...prev, categoryUpdate: error.message }))
        }
    }

    const handleCategoryDelete = async (id) => {
        try {
            confirmAlert({
                title: "Confirm to delete this category!",
                message: "This action will remove all the sub categories and dishes associated with this category",
                buttons: [
                    {
                        label: "Yes",
                        onClick: async () => {
                            handleDeleteCategory(setIsSaving, id)
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
            setIsSaving(prev => ({ ...prev, deleteCat: false }))
        }
    }

    const handleSaveCategory = async () => {
        try {
            categories.map(category => {
                if (category.categoryName.toLowerCase() === newCategory.toLowerCase()) {
                    throw new Error('This category already exists')
                }
            })
            await newCategoryValidation.validate({ category: newCategory });
            setIsSaving(prev => ({ ...prev, addCat: true }))
            const { data } = await client.post('admin-actions/add-new-category', {
                restaurantId: adminRestaurantId,
                categoryName: newCategory,
                createdAdminId: adminId
            })
            if (data.status === 1) {
                setIsSaving(prev => ({ ...prev, addCat: false }))
                setOpenCategoryInput(false)
                setCategories((prev) => [...prev, data.category])
                setNewCategory('')
                setErrors(prev => ({ ...prev, category: '' }))
                setSuccessToast(data.message)
            }
        } catch (error) {
            setIsSaving(prev => ({ ...prev, addCat: false }))
            setErrors(prev => ({ ...prev, category: error.message }))
            console.error(error);
        }
    }

    const handleValidation = async (e) => {
        try {
            setNewCategory(e.target.value)
            await categories.map(category => {
                if (category.categoryName.toLowerCase() === e.target.value.toLowerCase()) {
                    throw new Error('This category already exists')
                }
            })
            await newCategoryValidation.validate({ category: e.target.value });
            setErrors(prev => ({ ...prev, category: '' }))
        } catch (error) {
            setErrors(prev => ({ ...prev, category: error.message }))
            console.log({ category: error.message })
        }
    }

    const handleNewCategory = async (e) => {
        try {
            setUpdatedCategory(e.target.value)
            await categories.map(category => {
                if (category.categoryName.toLowerCase() === e.target.value.toLowerCase()) {
                    throw new Error('This category already exists')
                }
            })
            await newCategoryValidation.validate({ category: e.target.value })
            setErrors(prev => ({ ...prev, categoryUpdate: '' }))
        } catch (error) {
            setErrors(prev => ({ ...prev, categoryUpdate: error.message }))
            console.log({ categoryUpdate: error.message });
        }
    }

    useEffect(() => {
        async function getCategory() {
            const getCategory = await getAllCategory()
            if (getCategory.length !== 0)
                setCategories(getCategory)
        }
        if (categories.length === 0) {
            getCategory()
        }
    }, [categories])

    return (
        <div className="categories-container">
            <div className="category-title-add">
                <h1>Categories</h1>
                {!openCategoryInput && (
                    <button
                        onClick={() => setOpenCategoryInput(true)}
                    >
                        <IoMdAdd />
                    </button>
                )}
                {(isSaving.deleteCat || isSaving.updateCat) && (
                    <div
                        style={{ marginLeft: '1em' }}
                        className="notification-loader category"
                    >
                    </div>
                )}
                {openCategoryInput && (
                    <div className="add-category-option">
                        <div className="category-error-label">
                            <input
                                id="category"
                                value={newCategory}
                                onChange={handleValidation}
                                type="text"
                                placeholder="enter new category"
                            />
                            {errors.category && (
                                <label htmlFor="category">{errors.category}</label>
                            )}
                        </div>
                        <div>
                            {isSaving.addCat ? (
                                <div className="notification-loader category"></div>
                            ) : (
                                <button
                                    onClick={handleSaveCategory}
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
                            <th>Category</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {categories.map((category, index) => (
                            <tr key={index}>
                                <td>{index + 1}</td>
                                {openCategoryEditor !== category._id && (
                                    <td>{category.categoryName}</td>
                                )}
                                {openCategoryEditor === category._id && (
                                    <td className="category-update-input">
                                        <input
                                            id="categoryUpdate"
                                            value={updatedCategory}
                                            type="text"
                                            placeholder="category name"
                                            onChange={handleNewCategory}
                                        />
                                        <br />
                                        {errors.categoryUpdate && (
                                            <label htmlFor="categoryUpdate">{errors.categoryUpdate}</label>
                                        )}
                                    </td>
                                )}
                                <td className="category-edit-delete">
                                    {openCategoryEditor !== category._id && (
                                        <button
                                            onClick={() => {
                                                setUpdatedCategory(category.categoryName)
                                                setOpenCategoryEditor(category._id)
                                            }}
                                            className="category-edit"
                                        >
                                            <FaRegEdit />
                                        </button>
                                    )}
                                    {openCategoryEditor === category._id && (
                                        <button
                                            onClick={() => {
                                                setUpdatedCategory('')
                                                setOpenCategoryEditor(null)
                                                setErrors(prev => ({ ...prev, categoryUpdate: '' }))
                                            }}
                                            className="category-edit-close"
                                        >
                                            <MdOutlineEditOff />
                                        </button>
                                    )}
                                    {openCategoryEditor !== category._id && (
                                        <button
                                            onClick={() => handleCategoryDelete(category._id)}
                                            className="category-delete"
                                        >
                                            <RiDeleteBin5Line />
                                        </button>
                                    )}
                                    {openCategoryEditor === category._id && (
                                        <button
                                            onClick={() =>
                                                handleUpdateCategory(category._id)
                                            }
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

export default Category;