import * as express from 'express';
import cookieParser from 'cookie-parser';
export const app = express();

app.use(cookieParser());
