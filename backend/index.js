import express from 'express'
import multer from 'multer';
import pkg from 'aws-sdk';
const { S3 } = pkg;
import cors from 'cors'
import axios from 'axios'

const app = express();
const upload = multer();
const s3 = new S3({
    endpoint: 'http://minio:9000',
    accessKeyId: process.env.MINIO_ACCESS_KEY,
    secretAccessKey: process.env.MINIO_SECRET_ACCESS_KEY,
    s3ForcePathStyle: true,
});



app.use(cors({
    origin: 'http://localhost:5173',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true,
}));

const keycloakServerUrl = 'http://localhost:8080/realms/myrealm/protocol/openid-connect/token/introspect';

async function verifyToken(req, res, next) {
    const token = req.headers.authorization?.split(' ')[1]; // Assuming the token is in the Authorization header as 'Bearer <token>'

    if (!token) {
        return res.status(401).json({ error: 'No token provided' });
    }

    try {
        // Verify token by calling Keycloak's introspect endpoint
        const response = await axios.post(`http://localhost:8080/realms/myrealm/protocol/openid-connect/token/introspect`, new URLSearchParams({
            client_id: 'myclient',
            client_secret: 'DH6ywRtX0mL0RjT2fH38onpX9nP0J5yv',
            token: token,
        }));

        if (!response.data.active) {
            return res.status(401).json({ error: 'Invalid token' });
        }

        // If valid, pass user information in the request object
        req.user = response.data;
        next();
    } catch (error) {
        console.error('Token verification failed:', error);
        return res.status(500).json({ error: 'Token verification failed' });
    }
}

app.post('/upload', verifyToken, upload.single('file'), async (req, res) => {
    const params = {
        Bucket: process.env.MINIO_BUCKET_NAME,
        Key: req.file.originalname,
        Body: req.file.buffer,
    };
    await s3.upload(params).promise();
    res.send('File uploaded successfully!');
});

app.listen(5000, () => console.log('Backend running on port 5000'));
