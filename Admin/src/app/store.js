import { configureStore } from "@reduxjs/toolkit";
import authReducer from "../features/auth/authSlice";
import salesReducer from "../features/sales/salesSlice";
import customerReducer from "../features/cutomers/customerSlice";
import productReducer from "../features/product/productSlice";
import brandReducer from "../features/brand/brandSlice";
import taxReducer from "../features/tax/taxSlice";
import expanceReducer from "../features/ecategory/expanceSlice";
import unitReducer from "../features/unit/unitSlice";
import pCategoryReducer from "../features/pcategory/pcategorySlice";
import subCategoryReducer from "../features/pcategory/subcategorySlice";
import uploadReducer from "../features/upload/uploadSlice";
import couponReducer from "../features/coupon/couponSlice";
import attenderReducer from "../features/attender/attenderSlice";
import StoreReducer from "../features/store/storeSlice";
import SalestyoeReducer from "../features/salestype/salestypeSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    customer: customerReducer,
    sales: salesReducer,
    product: productReducer,
    brand: brandReducer,
    expance: expanceReducer,
    tax: taxReducer,
    pCategory: pCategoryReducer,
    subcategory: subCategoryReducer,
    upload: uploadReducer,
    coupon: couponReducer,
    unit:unitReducer,
    attender:attenderReducer,
    store:StoreReducer,
    salestype:SalestyoeReducer,
  },
});
