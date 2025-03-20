const { db } = require("../config/firebase");
const { encryptData, decryptData } = require("../utils/encryption");
const { productCache } = require("../utils/cache");
const { logChange, logError } = require("../utils/logger");

// Collection references
const productsCollection = db.collection("products");
const categoriesCollection = db.collection("categories");

// Cache TTL in milliseconds (30 minutes)
const CACHE_TTL = 30 * 60 * 1000;

/**
 * Get all products with optional filtering
 */
const getAllProducts = async (req, res) => {
  try {
    const cacheKey = "all-products";

    // Check cache first
    if (productCache.has(cacheKey)) {
      return res.render("products/index", {
        products: productCache.get(cacheKey),
        title: "Products Management",
      });
    }

    // Fetch from database
    const productsSnapshot = await productsCollection.get();
    const products = [];

    productsSnapshot.forEach((doc) => {
      const productData = doc.data();
      products.push({
        id: doc.id,
        ...productData,
      });
    });

    // Store in cache
    productCache.set(cacheKey, products, CACHE_TTL);

    res.render("products/index", {
      products,
      title: "Products Management",
    });
  } catch (error) {
    logError("Error fetching products", error);
    res.status(500).render("error", {
      message: "Failed to fetch products",
      error,
    });
  }
};

/**
 * Get a single product by ID
 */
const getProductById = async (req, res) => {
  try {
    const productId = req.params.id;
    const cacheKey = `product-${productId}`;

    // Check cache first
    if (productCache.has(cacheKey)) {
      const product = productCache.get(cacheKey);
      return res.render("products/detail", { product });
    }

    // Fetch from database
    const productDoc = await productsCollection.doc(productId).get();

    if (!productDoc.exists) {
      return res.status(404).render("error", {
        message: "Product not found",
      });
    }

    const product = {
      id: productDoc.id,
      ...productDoc.data(),
    };

    // Store in cache
    productCache.set(cacheKey, product, CACHE_TTL);

    res.render("products/detail", { product });
  } catch (error) {
    logError("Error fetching product", error, { productId: req.params.id });
    res.status(500).render("error", {
      message: "Failed to fetch product",
      error,
    });
  }
};

/**
 * Create a new product
 */
const createProduct = async (req, res) => {
  try {
    const { name, description, price, stock, categoryId, ...otherFields } = req.body;

    // Validate required fields
    if (!name || !price) {
      return res.status(400).send("Name and price are required");
    }

    // Create product object
    const productData = {
      name,
      description: description || "",
      price: Number.parseFloat(price),
      stock: Number.parseInt(stock || 0, 10),
      categoryId: categoryId || null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      ...otherFields,
    };

    // Encrypt sensitive data if needed
    if (process.env.ENCRYPT_PRODUCT_DATA === "true" && process.env.ENCRYPTION_KEY) {
      productData.description = encryptData(productData.description, process.env.ENCRYPTION_KEY);
    }

    // Add to database
    const docRef = await productsCollection.add(productData);

    // Invalidate cache
    productCache.delete("all-products");

    // Log the change
    logChange("create", "product", req.cookies?.adminId || "unknown", {
      productId: docRef.id,
      productName: name,
    });

    res.redirect("/admin/products");
  } catch (error) {
    logError("Error creating product", error, { productData: req.body });
    res.status(500).render("error", {
      message: "Failed to create product",
      error,
    });
  }
};

/**
 * Update an existing product
 */
const updateProduct = async (req, res) => {
  try {
    const productId = req.params.id;
    const { name, description, price, stock, categoryId, ...otherFields } = req.body;

    // Validate required fields
    if (!name || !price) {
      return res.status(400).send("Name and price are required");
    }

    // Create update object
    const updateData = {
      name,
      description: description || "",
      price: Number.parseFloat(price),
      stock: Number.parseInt(stock || 0, 10),
      categoryId: categoryId || null,
      updatedAt: new Date().toISOString(),
      ...otherFields,
    };

    // Encrypt sensitive data if needed
    if (process.env.ENCRYPT_PRODUCT_DATA === "true" && process.env.ENCRYPTION_KEY) {
      updateData.description = encryptData(updateData.description, process.env.ENCRYPTION_KEY);
    }

    // Update in database
    await productsCollection.doc(productId).update(updateData);

    // Invalidate cache
    productCache.delete(`product-${productId}`);
    productCache.delete("all-products");

    // Log the change
    logChange("update", "product", req.cookies?.adminId || "unknown", {
      productId,
      productName: name,
    });

    res.redirect("/admin/products");
  } catch (error) {
    logError("Error updating product", error, {
      productId: req.params.id,
      updateData: req.body,
    });
    res.status(500).render("error", {
      message: "Failed to update product",
      error,
    });
  }
};

/**
 * Delete a product
 */
