import { app, server, PORT} from "./Config/appConfig.js";

/* -----------------------------
User Imports
------------------------------ */
import auth from "./routes/User/authRoutes.js";
import roleManagement from "./routes/User/roleManagementRoutes.js";
import user from "./routes/User/userRoutes.js";

/* -----------------------------
  QC2 System Import
------------------------------ */
/* ------------IE Admin-----------------*/
import ieQCRoleManagement from "./routes/QC2System/IEAdmin/IEQCRolerManagementRoutes.js";
/* -----------------------------
Common File Imports
------------------------------ */
/*-------------DT-Orders Imports --------------*/
import dtOrders from "./routes/Common/DTOrdersRoutes.js";
/*-------------Buyer Spec Imports --------------*/
import buyerSpec from "./routes/Common/DTOrdersBuyerSpecRoutes.js";
import buyerSpecPacking from "./routes/Common/DTOrdersBuyerSpecPackingRoutes.js";



// import { closeSQLPools } from "./controller/SQL/sqlController.js";

/* -----------------------------
User Routes
------------------------------ */
app.use(auth);
app.use(roleManagement);
app.use(user);

/* -----------------------------
  QC2 System Routes
------------------------------ */
/* -----------IE Admin -----------------*/
app.use(ieQCRoleManagement);

/* -----------------------------
Commin file  Routes
------------------------------ */
/* ----------- DT_Orders -----------------*/
app.use(dtOrders);
/* -----------Buyer Specs -----------------*/
app.use(buyerSpec);
app.use(buyerSpecPacking);

// process.on("SIGINT", async () => {
//   try {
//     await closeSQLPools();
//     console.log("SQL connection pools closed.");
//   } catch (err) {
//     console.error("Error closing SQL connection pools:", err);
//   } finally {
//     process.exit(0);
//   }
// });

app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
}); 

// Set UTF-8 encoding for responses
app.use((req, res, next) => {
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  next();
});

// Start the server
server.listen(PORT, "0.0.0.0", () => {
  console.log(`✅ HTTPS Server is running on https://localhost:${PORT}`);
});