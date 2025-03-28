const express = require("express");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const path = require("path");
const dotenv = require("dotenv");
// const helmet = require("helmet");
const compression = require("compression");
const morgan = require("morgan");
const verifyAdmin = require("./middlewares/verifyAdmin");
dotenv.config();

const app = express();
// Middleware
app.use(compression());
app.use(morgan("combined"));

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(express.static(path.join(__dirname, "public")));
app.use(express.json());
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: true }));

app.get("/", verifyAdmin, async (req, res) => {
  res.render("index");
});

// ! users
const usersRouter = require("./routes/users");
app.use("/users", usersRouter);

// ! Categories and products
const addCategoryRoute = require("./routes/manage-categories");
app.use("/admin", addCategoryRoute);

// ! Coupons
const couponsRoutes = require("./routes/coupon");
app.use("/admin", couponsRoutes);

// ! sliders
const slidersRoutes = require("./routes/sliders");
app.use("/admin", slidersRoutes);

// ! discounts
const discountsRoutes = require("./routes/discounts");
app.use("/admin", discountsRoutes);

// ! banner
const bannerRoutes = require("./routes/banner");
app.use("/admin", bannerRoutes);

// ! Transacations
const transacationsRoutes = require("./routes/transacations");
app.use("/admin", transacationsRoutes);

// ! Tickets
const ticketsRoutes = require("./routes/tickets");
app.use("/admin", ticketsRoutes);

// ! Q&A
const questionsAndAnswers = require("./routes/questions-answers");
app.use("/admin", questionsAndAnswers);

// ! Login
const loginRoutes = require("./routes/login");
app.use("/", loginRoutes);

// ! Logout
const logoutRoute = require("./routes/logout");
app.use("/", logoutRoute);

// ! Pin category
const pinCategory = require("./routes/pin-category");
app.use("/", pinCategory);

// ! Batch operations
const batchOperationsRoutes = require("./routes/batch-operations");
app.use("/", batchOperationsRoutes);

// ! Marketing emails
const marketingEmails = require("./routes/marketing");
app.use("/", marketingEmails);

// Error handling
app.use((req, res, next) => {
  res.status(404).render("error", {
    title: "Page Not Found",
    message: "The page you are looking for does not exist.",
    statusCode: 404,
  });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).render("error", {
    title: "Server Error",
    message: "Something went wrong on our end.",
    statusCode: 500,
  });
});

// Start the server
const PORT = process.env.PORT || 3200;
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
