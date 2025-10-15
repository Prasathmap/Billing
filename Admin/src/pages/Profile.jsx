import { React, useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import stateData from "../data/pincode_IN.json";
import { FaCloudUploadAlt } from "react-icons/fa";
import { toast } from "react-toastify";
import * as yup from "yup";
import { useFormik } from "formik";
import { useDispatch, useSelector } from "react-redux";
import Dropzone from "react-dropzone";
import { delImg, uploadImg } from "../features/upload/uploadSlice";
import {
  CreateProfile,
  UpdateProfile,
  getProfiles,
} from "../features/auth/authSlice";

let schema = yup.object().shape({
    storeName: yup.string().required("Store Name is required"),
    address: yup.string().required("Store address is required"),
    state: yup.string().required("State is required"),
    city: yup.string().required("City is required"),
    village: yup.string().required("Village is required"),
    pincode: yup.string().required("Pincode is required"),
    pancard: yup.string().matches(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/, "Enter a valid PAN number (e.g., ABCDE1234F)").required("PAN is required"),
    gstno: yup.string().matches(/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/, "Enter a valid GST number (e.g., 22ABCDE1234F1Z5)").required("GST is required"),
});

const Addprofile = () => {
  const dispatch = useDispatch();
  const location = useLocation();
  const getProfileId = location.pathname.split("/")[3];
  const navigate = useNavigate();
  const [images, setImages] = useState([]);
  const [cities, setCities] = useState([]);
  const [villages, setVillages] = useState([]);
  const [pincode, setPincode] = useState("");
  const { profiles } = useSelector((state) => state.auth);

  const profile = profiles?.length > 0 ? profiles[0] : null;
  const isEditing = Boolean(profile);

  const imgState = useSelector((state) => state?.upload?.images);
  const newProfile = useSelector((state) => state?.auth || {}); // Added safety check
  
  // Added default values for destructuring
  const {
    isSuccess,
    isError,
    isLoading,
    CreatedProfile,
    updatedProfile,
    logoImages,
  } = newProfile;
 
  useEffect(() => {
    if (isSuccess && CreatedProfile) {
      toast.success("Profile Add Successfullly!");
    }
    if (isSuccess && updatedProfile) {
      toast.success("Updated Successfullly!");
      navigate("/admin/profile");
    }
    if (isError) {
      toast.error("Something Went Wrong!");
    }
  }, [isSuccess, isError, isLoading, CreatedProfile, updatedProfile, navigate]);
  
  const img = [];
  imgState?.forEach((i) => {
    img.push({
      public_id: i.public_id,
      url: i.url,
    });
  });

  const imgshow = [];
  logoImages?.forEach((i) => {
    imgshow.push({
      public_id: i.public_id,
      url: i.url,
    });
  });

  useEffect(() => {
    formik.values.images = img;
  }, [img]);
  
  const formik = useFormik({
    enableReinitialize: true,
    initialValues: {
      storeName: profile?.storeName || "",
      pancard: profile?.pancard || "",
      gstno: profile?.gstno || "",
      address: profile?.address || "",
      state: profile?.state || "",
      city: profile?.city || "",
      village: profile?.village || "",
      pincode: profile?.pincode || "",
      images: profile?.logoImages || [],

    },
    enableReinitialize: true,
    validationSchema: schema,
    onSubmit: (values) => {
      if (isEditing) {
        dispatch(UpdateProfile({ id: profile.id, profileData: values }));
      } else {
        dispatch(CreateProfile(values));
      }
    },
  });
 useEffect(() => {
    dispatch(getProfiles());
  }, [dispatch]);

  const handleStateChange = (value) => {
    formik.setFieldValue("state", value);
    formik.setFieldValue("city", "");
    formik.setFieldValue("village", "");
    setCities(Object.keys(stateData[value] || {}));
    setVillages([]);
    setPincode("");
  };

  const handleCityChange = (value) => {
    formik.setFieldValue("city", value);
    formik.setFieldValue("village", "");
    setVillages(Object.keys(stateData[formik.values.state]?.[value] || {}));
    setPincode("");
  };

  const handleVillageChange = (value) => {
    formik.setFieldValue("village", value);
    const selectedPincode = stateData[formik.values.state]?.[formik.values.city]?.[value] || "";
    formik.setFieldValue("pincode", selectedPincode);
    setPincode(selectedPincode);
  };

  return (
    <>
      <h3 className="mb-4 title">
      <h3>{isEditing}</h3>
        Store Information
      </h3>
      <div className="container-fluid">
        <div className="row">
          <div className="col-12">
            <div className="card shadow-sm">
              <div className="card-body">
                <form onSubmit={formik.handleSubmit}>
                  <div className="row g-4">
                  <div className="col-md-4">
                  <div className="form-group">
                    <label htmlFor="title" className="form-label fw-medium">Store Name*</label>
                    <input
                      type="text"
                      id="storeName"
                      className={`form-control ${formik.touched.storeName && formik.errors.storeName ? 'is-invalid' : formik.touched.storeName ? 'is-valid' : ''}`}                 
                      placeholder="Enter Store Name"
                      name="storeName"
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      value={formik.values.storeName}
                    />
                    {formik.touched.storeName && formik.errors.storeName && (
                      <div className="invalid-feedback">{formik.errors.storeName}</div>
                    )}
                  </div>
                </div>

                <div className="col-md-4">
                  <div className="form-group">
                    <label htmlFor="price" className="form-label fw-medium">Pancard*</label>                     
                      <input
                        type="text"
                        id="pancard"
                        className={`form-control ${formik.touched.pancard && formik.errors.pancard ? 'is-invalid' : formik.touched.pancard ? 'is-valid' : ''}`}                     
                        placeholder="Enter pancard"
                        name="pancard"
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        value={formik.values.pancard}
                       
                      />

                    {formik.touched.pancard && formik.errors.pancard && (
                      <div className="invalid-feedback">{formik.errors.pancard}</div>
                    )}
                  </div>
                </div>
                <div className="col-md-4">
                  <div className="form-group">
                    <label htmlFor="title" className="form-label fw-medium">GST No*</label>
                    <input
                      type="text"
                      id="gstno"
                      className={`form-control ${formik.touched.gstno && formik.errors.gstno ? 'is-invalid' : formik.touched.gstno ? 'is-valid' : ''}`}                 
                      placeholder="Enter GST No"
                      name="gstno"
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      value={formik.values.gstno}
                    />
                    {formik.touched.gstno && formik.errors.gstno && (
                      <div className="invalid-feedback">{formik.errors.gstno}</div>
                    )}
                  </div>
                </div>
               
                <div className="col-md-4">
                  <div className="form-group">
                    <label htmlFor="title" className="form-label fw-medium">Address*</label>
                    <input
                      type="text"
                      id="address"
                      className={`form-control ${formik.touched.address && formik.errors.address ? 'is-invalid' : formik.touched.address ? 'is-valid' : ''}`}                 
                      placeholder="Enter Address"
                      name="address"
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      value={formik.values.address}
                    />
                    {formik.touched.address && formik.errors.address && (
                      <div className="invalid-feedback">{formik.errors.address}</div>
                    )}
                  </div>
                </div>
                
              
                    {/* State Dropdown */}
                    <div className="col-md-4">
                      <div className="form-group">
                        <label htmlFor="state" className="form-label fw-medium">State*</label>
                        <select
                          id="state"
                          className={`form-select ${formik.touched.state && formik.errors.state ? 'is-invalid' : formik.touched.state ? 'is-valid' : ''}`}
                          name="state"
                          onChange={(e) => handleStateChange(e.target.value)}
                          onBlur={formik.handleBlur}
                          value={formik.values.state}
                        >
                          <option value="">Select State</option>
                          {Object.keys(stateData).map((state) => (
                            <option key={state} value={state}>
                              {state}
                            </option>
                          ))}
                        </select>
                        {formik.touched.state && formik.errors.state && (
                          <div className="invalid-feedback">{formik.errors.state}</div>
                        )}
                      </div>
                    </div>

                    {/* City Dropdown */}
                    <div className="col-md-4">
                      <div className="form-group">
                        <label htmlFor="city" className="form-label fw-medium">City*</label>
                        <select
                          id="city"
                          className={`form-select ${formik.touched.city && formik.errors.city ? 'is-invalid' : formik.touched.city ? 'is-valid' : ''}`}
                          name="city"
                          onChange={(e) => handleCityChange(e.target.value)}
                          onBlur={formik.handleBlur}
                          value={formik.values.city}
                          disabled={!formik.values.state}
                        >
                          <option value="">Select City</option>
                          {cities.map((city) => (
                            <option key={city} value={city}>
                              {city}
                            </option>
                          ))}
                        </select>
                        {formik.touched.city && formik.errors.city && (
                          <div className="invalid-feedback">{formik.errors.city}</div>
                        )}
                      </div>
                    </div>

                    {/* Village Dropdown */}
                    <div className="col-md-4">
                      <div className="form-group">
                        <label htmlFor="village" className="form-label fw-medium">Village*</label>
                        <select
                          id="village"
                          className={`form-select ${formik.touched.village && formik.errors.village ? 'is-invalid' : formik.touched.village ? 'is-valid' : ''}`}
                          name="village"
                          onChange={(e) => handleVillageChange(e.target.value)}
                          onBlur={formik.handleBlur}
                          value={formik.values.village}
                          disabled={!formik.values.city}
                        >
                          <option value="">Select Village</option>
                          {villages.map((village) => (
                            <option key={village} value={village}>
                              {village}
                            </option>
                          ))}
                        </select>
                        {formik.touched.village && formik.errors.village && (
                          <div className="invalid-feedback">{formik.errors.village}</div>
                        )}
                      </div>
                    </div>

                    {/* Pincode Input */}
                    <div className="col-md-4">
                      <div className="form-group">
                        <label htmlFor="pincode" className="form-label fw-medium">Pincode*</label>
                        <input
                          type="text"
                          id="pincode"
                          className={`form-control ${formik.touched.pincode && formik.errors.pincode ? 'is-invalid' : formik.touched.pincode ? 'is-valid' : ''}`}
                          placeholder="Pincode"
                          name="pincode"
                          onChange={formik.handleChange}
                          onBlur={formik.handleBlur}
                          value={formik.values.pincode}
                          readOnly
                        />
                        {formik.touched.pincode && formik.errors.pincode && (
                          <div className="invalid-feedback">{formik.errors.pincode}</div>
                        )}
                      </div>
                    </div>

                    {/* Image Upload */}
                <div className="col-md-6">     
                    <Dropzone 
                      onDrop={(acceptedFiles) => {
                        dispatch(uploadImg(acceptedFiles));
                        // Create previews for local files before upload completes
                        const previews = acceptedFiles.map(file => ({
                          url: URL.createObjectURL(file),
                          public_id: file.name, // temporary ID
                          isLocal: true // flag for local files
                        }));
                        // Dispatch or set state with these previews
                      }}
                      accept="image/*"
                      maxSize={5 * 1024 * 1024} // Fixed: 5MB in bytes (was 5KB before)
                    >
                      {({ getRootProps, getInputProps, isDragActive }) => (
                        <div 
                          {...getRootProps()}
                          className={`dropzone-card ${isDragActive ? 'active' : ''}`}
                        >
                          <input {...getInputProps()} />
                          <label htmlFor="image" className="form-label fw-medium">Image*</label>
                          <div className="upload-container">
                            <FaCloudUploadAlt className="upload-icon" />
                            <p className="upload-text">Drag & Drop or Click to Upload</p>
                          </div>
                        </div>
                      )}
                    </Dropzone>
                      
                      <div className="showimages d-flex flex-wrap gap-3">
                        
                        
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

                    <div className="col-10 mt-8">
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
                         Profile
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

export default Addprofile;