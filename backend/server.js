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