const deleteProduct = async (req, res) => {
  try {
    const productId = req.params.id;

    // Get product details for logging
    const productDoc = await productsCollection.doc(productId).get();
    if (!productDoc.exists) {
      return res.status(404).send("Product not found");
    }

    const productData = productDoc.data();

    // Delete from database
    await productsCollection.doc(productId).delete();

    // Invalidate cache
    productCache.delete(`product-${productId}`);
    productCache.delete("all-products");

    // Log the change
    logChange("delete", "product", req.cookies?.adminId || "unknown", {
      productId,
      productName: productData.name,
    });

    res.redirect("/admin/products");
  } catch (error) {
    logError("Error deleting product", error, { productId: req.params.id });
    res.status(500).render("error", {
      message: "Failed to delete product",
      error,
    });
  }
};

/**
 * Apply bulk discount to multiple products
 */
const applyBulkDiscount = async (req, res) => {
  try {
    const { productIds, discountType, discountValue, discountExpiry } = req.body;

    if (!productIds || !Array.isArray(productIds) || productIds.length === 0) {
      return res.status(400).json({ success: false, message: "No products selected" });
    }

    if (!discountType || !discountValue) {
      return res.status(400).json({ success: false, message: "Discount type and value are required" });
    }

    if (!discountType || !discountValue) {
      return res.status(400).json({ success: false, message: "Discount type and value are required" });
    }

    // Validate discount value
    const value = Number.parseFloat(discountValue);
    if (isNaN(value) || value <= 0) {
      return res.status(400).json({ success: false, message: "Invalid discount value" });
    }

    // If percentage discount, validate it's not over 100%
    if (discountType === "percentage" && value > 100) {
      return res.status(400).json({ success: false, message: "Percentage discount cannot exceed 100%" });
    }

    // Process each product
    const batch = db.batch();
    const updatedProducts = [];

    for (const productId of productIds) {
      const productRef = productsCollection.doc(productId);

      updatedProducts.push({
        id: productId,
        discountType,
        discountValue: value,
        discountExpiry: discountExpiry || null,
      });

      batch.update(productRef, {
        discountType,
        discountValue: value,
        discountExpiry: discountExpiry || null,
        updatedAt: new Date().toISOString(),
      });
    }

    // Commit the batch
    await batch.commit();

    // Invalidate cache
    productCache.delete("all-products");
    productIds.forEach((id) => productCache.delete(`product-${id}`));

    // Log the change
    logChange("bulk-discount", "product", req.cookies?.adminId || "unknown", {
      productIds,
      discountType,
      discountValue: value,
      discountExpiry,
    });

    res.json({
      success: true,
      message: `Discount applied to ${productIds.length} products`,
      updatedProducts,
    });
  } catch (error) {
    logError("Error applying bulk discount", error, {
      productIds: req.body.productIds,
      discountData: req.body,
    });
    res.status(500).json({
      success: false,
      message: "Failed to apply discount",
      error: error.message,
    });
  }
};

/**
 * Delete multiple products at once
 */
const bulkDeleteProducts = async (req, res) => {
  try {
    const { productIds } = req.body;

    if (!productIds || !Array.isArray(productIds) || productIds.length === 0) {
      return res.status(400).json({ success: false, message: "No products selected" });
    }

    // Process each product
    const batch = db.batch();

    for (const productId of productIds) {
      const productRef = productsCollection.doc(productId);
      batch.delete(productRef);
    }

    // Commit the batch
    await batch.commit();

    // Invalidate cache
    productCache.delete("all-products");
    productIds.forEach((id) => productCache.delete(`product-${id}`));

    // Log the change
    logChange("bulk-delete", "product", req.cookies?.adminId || "unknown", {
      productIds,
      count: productIds.length,
    });

    res.json({
      success: true,
      message: `${productIds.length} products deleted successfully`,
      deletedIds: productIds,
    });
  } catch (error) {
    logError("Error bulk deleting products", error, { productIds: req.body.productIds });
    res.status(500).json({
      success: false,
      message: "Failed to delete products",
      error: error.message,
    });
  }
};

/**
 * Get products filtered by stock status
 */
const getProductsByStockStatus = async (req, res) => {
  try {
    const { status } = req.params;
    let query = productsCollection;

    if (status === "out-of-stock") {
      query = query.where("stock", "==", 0);
    } else if (status === "low-stock") {
      // Assuming low stock is less than 10
      query = query.where("stock", ">", 0).where("stock", "<", 10);
    }

    const productsSnapshot = await query.get();
    const products = [];

    productsSnapshot.forEach((doc) => {
      products.push({
        id: doc.id,
        ...doc.data(),
      });
    });

    res.render("products/index", {
      products,
      title: `Products - ${status.replace("-", " ").toUpperCase()}`,
      filterStatus: status,
    });
  } catch (error) {
    logError("Error fetching products by stock status", error, { status: req.params.status });
    res.status(500).render("error", {
      message: "Failed to fetch products",
      error,
    });
  }
};

module.exports = {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  applyBulkDiscount,
  bulkDeleteProducts,
  getProductsByStockStatus,
};
