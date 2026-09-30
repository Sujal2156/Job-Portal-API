import "dotenv/config";
import connectDB from "./db/index.js";
import { app } from "./app.js";
import { seedJobs } from "./utils/seedJobs.js";

const PORT = process.env.PORT || 8000;

connectDB()
    .then(async () => {
        await seedJobs();
        app.listen(PORT, () => {
            console.log(`Server is running at port : ${PORT}`);
        });
    })
    .catch((err) => {
        console.error("MongoDB connection failed:", err);
        process.exit(1);
    });
