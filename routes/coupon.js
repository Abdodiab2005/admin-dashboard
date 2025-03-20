const express = require("express");
const router = express.Router();
const { admin, db } = require("../utils/firebase");
const { Timestamp } = admin.firestore;
const verifyAdmin = require("../middlewares/verifyAdmin");
const { decryptData, encryptData } = require("../utils/cryptoHelper");

router.get("/coupons", verifyAdmin, async (req, res) => {
  try {
    const collDocs = (await db.collection("coupons").get()).docs;
    const coupons = [];
    collDocs.forEach((doc) => {
      coupons.push({
        id: doc.id,
        name: decryptData(doc.data().name),
        isValid: doc.data().isValid,
        expired: doc.data().expired,
        startDate: doc.data().startDate,
        amount: decryptData(doc.data().amount),
        type: decryptData(doc.data().type),
      });
    });
    res.render("coupon/coupons", { coupons: coupons });
  } catch (error) {
    console.error("Error fetching coupons:", error);
    res.status(500).json({ error: "Failed to fetch coupons" });
  }
});

router.post("/add/coupon", verifyAdmin, async (req, res) => {
  const { name, isValid, type, expiryDate, amount } = req.body;

  try {
    if (!expiryDate || isNaN(new Date(expiryDate).getTime())) {
      throw new Error("Invalid expiryDate format. Must be a valid date string.");
    }
    const parsedExpiryDate = Timestamp.fromDate(new Date(expiryDate));
    const currentDate = Timestamp.now();
    const couponRef = admin.firestore().collection("coupons").doc();
    const doc = {
      name: encryptData(name),
      isValid,
      expired: parsedExpiryDate,
      startDate: currentDate,
      amount: encryptData(String(parseFloat(amount))),
      type: encryptData(type),
    };
    await couponRef.set(doc);
    res.json({ message: "Coupon added successfuly", status: "success" });
  } catch (error) {
    console.error("Error adding coupon:", error);
    res.status(500).json({ error: "Failed to add coupon" });
  }
});

router.get("/view/coupon/:couponId", verifyAdmin, async (req, res) => {
  const couponId = req.params.couponId;
  try {
    const doc = await db.collection("coupons").doc(couponId).get();
    if (!doc.exists) {
      return res.status(404).json({ message: "Coupon not found", status: "failed" });
    }
    const data = {
      id: doc.id,
      name: decryptData(doc.data().name),
      isValid: doc.data().isValid,
      expired: doc.data().expired,
      startDate: doc.data().startDate,
      amount: decryptData(doc.data().amount),
      type: decryptData(doc.data().type),
    };

    res.json({ coupon: data, status: "success" });
  } catch (error) {
    console.error("Error fetching coupon:", error);
    res.status(500).json({ error: "Failed to fetch coupon" });
  }
});

router.put("/edit/coupon/:couponId", verifyAdmin, async (req, res) => {
  try {
    const couponId = req.params.couponId;
    const { name, isValid, type, expiryDate, amount } = req.body;
    if (!couponId || name == null || isValid == null || !expiryDate || !amount || !type) {
      return res.status(400).json({ message: "Missing required fields", status: "failed" });
    }

    if (typeof Number(expiryDate) !== "number" || Number(expiryDate) <= 0) {
      return res.status(400).json({ message: "Invalid expiryDate format", status: "failed" });
    }
    const couponRef = db.collection("coupons").doc(couponId);
    const doc = await couponRef.get();
    if (!doc.exists) {
      return res.status(404).json({ message: "Coupon not found", status: "failed" });
    }
    const parsedExpiryDate = Timestamp.fromMillis(Number(expiryDate));
    await couponRef.update({
      name: encryptData(name),
      isValid: Boolean(isValid),
      type: encryptData(type),
      expired: parsedExpiryDate,
      amount: encryptData(String(parseFloat(amount))),
    });
    res.status(200).json({ message: "Coupon updated successfully", status: "success" });
  } catch (error) {
    console.error("Error editing coupon:", error);
    res.status(500).json({ error: "Failed to edit coupon", details: error.message });
  }
});

router.delete("/delete/coupon/:couponId", verifyAdmin, async (req, res) => {
  const couponId = req.params.couponId;

  try {
    const docRef = db.collection("coupons").doc(couponId);
    if (!(await docRef.get()).exists) {
      return res.status(404).json({ message: "Coupon not found", status: "failed" });
    }
    await docRef.delete();
    res.json({ message: "Coupon deleted successfully", status: "success" });
  } catch (error) {
    console.error("Error deleting coupon:", error);
    res.status(500).json({ error: "Failed to delete coupon" });
  }
});

module.exports = router;
