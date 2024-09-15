import express from 'express';
import cors from 'cors';
import router from './routes';

const app = express();
const port = 3001;

app.use(cors()); // Enable CORS
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Use routes from routes.ts
app.use('/', router);

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
