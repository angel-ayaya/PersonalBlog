import express from "express";
import userRoutes from "./src/routes/userRoutes";

const app = express();
const PORT = 4000;

app.use(express.json());

// User routes
app.use("/api/users", userRoutes);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
