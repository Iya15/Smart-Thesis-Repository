import "dotenv/config";
import app from "./src/app";

const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Health check → http://localhost:${PORT}/api/health`);
});
