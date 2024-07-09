import { FaRegEdit } from "react-icons/fa";
import { RiDeleteBin5Line } from "react-icons/ri";
import { IoMdAdd } from "react-icons/io";

const Dishes = () => {
    return (
        <div className="categories-container categories-container-dishes">
            <div className="category-title-add">
                <h1>Dishes</h1>
                <button><IoMdAdd /></button>
            </div>
            <div className="category-table">
                <table>
                    <tr>
                        <th>Id</th>
                        <th>Dish</th>
                        <th>Category</th>
                        <th>Sub Category</th>
                        <th>Actions</th>
                    </tr>
                    <tr>
                        <td>1</td>
                        <td>Veg Briyani</td>
                        <td>Rice</td>
                        <td>Briyani</td>
                        <td className="category-edit-delete">
                            <button className="category-edit"><FaRegEdit /></button>
                            <button className="category-delete"><RiDeleteBin5Line /></button>
                        </td>
                    </tr>
                    <tr>
                        <td>2</td>
                        <td></td>
                        <td>Veg Briyani</td>
                        <td>Chicken</td>
                        <td className="category-edit-delete">
                            <button className="category-edit"><FaRegEdit /></button>
                            <button className="category-delete"><RiDeleteBin5Line /></button>
                        </td>
                    </tr>
                    <tr>
                        <td>3</td>
                        <td></td>
                        <td>Veg Briyani</td>
                        <td>Pasta</td>
                        <td className="category-edit-delete">
                            <button className="category-edit"><FaRegEdit /></button>
                            <button className="category-delete"><RiDeleteBin5Line /></button>
                        </td>
                    </tr>
                    <tr>
                        <td>3</td>
                        <td></td>
                        <td>Veg Briyani</td>
                        <td>Pasta</td>
                        <td className="category-edit-delete">
                            <button className="category-edit"><FaRegEdit /></button>
                            <button className="category-delete"><RiDeleteBin5Line /></button>
                        </td>
                    </tr>
                    <tr>
                        <td>3</td>
                        <td></td>
                        <td>Veg Briyani</td>
                        <td>Pasta</td>
                        <td className="category-edit-delete">
                            <button className="category-edit"><FaRegEdit /></button>
                            <button className="category-delete"><RiDeleteBin5Line /></button>
                        </td>
                    </tr>
                    <tr>
                        <td>3</td>
                        <td></td>
                        <td>Veg Briyani</td>
                        <td>Pasta</td>
                        <td className="category-edit-delete">
                            <button className="category-edit"><FaRegEdit /></button>
                            <button className="category-delete"><RiDeleteBin5Line /></button>
                        </td>
                    </tr>
                    <tr>
                        <td>3</td>
                        <td></td>
                        <td>Veg Briyani</td>
                        <td>Pasta</td>
                        <td className="category-edit-delete">
                            <button className="category-edit"><FaRegEdit /></button>
                            <button className="category-delete"><RiDeleteBin5Line /></button>
                        </td>
                    </tr>
                    <tr>
                        <td>3</td>
                        <td></td>
                        <td>Veg Briyani</td>
                        <td>Pasta</td>
                        <td className="category-edit-delete">
                            <button className="category-edit"><FaRegEdit /></button>
                            <button className="category-delete"><RiDeleteBin5Line /></button>
                        </td>
                    </tr>
                    <tr>
                        <td>3</td>
                        <td></td>
                        <td>Veg Briyani</td>
                        <td>Pasta</td>
                        <td className="category-edit-delete">
                            <button className="category-edit"><FaRegEdit /></button>
                            <button className="category-delete"><RiDeleteBin5Line /></button>
                        </td>
                    </tr>
                    <tr>
                        <td>3</td>
                        <td></td>
                        <td>Veg Briyani</td>
                        <td>Pasta</td>
                        <td className="category-edit-delete">
                            <button className="category-edit"><FaRegEdit /></button>
                            <button className="category-delete"><RiDeleteBin5Line /></button>
                        </td>
                    </tr>
                </table>
            </div>
        </div>
    )
}

export default Dishes;