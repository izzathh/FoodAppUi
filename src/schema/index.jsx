import * as Yup from "yup"

export const AddRestaurantValidation = Yup.object().shape({
    restaurantName: Yup.string().trim().required('Restaurant name is required').max(25, 'Restaurant name must be 25 chars at maximum'),
    address: Yup.string().trim().required('Address is required').min(6, 'Address must be 6 chars at minimum'),
    city: Yup.string().trim().required('City is required'),
    description: Yup.string().trim().max(25, 'description must be 25 chars at maximum').required('description is required'),
    fullDescription: Yup.string().trim().required('full description is required'),
})

export const EditRestaurantValidation = Yup.object().shape({
    address: Yup.string().trim().required('Address is required').min(6, 'Address must be 6 chars at minimum'),
    description: Yup.string().trim().max(25, 'description must be 25 chars at maximum').required('description is required'),
    fullDescription: Yup.string().trim().required('full description is required'),
    itemName: Yup.string().trim().required('Item name is required'),
    price: Yup.string().trim().required('Price is required')
})

export const EditMenuValidation = Yup.object().shape({
    description: Yup.string().trim().max(25, 'description must be 25 chars at maximum').required('description is required'),
    fullDescription: Yup.string().trim().required('full description is required'),
    itemName: Yup.string().trim().required('Item name is required'),
    price: Yup.string().trim().required('Price is required')
})

export const RestaurantImgValidation = Yup
    .mixed().required('Restaurant image is required')
    .test('fileType', 'Only PNG, JPG and JPEG formats are allowed', (value) => {
        if (value) {
            const fileTypes = ['image/png', 'image/jpeg', 'image/jpg']
            return fileTypes.includes(value.type)
        }
        return true;
    })


export const RegisterRestaurantValidation = Yup.object().shape({
    email: Yup.string().trim().required('email is required'),
    password: Yup.string().trim().required('password is required'),
    username: Yup.string().trim().required('username is required'),
    restaurantName: Yup.string().trim().required('Restaurant name is required').max(25, 'Restaurant name must be 25 chars at maximum'),
    address: Yup.string().trim().required('Address is required').min(6, 'Address must be 6 chars at minimum'),
    city: Yup.string().trim().required('City is required'),
    description: Yup.string().trim().max(25, 'description must be 25 chars at maximum').required('description is required'),
    fullDescription: Yup.string().trim().required('full description is required'),
})

export const newCategoryValidation = Yup.object().shape({
    category: Yup.string().trim().required('Category is required').max(20, 'category must be 20 chars at maximum')
})

export const newSubCategoryValidation = Yup.object().shape({
    subcategory: Yup.string().trim().required('Sub category is required').max(20, 'sub category must be 20 chars at maximum')
})

export const newDishValidation = Yup.object().shape({
    dish: Yup.string().trim().required('Dish is required')
})