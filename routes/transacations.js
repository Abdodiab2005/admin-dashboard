const express = require("express");
const router = express.Router();
const { admin, db } = require("../utils/firebase");
const verifyAdmin = require("../middlewares/verifyAdmin");
const { Timestamp } = admin.firestore;

router.get("/transactions", verifyAdmin, async (req, res) => {
  const transactions = await db.collection("transactions").get();
  const formattedData = transactions.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));

  function formatTimestamp(timestamp) {
    const date = new Date(timestamp);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    let hours = date.getHours();
    const minutes = String(date.getMinutes()).padStart(2, "0");
    const amPm = hours >= 12 ? "PM" : "AM";
    hours = hours % 12 || 12;

    return `${year}-${month}-${day} ${hours}:${minutes} ${amPm}`;
  }

  // Pass it to EJS templates
  res.locals.formatTimestamp = formatTimestamp;

  // res.status(200).json({ transactions: formattedData });
  res.render("transactions/transactions", { transactions: formattedData });
});

router.post("/transaction/update-transaction", verifyAdmin, async (req, res) => {
  const { transactionId, status, proof } = req.body;

  // console.log("Transaction ID:", transactionId);
  // console.log("Status:", status);
  // console.log("Proof:", proof);

  if (!transactionId) {
    return res.status(400).json({ error: "Transaction ID is required." });
  }

  try {
    const transactionRef = await db.collection("transactions").doc(transactionId).get();
    console.log("Transaction Ref:", transactionRef.exists);
    if (!transactionRef.exists) {
      console.log("Not exists");
      return res.status(404).json({ error: "Transaction not found." });
    }
    const transData = {
      id: transactionRef.id,
      ...transactionRef.data(),
    };
    let updatedProduct;
    if (proof && proof.id) {
      transData.products.forEach((product) => {
        // console.log("Product ID:", product);
        if (product.productId === proof.id) {
          updatedProduct = proof.data;
        }
      });
    }

    if (status) {
      status.updatedAt = Timestamp.now();
      await db
        .collection("transactions")
        .doc(transactionId)
        .update({
          status: admin.firestore.FieldValue.arrayUnion(status),
        });
      return res.status(200).json({ success: true, message: "Transaction updated successfully." });
    }
    updatedProduct.forEach((product) => {
      product.createdAt = Timestamp.now();
    });

    if (proof) {
      const transactionDoc = await db.collection("transactions").doc(transactionId).get();
      const transactionData = transactionDoc.data();
      const updatedProduct = transactionData.products.map((product) => {
        if (product.productId === proof.id) {
          product.proof = proof.data;
          return product;
        }
        return product;
      });

      await db.collection("transactions").doc(transactionId).update(
        {
          products: updatedProduct,
        },
        { merge: true }
      );

      return res.status(200).json({ success: true, message: "Transaction updated successfully." });
    }
  } catch (error) {
    console.error("Error updating transaction:", error);
    res.status(500).json({ error: "Failed to update transaction." });
  }
});

router.get("/view/transaction/:transacationId", verifyAdmin, async (req, res) => {
  const transactionId = req.params.transacationId;
  try {
    const transaction = await db.collection("transactions").doc(transactionId).get();
    if (!transaction.exists) {
      return res.status(404).json({ error: "Transaction not found." });
    }
    const data = transaction.data();
    res.render("transactions/view-transacation", { transaction: data }); // Ensure the response wraps the data in a 'transaction' key
  } catch (error) {
    console.error("Error getting transaction:", error);
    res.status(500).json({ error: "Failed to get transaction." });
  }
});

router.post("/view/user", verifyAdmin, async (req, res) => {
  const { userId } = req.body;

  if (!userId) {
    return res.status(400).json({ error: "User ID is required." });
  }
  try {
    const userRef = db.collection("users").doc(userId);
    const userSnapshot = await userRef.get();
    if (!userSnapshot.exists) {
      return res.status(404).json({ error: "User not found." });
    }
    const userData = userSnapshot.data();
    res.status(200).json({ user: userData });
  } catch (error) {
    console.error("Error getting user:", error);
    res.status(500).json({ error: "Failed to get user." });
  }
});

router.get("/deliver-order/:orderId", verifyAdmin, async (req, res) => {
  const orderId = req.params.orderId;
  try {
    const orderRef = db.collection("transactions").doc(orderId);
    const orderSnapshot = await orderRef.get();
    if (!orderSnapshot.exists) {
      return res.status(404).json({ error: "Order not found." });
    }
    const orderData = {
      id: orderSnapshot.id,
      ...orderSnapshot.data(),
    };
    const order = {
      orderId: orderData.id,
      orderDate: orderData.createdAt,
      status: orderData.status,
      totalPrice: orderData.totalPrice,
      currency: orderData.currency,
      products: orderData.products.map((p) => ({
        id: p.productId,
        title: p.title,
        price: p.price,
        quantity: p.quantity,
        details: p.description,
        img: p.img,
        proof: p.proof,
      })),
      paymentMethod: orderData.paymentMethod,
    };

    // Render the admin order page with data
    res.render("transactions/deliver-transaation", { order });
  } catch (error) {
    console.error("Error delivering order:", error);
    res.status(500).json({ error: "Failed to deliver order." });
  }
});

module.exports = router;
