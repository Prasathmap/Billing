const Product = require("../models/productModel");
const User = require("../models/UserModel");
const asyncHandler = require("express-async-handler");
const slugify = require("slugify");
const validateMongoDbId = require("../utils/validateMongodbId");


const createProduct = asyncHandler(async (req, res) => {
  try {
    const adminId = req.user.id;
    if (req.body.title) {
      req.body.slug = slugify(req.body.title);
    }
    req.body.createdBy = adminId; // Store the admin ID

    const newProduct = await Product.create(req.body);
    res.json(newProduct);
  } catch (error) {
     if (error.code === 11000) {
      return res.status(400).json({ message: "Product already exists" });
    }
    res.status(500).json({ message: error.message });
  }
});


const updateProduct = asyncHandler(async (req, res) => {
  const { id } = req.params;
  validateMongoDbId(id);
  try {
    if (req.body.title) {
      req.body.slug = slugify(req.body.title);
    }
    const updateProduct = await Product.findByIdAndUpdate(id, req.body, {
      new: true,
    });
    res.json(updateProduct);
  } catch (error) {
    throw new Error(error);
  }
});

const deleteProduct = asyncHandler(async (req, res) => {
  const { id } = req.params;
  validateMongoDbId(id);
  try {
    const deletedProduct = await Product.findByIdAndDelete(id);

    res.json(deletedProduct);
  } catch (error) {
    throw new Error(error);
  }
});
// Get all categories
const allProduct = asyncHandler(async (req, res) => {
  try {
    const allProduct = await Product.find();
    res.json(allProduct);
  } catch (error) {
    res.status(500);
    throw new Error(error.message);
  }
});

const getaProduct = asyncHandler(async (req, res) => {
  const { id } = req.params;
  validateMongoDbId(id);
  try {
    const findProduct = await Product.findById(id);
    res.json(findProduct);
  } catch (error) {
    throw new Error(error);
  }
});

const getAllProduct = asyncHandler(async (req, res) => {
  try {
    const { _id, role } = req.user;
    let products;

    if (role === "admin") {
      products = await Product.find({ createdBy: _id }).populate("title");
    } else if (role === "pos") {
      const pos = await User.findById(_id);
      if (!pos) {
        res.status(404);
        throw new Error("pos not found");
      }

      const adminId = pos.createdBy;
      if (!adminId) {
        res.status(400);
        throw new Error("pos has no assigned admin");
      }

      products = await Product.find({ createdBy: adminId }).populate("title");
    }
    else if (role === "grn") {
      const grn = await User.findById(_id);
      if (!grn) {
        res.status(404);
        throw new Error("grn not found");
      }

      const adminId = grn.createdBy;
      if (!adminId) {
        res.status(400);
        throw new Error("grn has no assigned admin");
      }

      products = await Product.find({ createdBy: adminId }).populate("title");
    }
    else {
      res.status(403);
      throw new Error("Unauthorized access");
    }

    res.json(products);
  } catch (error) {
    console.error("Error in getallCategory:", error);
    res.status(500).json({ message: error.message });
  }
  });
  
  const getstatus = asyncHandler(async (req, res) => {
    const { id } = req.params;
    validateMongoDbId(id); 
  
    try {
      const product = await Product.findById(id);
      if (!product) {
        return res.status(404).json({ message: "product not found" });
      }
  
      const updated = await Product.findByIdAndUpdate(
        id,
        { status: !product.status }, // ✅ Correct field name
        { new: true }
      );
  
      res.json({ data: updated });
    } catch (error) {
      console.error("Error toggling product status:", error);
      res.status(500).json({ message: error.message });
    }
  });
const updateVariantStatus = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const { variants } = req.body;

    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    product.variants = variants;
    await product.save();

    res.status(200).json(product);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = {
  createProduct,
  getaProduct,
  allProduct,
  updateVariantStatus,
  getAllProduct,
  updateProduct,
  deleteProduct,
  getstatus,
};
