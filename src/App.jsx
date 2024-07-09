import FoodAppRoutes from './routes'
import axios from "axios"

function App() {
  axios.interceptors.request.use(
    function (config) {
      config.withCredentials = true;
      return config;
    },
    function (error) {
      return Promise.reject(error);
    }
  );
  return (
    <FoodAppRoutes />
  )
}

export default App
