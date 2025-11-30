import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import path from "path";
import "express-async-errors";

import { routes } from "./routes";
import { errorHandler } from "./middleware/errorHandler";
import { env } from "./config/env";

export const createApp = () => {
  const app = express();

  app.use(helmet());
  app.use(cors({ origin: true, credentials: true }));
  app.use(morgan("dev"));
  app.use(express.json());

  app.use("/uploads", express.static(path.join(process.cwd(), env.uploadDir)));

  app.use("/api", routes);

  app.use(errorHandler);

  return app;
};
