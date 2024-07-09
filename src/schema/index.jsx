import * as Yup from "yup"

export const AddRestaurantValidation = Yup.object().shape({
    restaurantName: Yup.string().required('Restaurant name is required').max(25, 'Restaurant name must be 25 chars at maximum'),
    address: Yup.string().required('Address is required').min(6, 'Address must be 6 chars at minimum'),
    city: Yup.string().required('City is required'),
    description: Yup.string().max(25, 'description must be 25 chars at maximum').required('description is required'),
    fullDescription: Yup.string().required('full description is required'),
})

export const EditRestaurantValidation = Yup.object().shape({
    address: Yup.string().required('Address is required').min(6, 'Address must be 6 chars at minimum'),
    description: Yup.string().max(25, 'description must be 25 chars at maximum').required('description is required'),
    fullDescription: Yup.string().required('full description is required'),
    itemName: Yup.string().required('Item name is required'),
    price: Yup.string().required('Price is required')
})

export const EditMenuValidation = Yup.object().shape({
    description: Yup.string().max(25, 'description must be 25 chars at maximum').required('description is required'),
    fullDescription: Yup.string().required('full description is required'),
    itemName: Yup.string().required('Item name is required'),
    price: Yup.string().required('Price is required')
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
    email: Yup.string().required('email is required'),
    password: Yup.string().required('password is required'),
    username: Yup.string().required('username is required'),
    restaurantName: Yup.string().required('Restaurant name is required').max(25, 'Restaurant name must be 25 chars at maximum'),
    address: Yup.string().required('Address is required').min(6, 'Address must be 6 chars at minimum'),
    city: Yup.string().required('City is required'),
    description: Yup.string().max(25, 'description must be 25 chars at maximum').required('description is required'),
    fullDescription: Yup.string().required('full description is required'),
})