import "./App.css";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import MainLayout from "./components/MainLayout";
import Dashboard from "./pages/Dashboard";
import Category from "./pages/Catalogue/Category";
import SubCategory from "./pages/Catalogue/Subcategory";
import Brand from "./pages/Catalogue/Brand";
import Tax from "./pages/Catalogue/Tax";
import Unit from "./pages/Catalogue/Unit"
import Productlist from "./pages/Product/Productlist";
import Addproduct from "./pages/Product/Addproduct";
import Coupon from "./pages/Coupon";
import Createlogins from "./pages/Create-logins";
import ExpanceCategory from "./pages/Category/ExpanceCategory";
import Salestype from "./pages/Category/Salestype";
import { OpenRoutes } from "./routing/OpenRoutes";
import { PrivateRoutes } from "./routing/PrivateRoutes";
import Profile from "./pages/Profile";
import Orders from "./pages/Orders";
import Customers from "./pages/Customers";
import Notfound from "./pages/Notfound";


function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={ <OpenRoutes>   <Login /> </OpenRoutes> } />
        <Route path="register" element={  <OpenRoutes>  <Register /> </OpenRoutes> } />
        
        <Route path="/admin"  element={   <PrivateRoutes> <MainLayout /> </PrivateRoutes> } >
          <Route index element={<Dashboard />} />
          <Route path="coupon" element={<Coupon />} />
          <Route path="orders" element={<Orders />} />
          <Route path="customers" element={<Customers />} />
          <Route path="category" element={<Category />} />
          <Route path="subcategory" element={<SubCategory/>} />
          <Route path="brand" element={<Brand />} />
          <Route path="tax" element={<Tax />} />
          <Route path="unit" element={<Unit />} />
          <Route path="create-logins" element={<Createlogins/>} />
          <Route path="product" element={<Productlist />} />
          <Route path="add-product" element={<Addproduct />} />
          <Route path="update-product/:id" element={<Addproduct />} />
          <Route path="profile" element={ <Profile /> } />
          <Route path="profile/:id" element={ <Profile /> } />
          <Route path="Salestype" element={ <Salestype /> } />
          <Route path="expance" element={<ExpanceCategory />} />
        </Route>
        <Route path="*" element={ <Notfound /> }/>
      </Routes>
    </Router>
  );
}

export default App;
