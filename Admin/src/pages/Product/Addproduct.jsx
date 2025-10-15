import { React, useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { FaCloudUploadAlt } from "react-icons/fa";
import { PlusCircleOutlined, MinusCircleOutlined } from '@ant-design/icons';
import { Input, InputNumber, Select, Card, Button, Tooltip, Row, Col, Radio, Switch } from 'antd';
import { toast } from "react-toastify";
import * as yup from "yup";
import { useFormik } from "formik";
import { useDispatch, useSelector } from "react-redux";
import { getBrands } from "../../features/brand/brandSlice";
import { getTaxs } from "../../features/tax/taxSlice";
import { getUnits } from "../../features/unit/unitSlice";
import { getCategories } from "../../features/pcategory/pcategorySlice";
import { getSubcategorys } from "../../features/pcategory/subcategorySlice";
import Dropzone from "react-dropzone";
import { delImg, uploadImg } from "../../features/upload/uploadSlice";
import {
  createProducts,
  getAProduct,
  resetState,
  updateAProduct,
} from "../../features/product/productSlice";

const { Option } = Select;

// Dynamic schema based on product type
const getSchema = (productType) => {
  return yup.object().shape({
    title: yup.string().required("Title is Required"),
    brand: yup.string().required("Brand is Required"),
    category: yup.string().required("Category is Required"),
    subcategory: yup.string().required("Subcategory is required"),
    unit: yup.string().required("Unit is Required"),
    Producttype: yup.string().oneOf(["single", "variable"]).required("Product type is required"),
    // Single product fields
    ...(productType === "single" && {
      Barcode: yup.string().required("Barcode is required for single products"),
      mrp: yup.number().required("MRP is required").min(0, "MRP must be positive"),
      price: yup.number().required("Price is required").min(0, "Price must be positive"),
      tax: yup.number().required("Tax is required").min(0, "Tax must be positive"),
      taxprice: yup.number().required("Tax price is required").min(0, "Tax price must be positive"),
      cgst: yup.number().required("CGST is required").min(0, "CGST must be positive"),
      cgstprice: yup.number().required("CGST price is required").min(0, "CGST price must be positive"),
      sgst: yup.number().required("SGST is required").min(0, "SGST must be positive"),
      sgstprice: yup.number().required("SGST price is required").min(0, "SGST price must be positive"),
      Quantityalert: yup.number().required("Quantity alert is required").min(0, "Quantity alert must be positive"),
    }),
    // Variable product fields
    ...(productType === "variable" && {
      variants: yup.array().of(
        yup.object().shape({
          variant: yup.string().required("Variant is required"),
          mrp: yup.number().required("MRP is required").min(0, "MRP must be positive"),
          price: yup.number().required("Price is required").min(0, "Price must be positive"),
          tax: yup.number().required("Tax is required").min(0, "Tax must be positive"),
          taxprice: yup.number().required("Tax price is required").min(0, "Tax price must be positive"),
          cgst: yup.number().required("CGST is required").min(0, "CGST must be positive"),
          cgstprice: yup.number().required("CGST price is required").min(0, "CGST price must be positive"),
          sgst: yup.number().required("SGST is required").min(0, "SGST must be positive"),
          sgstprice: yup.number().required("SGST price is required").min(0, "SGST price must be positive"),
          Quantityalert: yup.number().min(0, "Quantity alert must be positive"),
          Barcode: yup.string().required("Barcode is required for variants"),
        })
      ).min(1, "At least one variant is required for variable products"),
    }),
  });
};

const Addproduct = () => {
  const dispatch = useDispatch();
  const location = useLocation();
  const getProductId = location.pathname.split("/")[3];
  const navigate = useNavigate();
  const [images, setImages] = useState([]);
  const [productType, setProductType] = useState("single");
  
  useEffect(() => {
    dispatch(getBrands());
    dispatch(getTaxs());
    dispatch(getCategories());
    dispatch(getUnits());
    dispatch(getSubcategorys());
  }, []);
  
  const [filteredSubcategories, setFilteredSubcategories] = useState([]);

  const brandState = useSelector((state) => state.brand.brands);
  const taxState = useSelector((state) => state.tax.taxs);
  const unitState = useSelector((state) => state.unit.units);
  const catState = useSelector((state) => state.pCategory.pCategories);
  const subcatState = useSelector((state) => state.subcategory.subcategories || []);
  const imgState = useSelector((state) => state?.upload?.images);
  const newProduct = useSelector((state) => state.product);
  
  const {
    isSuccess,
    isError,
    isLoading,
    createdProduct,
    updatedProduct,
    productName,
    productBrand,
    productCategory,
    productSubcategory,
    productImages,
    productUnit,
    productVariants,
    Producttype,
    Barcode,
    mrp,
    price,
    tax,
    taxprice,
    cgst,
    cgstprice,
    sgst,
    sgstprice,
    Quantityalert,
    status,
    Warranty
  } = newProduct;
  
  useEffect(() => {
    if (getProductId !== undefined) {
      dispatch(getAProduct(getProductId));
    } else {
      dispatch(resetState());
    }
  }, [getProductId]);
  
  useEffect(() => {
    if (Producttype) {
      setProductType(Producttype);
    }
  }, [Producttype]);

  useEffect(() => {
    if (isSuccess && createdProduct) {
      toast.success("Product Added Successfully!");
    }
    if (isSuccess && updatedProduct) {
      toast.success("Product Updated Successfully!");
      navigate("/admin/product");
    }
    if (isError) {
      toast.error("Something Went Wrong!");
    }
  }, [isSuccess, isError, isLoading, createdProduct, updatedProduct]);
  
  const img = [];
  imgState?.forEach((i) => {
    img.push({
      public_id: i.public_id,
      url: i.url,
    });
  });

  const imgshow = [];
  productImages?.forEach((i) => {
    imgshow.push({
      public_id: i.public_id,
      url: i.url,
    });
  });

  useEffect(() => {
    formik.values.images = img;
  }, [img]);

  // Calculate prices for single product
  const calculateSinglePrices = (values) => {
    const mrpValue = parseFloat(values.mrp) || 0;
    const taxValue = parseFloat(values.tax) || 0;

    const taxableAmount = (mrpValue * taxValue) / 100;
    const calculatedFinalPrice = mrpValue + taxableAmount;
    
    const cgstValue = taxValue / 2;
    const sgstValue = taxValue / 2;
    const cgstAmount = (mrpValue * cgstValue) / 100;
    const sgstAmount = (mrpValue * sgstValue) / 100;

    return {
      price: calculatedFinalPrice.toFixed(2),
      taxprice: taxableAmount.toFixed(2),
      cgst: cgstValue.toFixed(2),
      sgst: sgstValue.toFixed(2),
      cgstprice: cgstAmount.toFixed(2),
      sgstprice: sgstAmount.toFixed(2),
    };
  };

  // Calculate prices for variants
  const calculateVariantPrices = (variants, variantIndex) => {
    const mrp = parseFloat(variants[variantIndex].mrp) || 0;
    const tax = parseFloat(variants[variantIndex].tax) || 0;

    const taxableAmount = (mrp * tax) / 100;
    const calculatedFinalPrice = mrp + taxableAmount;
    
    const cgst = tax / 2;
    const sgst = tax / 2;
    const cgstAmount = (mrp * cgst) / 100;
    const sgstAmount = (mrp * sgst) / 100;

    return variants.map((v, i) => {
      if (i === variantIndex) {
        return {
          ...v,
          price: calculatedFinalPrice.toFixed(2),
          taxprice: taxableAmount.toFixed(2),
          cgst: cgst.toFixed(2),
          sgst: sgst.toFixed(2),
          cgstprice: cgstAmount.toFixed(2),
          sgstprice: sgstAmount.toFixed(2),
        };
      }
      return v;
    });
  };

  const formik = useFormik({
    enableReinitialize: true,
    initialValues: {
      title: productName || "",
      brand: productBrand || "",
      category: productCategory || "",
      subcategory: productSubcategory || "",
      unit: productUnit || "",
      images: productImages || [],
      Producttype: Producttype || "single",
      status: status !== undefined ? status : true,
      Warranty: Warranty || "",
      // Single product fields
      Barcode: Barcode || "",
      mrp: mrp || "",
      price: price || "",
      tax: tax || "",
      taxprice: taxprice || "",
      cgst: cgst || "",
      cgstprice: cgstprice || "",
      sgst: sgst || "",
      sgstprice: sgstprice || "",
      Quantityalert: Quantityalert || "",
      // Variable product fields
      variants: productVariants?.length > 0 
        ? productVariants.map(v => ({
            variant: v.variant || "",
            mrp: v.mrp || "",
            price: v.price || "",
            tax: v.tax || "",
            taxprice: v.taxprice || "",
            cgst: v.cgst || "",
            cgstprice: v.cgstprice || "",
            sgst: v.sgst || "",
            sgstprice: v.sgstprice || "",
            Quantityalert: v.Quantityalert || "",
            Barcode: v.Barcode || "",
            status: v.status !== undefined ? v.status : true,
          }))
        : [{
            variant: "",
            mrp: "",
            price: "",
            tax: "",
            taxprice: "",
            cgst: "",
            cgstprice: "",
            sgst: "",
            sgstprice: "",
            Quantityalert: "",
            Barcode: "",
            status: true,
          }]
    },
    validationSchema: getSchema(productType),
    onSubmit: (values) => {
      // Clean up data based on product type
      const submitData = { ...values };
      
      if (productType === "single") {
        // Remove variants for single products
        delete submitData.variants;
      } else {
        // Remove single product fields for variable products
        delete submitData.Barcode;
        delete submitData.mrp;
        delete submitData.price;
        delete submitData.tax;
        delete submitData.taxprice;
        delete submitData.cgst;
        delete submitData.cgstprice;
        delete submitData.sgst;
        delete submitData.sgstprice;
        delete submitData.Quantityalert;
      }

      if (getProductId !== undefined) {
        const data = { id: getProductId, productData: submitData };
        dispatch(updateAProduct(data));
      } else {
        dispatch(createProducts(submitData));
        formik.resetForm();
        setTimeout(() => {
          dispatch(resetState());
        }, 3000);
      }
    },
  });



useEffect(() => {
  if (formik.values.category && Array.isArray(catState) && Array.isArray(subcatState)) {
    const selectedCategory = catState.find(
      (cat) => cat.title === formik.values.category
    );
    if (selectedCategory) {
      const relatedSubcategories = subcatState.filter(
        (subcat) => subcat.categoryId === selectedCategory._id
      );
      setFilteredSubcategories(relatedSubcategories);
    } else {
      setFilteredSubcategories([]);
    }
  } else {
    setFilteredSubcategories([]);
  }
}, [formik.values.category, catState, subcatState]);

  const handleProductTypeChange = (type) => {
    setProductType(type);
    formik.setFieldValue("Producttype", type);
  };

  const handleSingleFieldChange = (field, value) => {
    formik.setFieldValue(field, value);
    
    // Recalculate prices for single product
    if (field === 'mrp' || field === 'tax') {
      const calculated = calculateSinglePrices({
        ...formik.values,
        [field]: value
      });
      Object.keys(calculated).forEach(key => {
        formik.setFieldValue(key, calculated[key]);
      });
    }
  };

  const handleVariantChange = (variantIndex, field, value) => {
    let variants = [...formik.values.variants];
    variants[variantIndex] = {
      ...variants[variantIndex],
      [field]: value
    };

    // Recalculate prices before setting the field value
    if (field === 'mrp' || field === 'tax') {
      variants = calculateVariantPrices(variants, variantIndex);
    }

    formik.setFieldValue("variants", variants);
  };

  const addVariant = () => {
    formik.setFieldValue("variants", [
      ...formik.values.variants,
      {
        variant: "",
        mrp: "",
        price: "",
        tax: "",
        taxprice: "",
        cgst: "",
        cgstprice: "",
        sgst: "",
        sgstprice: "",
        Quantityalert: "",
        Barcode: "",
        status: true,
      }
    ]);
  };

  const removeVariant = (index) => {
    if (formik.values.variants.length > 1) {
      const variants = [...formik.values.variants];
      variants.splice(index, 1);
      formik.setFieldValue("variants", variants);
    }
  };

  return (
    <>
      <h3 className="mb-4 title">
        {getProductId !== undefined ? "Edit" : "Add"} Product
      </h3>
      <div className="container-fluid">
        <div className="row">
          <div className="col-12">
            <div className="card shadow-sm">
              <div className="card-body">
                <form onSubmit={formik.handleSubmit}>
                  <div className="row g-4">
                    {/* Product Title */}
                    <div className="col-md-4">
                      <div className="form-group">
                        <label htmlFor="title" className="form-label fw-medium">Product Title*</label>
                        <input
                          type="text"
                          id="title"
                          className={`form-control ${formik.touched.title && formik.errors.title ? 'is-invalid' : formik.touched.title ? 'is-valid' : ''}`}
                          placeholder="Enter product title"
                          name="title"
                          onChange={formik.handleChange("title")}
                          onBlur={formik.handleBlur("title")}
                          value={formik.values.title}
                        />
                        {formik.touched.title && formik.errors.title && (
                          <div className="invalid-feedback">{formik.errors.title}</div>
                        )}
                      </div>
                    </div>

                    {/* Brand Selection */}
                    <div className="col-md-4">
                      <div className="form-group">
                        <label htmlFor="brand" className="form-label fw-medium">Brand*</label>
                        <select
                          id="brand"
                          name="brand"
                          className={`form-control ${formik.touched.brand && formik.errors.brand ? 'is-invalid' : formik.touched.brand ? 'is-valid' : ''}`}
                          onChange={formik.handleChange("brand")}
                          onBlur={formik.handleBlur("brand")}
                          value={formik.values.brand}
                        >
                          <option value="">Select Brand</option>
                          {brandState.map(
                            (brand) => brand.status &&
                              (
                            <option key={brand} value={brand.title}>{brand.title}</option>
                          ))}
                        </select>
                        {formik.touched.brand && formik.errors.brand && (
                          <div className="invalid-feedback">{formik.errors.brand}</div>
                        )}
                      </div>
                    </div>

                    {/* Category Selection */}
                    <div className="col-md-4">
                    <div className="form-group">
                      <label htmlFor="category" className="form-label fw-medium">
                        Category*
                      </label>
                      <select
                        id="category"
                        name="category"
                        className={`form-control ${
                          formik.touched.category && formik.errors.category
                            ? 'is-invalid'
                            : formik.touched.category
                            ? 'is-valid'
                            : ''
                        }`}
                        onChange={(e) => {
                          formik.handleChange(e);
                          formik.setFieldValue('subcategory', ''); // reset subcategory when category changes
                        }}
                        onBlur={formik.handleBlur}
                        value={formik.values.category}
                      >
                        <option value="">Select Category</option>
                        {catState.map(
                          (category, index) =>
                            category.status && (
                              <option key={index} value={category.title}>
                                {category.title}
                              </option>
                            )
                        )}
                      </select>
                      {formik.touched.category && formik.errors.category && (
                        <div className="invalid-feedback">{formik.errors.category}</div>
                      )}
                    </div>
                  </div>


                    {/* Subcategory Selection */}
                    <div className="col-md-4">
                    <div className="form-group">
                      <label htmlFor="subcategory" className="form-label fw-medium">
                        Subcategory
                      </label>
                      <select
                        id="subcategory"
                        name="subcategory"
                        className={`form-control ${
                          formik.touched.subcategory && formik.errors.subcategory
                            ? 'is-invalid'
                            : formik.touched.subcategory
                            ? 'is-valid'
                            : ''
                        }`}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        value={formik.values.subcategory}
                        disabled={!formik.values.category}
                      >
                        <option value="">Select Subcategory</option>
                        {filteredSubcategories.map(
                          (subcategory, index) =>
                            subcategory.status && (
                              <option key={index} value={subcategory.title}>
                                {subcategory.title}
                              </option>
                            )
                        )}
                      </select>
                      {formik.touched.subcategory && formik.errors.subcategory && (
                        <div className="invalid-feedback">{formik.errors.subcategory}</div>
                      )}
                    </div>
                  </div>


                    {/* Unit Selection */}
                    <div className="col-md-4">
                      <div className="form-group">
                        <label htmlFor="unit" className="form-label fw-medium">Unit*</label>
                        <select
                          id="unit"
                          name="unit"
                          className={`form-control ${formik.touched.unit && formik.errors.unit ? 'is-invalid' : formik.touched.unit ? 'is-valid' : ''}`}                     
                          onChange={formik.handleChange("unit")}
                          onBlur={formik.handleBlur("unit")}
                          value={formik.values.unit}
                        >
                          <option value="">Select Unit</option>
                          {unitState.map((i, j) => i.status &&(
                            <option key={j} value={i.title}>{i.title}</option>
                          ))}
                        </select>
                        {formik.touched.unit && formik.errors.unit && (
                          <div className="invalid-feedback">{formik.errors.unit}</div>
                        )}
                      </div>
                    </div>

                    {/* Status */}
                    <div className="col-md-4">
                      <div className="form-group">
                        <label className="form-label fw-medium">Status</label>
                        <div>
                          <Switch
                            checked={formik.values.status}
                            onChange={(checked) => formik.setFieldValue("status", checked)}
                            checkedChildren="Active"
                            unCheckedChildren="Inactive"
                          />
                        </div>
                      </div>
                    </div>
                    <div className="col-12">
                      <div className="form-group">
                        <label className="form-label fw-medium">Product Type*</label>
                        <div>
                          <Radio.Group 
                            value={productType} 
                            onChange={(e) => handleProductTypeChange(e.target.value)}
                            disabled={!!getProductId}
                          >
                            <Radio value="single">Single Product</Radio>
                            <Radio value="variable">Variable Product (with variants)</Radio>
                          </Radio.Group>
                        </div>
                      </div>
                    </div>
                    {/* Warranty */}
                    <div className="col-md-4">
                      <div className="form-group">
                        <label htmlFor="warranty" className="form-label fw-medium">Warranty</label>
                        <input
                          type="text"
                          id="warranty"
                          className="form-control"
                          placeholder="e.g., 1 Year"
                          name="warranty"
                          onChange={formik.handleChange("Warranty")}
                          onBlur={formik.handleBlur("Warranty")}
                          value={formik.values.Warranty}
                        />
                      </div>
                    </div>

                    {/* SINGLE PRODUCT FIELDS */}
                    {productType === "single" && (
                      <>
                       <div className="col-md-4">
                          <div className="form-group">
                            <label htmlFor="barcode" className="form-label fw-medium">Barcode*</label>
                            <div className="input-group">
                              <input
                                type="text"
                                id="barcode"
                                className={`form-control ${formik.touched.Barcode && formik.errors.Barcode
                                  ? 'is-invalid'
                                  : formik.touched.Barcode
                                  ? 'is-valid'
                                  : ''
                                }`}
                                placeholder="Enter barcode or click Generate"
                                name="Barcode"
                                value={formik.values.Barcode}
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                                readOnly
                              />
                              <button
                                type="button"
                                className="btn btn-outline-primary"
                                onClick={() => {
                                  // Generate 12-digit random number (numeric barcode)
                                  const randomBarcode = Math.floor(100000000000 + Math.random() * 900000000000).toString();
                                  formik.setFieldValue("Barcode", randomBarcode);
                                }}
                              >
                                Generate
                              </button>
                            </div>
                            {formik.touched.Barcode && formik.errors.Barcode && (
                              <div className="invalid-feedback">{formik.errors.Barcode}</div>
                            )}
                          </div>
                        </div>


                        <div className="col-md-4">
                          <div className="form-group">
                            <label htmlFor="mrp" className="form-label fw-medium">MRP*</label>
                            <InputNumber
                              id="mrp"
                              prefix="₹"
                              style={{ width: '100%' }}
                              placeholder="MRP"
                              value={formik.values.mrp}
                              min={0}
                              step={0.01}
                              onChange={(value) => handleSingleFieldChange('mrp', value)}
                              onBlur={formik.handleBlur("mrp")}
                              status={formik.touched.mrp && formik.errors.mrp ? 'error' : ''}
                            />
                            {formik.touched.mrp && formik.errors.mrp && (
                              <div className="text-danger small">{formik.errors.mrp}</div>
                            )}
                          </div>
                        </div>

                        <div className="col-md-4">
                          <div className="form-group">
                            <label htmlFor="tax" className="form-label fw-medium">Tax %*</label>
                            <select
                          id="tax"
                          name="tax"
                          className={`form-control ${formik.touched.tax && formik.errors.tax ? 'is-invalid' : formik.touched.tax ? 'is-valid' : ''}`}                     
                          onChange={formik.handleChange("tax")}
                          onBlur={formik.handleBlur("tax")}
                          value={formik.values.tax}
                        >
                          <option value="">Select Tax</option>
                          {taxState.map((i, j) => i.status &&(
                            <option key={j} value={i.title}>{i.title}</option>
                          ))}
                        </select>
                            {formik.touched.tax && formik.errors.tax && (
                              <div className="text-danger small">{formik.errors.tax}</div>
                            )}
                          </div>
                        </div>

                        <div className="col-md-4">
                          <div className="form-group">
                            <label className="form-label fw-medium">Tax Amount</label>
                            <Input prefix="₹" disabled value={formik.values.taxprice} />
                          </div>
                        </div>

                        <div className="col-md-4">
                          <div className="form-group">
                            <label className="form-label fw-medium">Selling Price</label>
                            <Input prefix="₹" disabled value={formik.values.price} />
                          </div>
                        </div>

                        <div className="col-md-4">
                          <div className="form-group">
                            <label htmlFor="quantityAlert" className="form-label fw-medium">Quantity Alert*</label>
                            <InputNumber
                              id="quantityAlert"
                              style={{ width: '100%' }}
                              placeholder="Minimum quantity"
                              value={formik.values.Quantityalert}
                              min={0}
                              onChange={(value) => handleSingleFieldChange('Quantityalert', value)}
                              onBlur={formik.handleBlur("Quantityalert")}
                              status={formik.touched.Quantityalert && formik.errors.Quantityalert ? 'error' : ''}
                            />
                            {formik.touched.Quantityalert && formik.errors.Quantityalert && (
                              <div className="text-danger small">{formik.errors.Quantityalert}</div>
                            )}
                          </div>
                        </div>
                      </>
                    )}

                    {/* VARIABLE PRODUCT FIELDS */}
                    {productType === "variable" && (
                      <div className="col-12 variant-section">
                        <h5 className="mb-3 text-lg font-semibold">Product Variants</h5>

                        {formik.values.variants.map((variant, index) => (
                          <Card key={index} size="small" className="mb-3">
                            <Row gutter={[16, 16]} align="middle">
                              <Col xs={24} sm={12} md={6} lg={4}>
                                <label className="form-label fw-medium">Variant*</label>
                                <Input
                                  placeholder="e.g., 500g"
                                  value={variant.variant}
                                  onChange={(e) => handleVariantChange(index, 'variant', e.target.value)}
                                  onBlur={formik.handleBlur(`variants[${index}].variant`)}
                                  status={
                                    formik.touched.variants?.[index]?.variant &&
                                    formik.errors.variants?.[index]?.variant
                                      ? 'error'
                                      : ''
                                  }
                                />
                              </Col>

                            <Col xs={24} sm={12} md={6} lg={4}>
                              <label className="form-label fw-medium">Barcode*</label>
                              <Input
                                placeholder="Barcode"
                                value={variant.Barcode}
                                onChange={(e) => handleVariantChange(index, 'Barcode', e.target.value)}
                                onBlur={formik.handleBlur(`variants[${index}].Barcode`)}
                                status={
                                  formik.touched.variants?.[index]?.Barcode &&
                                  formik.errors.variants?.[index]?.Barcode
                                    ? 'error'
                                    : ''
                                }
                                addonAfter={
                                  <Button
                                    type="dashed"
                                    size="small"
                                    onClick={() => {
                                      const generated = Math.floor(100000000000 + Math.random() * 900000000000).toString();
                                      handleVariantChange(index, 'Barcode', generated);
                                    }}
                                  >
                                    Auto
                                  </Button>
                                }
                              />
                              {formik.touched.variants?.[index]?.Barcode && formik.errors.variants?.[index]?.Barcode && (
                                <div className="text-danger small">{formik.errors.variants[index].Barcode}</div>
                              )}
                            </Col>
                            
                              <Col xs={24} sm={12} md={6} lg={4}>
                                <label className="form-label fw-medium">MRP*</label>
                                <InputNumber
                                  prefix="₹"
                                  style={{ width: '100%' }}
                                  placeholder="MRP"
                                  value={variant.mrp}
                                  min={0}
                                  step={0.01}
                                  onChange={(value) => handleVariantChange(index, 'mrp', value)}
                                  onBlur={formik.handleBlur(`variants[${index}].mrp`)}
                                  status={
                                    formik.touched.variants?.[index]?.mrp &&
                                    formik.errors.variants?.[index]?.mrp
                                      ? 'error'
                                      : ''
                                  }
                                />
                              </Col>

                              <Col xs={24} sm={12} md={6} lg={4}>
                                <label className="form-label fw-medium">Tax %*</label>
                                <select
                                  id={`variants[${index}].tax`}
                                  name={`variants[${index}].tax`}
                                  className={`form-control ${
                                    formik.touched.variants?.[index]?.tax && formik.errors.variants?.[index]?.tax
                                      ? 'is-invalid'
                                      : formik.touched.variants?.[index]?.tax
                                      ? 'is-valid'
                                      : ''
                                  }`}
                                  value={variant.tax}
                                  onChange={(e) => handleVariantChange(index, 'tax', e.target.value)}
                                  onBlur={formik.handleBlur}
                                >
                                  <option value="">Select Tax</option>
                                  {taxState.map(
                                    (taxItem, j) =>
                                      taxItem.status && (
                                        <option key={j} value={taxItem.title}>
                                          {taxItem.title}
                                        </option>
                                      )
                                  )}
                                </select>

                                {formik.touched.variants?.[index]?.tax && formik.errors.variants?.[index]?.tax && (
                                  <div className="text-danger small">{formik.errors.variants[index].tax}</div>
                                )}
                              </Col>


                              <Col xs={24} sm={12} md={6} lg={4}>
                                <label className="form-label fw-medium">Tax Amount</label>
                                <Input prefix="₹" disabled value={variant.taxprice} />
                              </Col>

                              <Col xs={24} sm={12} md={6} lg={4}>
                                <label className="form-label fw-medium">Price</label>
                                <Input prefix="₹" disabled value={variant.price} />
                              </Col>

                              <Col xs={24} sm={12} md={6} lg={4}>
                                <label className="form-label fw-medium">Qty Alert</label>
                                <InputNumber
                                  style={{ width: '100%' }}
                                  placeholder="Min quantity"
                                  value={variant.Quantityalert}
                                  min={0}
                                  onChange={(value) => handleVariantChange(index, 'Quantityalert', value)}
                                  onBlur={formik.handleBlur(`variants[${index}].Quantityalert`)}
                                />
                              </Col>

                              <Col xs={24} sm={12} md={6} lg={4} className="flex gap-2 items-end">
                                <div className="d-flex gap-2">
                                  {formik.values.variants.length > 1 && (
                                    <Tooltip title="Remove Variant">
                                      <Button
                                        danger
                                        type="text"
                                        icon={<MinusCircleOutlined />}
                                        onClick={() => removeVariant(index)}
                                      />
                                    </Tooltip>
                                  )}
                                  {index === formik.values.variants.length - 1 && (
                                    <Tooltip title="Add Variant">
                                      <Button
                                        type="dashed"
                                        icon={<PlusCircleOutlined />}
                                        onClick={addVariant}
                                      />
                                    </Tooltip>
                                  )}
                                </div>
                              </Col>
                            </Row>
                          </Card>
                        ))}

                        {formik.touched.variants && formik.errors.variants && typeof formik.errors.variants === 'string' && (
                          <div className="text-danger">{formik.errors.variants}</div>
                        )}
                      </div>
                    )}

                    {/* Image Upload */}
                    <div className="col-12">     
                      <Dropzone 
                        onDrop={(acceptedFiles) => {
                          dispatch(uploadImg(acceptedFiles));
                        }}
                        accept="image/*"
                        maxSize={5 * 1024 * 1024}
                      >
                        {({ getRootProps, getInputProps, isDragActive }) => (
                          <div 
                            {...getRootProps()}
                            className={`dropzone-card ${isDragActive ? 'active' : ''}`}
                          >
                            <input {...getInputProps()} />
                            <label htmlFor="image" className="form-label fw-medium">Product Images*</label>
                            <div className="upload-container">
                              <FaCloudUploadAlt className="upload-icon" />
                              <p className="upload-text">Drag & Drop or Click to Upload</p>
                            </div>
                          </div>
                        )}
                      </Dropzone>
                        
                      <div className="showimages d-flex flex-wrap gap-3 mt-3">
                        {/* Show uploaded images from server */}
                        {imgshow?.map((image, index) => (
                          <div className="position-relative" key={`imgshow-${index}`}>
                            <button
                              type="button"
                              onClick={() => dispatch(delImg(image.public_id))}
                              className="btn-close position-absolute"
                              style={{ top: "10px", right: "10px" }}
                            ></button>
                            <img src={image.url} alt="" width={200} height={200} />
                          </div>
                        ))}
                        
                        {imgState?.map((image, index) => (
                          <div className="position-relative" key={`imgState-${index}`}>
                            <button
                              type="button"
                              onClick={() => dispatch(delImg(image.public_id))}
                              className="btn-close position-absolute"
                              style={{ top: "10px", right: "10px" }}
                            ></button>
                            <img src={image.url} alt="" width={200} height={200} />
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Submit Button */}
                    <div className="col-12 mt-4">
                      <button
                        className="btn btn-primary px-4 py-2"
                        type="submit"
                        disabled={formik.isSubmitting}
                      >
                        {formik.isSubmitting ? (
                          <>
                            <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                            Processing...
                          </>
                        ) : (
                          <>
                            <i className="bi bi-check-circle me-2"></i>
                            {getProductId !== undefined ? "Update" : "Save"} Product
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Addproduct;