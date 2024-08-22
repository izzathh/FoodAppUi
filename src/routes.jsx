import { Route, Routes } from 'react-router-dom';
import { ProtectedRoute } from "./context/protectedRoutes";
import Layout from './components/Layout';

import {
    RestaurantPage,
    LoginPage,
    DashboardPage,
    OrdersPage,
    ClientsPage,
    DishesPage,
    DeliveryPeoplePage,
    AddRestaurantPage,
    CategoryPage,
    SubCategoryPage,
    AdminRestaurantPage,
    ResgisterRestaurantPage,
    RestaurantOrdersPage
} from "./pages"
import { PageNotFound } from './pages/404!Authenticated';

const FoodAppRoutes = () => {
    return (
        <Routes>
            <Route
                path="/login"
                element={<LoginPage />}
            />
            <Route
                element={<ProtectedRoute roles={['admin']} />}
            >
                <Route
                    path="/dashboard"
                    element={
                        <Layout>
                            <DashboardPage />
                        </Layout>
                    }
                />
                <Route
                    path="/"
                    element={
                        <Layout>
                            <RestaurantPage />
                        </Layout>
                    }
                />
                <Route
                    path="/orders"
                    element={
                        <Layout>
                            <OrdersPage />
                        </Layout>
                    }
                />
                <Route
                    path="/clients"
                    element={
                        <Layout>
                            <ClientsPage />
                        </Layout>
                    }
                />
                <Route
                    path="/delivery-people"
                    element={
                        <Layout>
                            <DeliveryPeoplePage />
                        </Layout>
                    }
                />
                <Route
                    path='/add-restaurant'
                    element={
                        <Layout>
                            <AddRestaurantPage editPage={false} />
                        </Layout>
                    }
                />
                <Route
                    path='/edit-restaurant'
                    element={
                        <Layout>
                            <AddRestaurantPage editPage={true} />
                        </Layout>
                    }
                />
            </Route>
            <Route element={<ProtectedRoute roles={['shop-admin']} />}>
                <Route
                    path="/restaurant-dashboard"
                    element={
                        <Layout>
                            <DashboardPage />
                        </Layout>
                    }
                />
                <Route
                    path="/dishes"
                    element={
                        <Layout>
                            <DishesPage />
                        </Layout>
                    }
                />
                <Route
                    path='/categories'
                    element={
                        <Layout>
                            <CategoryPage />
                        </Layout>
                    }
                />
                <Route
                    path='/sub-categories'
                    element={
                        <Layout>
                            <SubCategoryPage />
                        </Layout>
                    }
                />
                <Route
                    path='/my-restaurant'
                    element={
                        <Layout>
                            <AdminRestaurantPage />
                        </Layout>
                    }
                />
                <Route
                    path='/restaurant-orders'
                    element={
                        <Layout>
                            <RestaurantOrdersPage />
                        </Layout>
                    }
                />
                <Route
                    path='/register-restaurant'
                    element={<ResgisterRestaurantPage />}
                />
            </Route>
            <Route
                path='*'
                element={
                    <PageNotFound />
                }
            />
        </Routes >
    )
}

export default FoodAppRoutes;