import { FaRegEdit } from "react-icons/fa";
import { RiDeleteBin5Line } from "react-icons/ri";
import { IoMdAdd } from "react-icons/io";

const Category = () => {
    return (
        <div className="categories-container">
            <div className="category-title-add">
                <h1>Categories</h1>
                <button><IoMdAdd /></button>
            </div>
            <div className="category-table">
                <table>
                    <tr>
                        <th>Id</th>
                        <th>Category</th>
                        <th>Actions</th>
                    </tr>
                    <tr>
                        <td>1</td>
                        <td>Briyani</td>
                        <td className="category-edit-delete">
                            <button className="category-edit"><FaRegEdit /></button>
                            <button className="category-delete"><RiDeleteBin5Line /></button>
                        </td>
                    </tr>
                    <tr>
                        <td>2</td>
                        <td>Chicken</td>
                        <td className="category-edit-delete">
                            <button className="category-edit"><FaRegEdit /></button>
                            <button className="category-delete"><RiDeleteBin5Line /></button>
                        </td>
                    </tr>
                    <tr>
                        <td>3</td>
                        <td>Pasta</td>
                        <td className="category-edit-delete">
                            <button className="category-edit"><FaRegEdit /></button>
                            <button className="category-delete"><RiDeleteBin5Line /></button>
                        </td>
                    </tr>
                    <tr>
                        <td>3</td>
                        <td>Pasta</td>
                        <td className="category-edit-delete">
                            <button className="category-edit"><FaRegEdit /></button>
                            <button className="category-delete"><RiDeleteBin5Line /></button>
                        </td>
                    </tr>
                    <tr>
                        <td>3</td>
                        <td>Pasta</td>
                        <td className="category-edit-delete">
                            <button className="category-edit"><FaRegEdit /></button>
                            <button className="category-delete"><RiDeleteBin5Line /></button>
                        </td>
                    </tr>
                    <tr>
                        <td>3</td>
                        <td>Pasta</td>
                        <td className="category-edit-delete">
                            <button className="category-edit"><FaRegEdit /></button>
                            <button className="category-delete"><RiDeleteBin5Line /></button>
                        </td>
                    </tr>
                    <tr>
                        <td>3</td>
                        <td>Pasta</td>
                        <td className="category-edit-delete">
                            <button className="category-edit"><FaRegEdit /></button>
                            <button className="category-delete"><RiDeleteBin5Line /></button>
                        </td>
                    </tr>
                    <tr>
                        <td>3</td>
                        <td>Pasta</td>
                        <td className="category-edit-delete">
                            <button className="category-edit"><FaRegEdit /></button>
                            <button className="category-delete"><RiDeleteBin5Line /></button>
                        </td>
                    </tr>
                    <tr>
                        <td>3</td>
                        <td>Pasta</td>
                        <td className="category-edit-delete">
                            <button className="category-edit"><FaRegEdit /></button>
                            <button className="category-delete"><RiDeleteBin5Line /></button>
                        </td>
                    </tr>
                    <tr>
                        <td>3</td>
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

export default Category;