const express = require("express");
const router = express.Router();
const verifyAdmin = require("../middlewares/verifyAdmin");
const { validateRequest, logApiAccess } = require("../middlewares/securityMiddleware");
const productController = require("../controllers/productController");

// Apply middleware to all routes
router.use(verifyAdmin);
router.use(validateRequest);
router.use(logApiAccess);

// Product routes
router.get("/products", productController.getAllProducts);
router.get("/products/stock/:status", productController.getProductsByStockStatus);
router.get("/products/:id", productController.getProductById);
router.post("/products", productController.createProduct);
router.post("/products/:id", productController.updateProduct);
router.post("/products/:id/delete", productController.deleteProduct);

// Bulk operations
router.post("/products/bulk-discount", productController.applyBulkDiscount);
router.post("/products/bulk-delete", productController.bulkDeleteProducts);

module.exports = router;
