import express from 'express'
import multer from 'multer';
import cors from 'cors'
import axios from 'axios'

const app = express();
const upload = multer();

import * as Minio from 'minio'


const s3 = new Minio.Client({
    endPoint: 'localhost',
    port: 9000,
    accessKey: 'JeB5P8U5hY1bgbjhf9rh',
    secretKey: '8R93nHnjFTexjdakH0G36LXEeqSgHNtNfRsm8vMo',
  })




app.use(cors({
    origin: 'http://localhost:5173',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true,
}));

const keycloakServerUrl = `http://localhost:8080/realms/main_realm/protocol/openid-connect/token/introspect`

async function verifyToken(req, res, next) {
    const token = req.headers.authorization?.split(' ')[1]; // Assuming the token is in the Authorization header as 'Bearer <token>'

    if (!token) {
        return res.status(401).json({ error: 'No token provided' });
    }

    try {
        // Verify token by calling Keycloak's introspect endpoint
        const response = await axios.post(keycloakServerUrl, new URLSearchParams({
            client_id: process.env.MINIO_CLIENT_ID,
            client_secret: process.env.MINIO_CLIENT_SECRET,
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

app.post('/upload',  upload.single('file'), async (req, res) => {
    await s3.putObject("bucket", req.file.originalname, req.file.buffer);
    res.send('File uploaded successfully!');
})

app.get('/download/:file_id', verifyToken, async (req, res) => {
    const fileId = req.params.file_id;

    try {
        const params = {
            Bucket: 'bucket',
            Key: fileId,
        };

        const fileStream = s3.getObject(params).createReadStream();
        fileStream.on('error', (err) => {
            console.error('Error fetching file:', err);
            return res.status(404).json({ error: 'File not found' });
        });

        res.attachment(fileId);
        fileStream.pipe(res);
    } catch (error) {
        console.error('Error in download:', error);
        res.status(500).json({ error: 'Error downloading file' });
    }
});

app.put('/update/:file_id', verifyToken, upload.single('file'), async (req, res) => {
    const fileId = req.params.file_id;

    if (!req.file) {
        return res.status(400).json({ error: 'No file provided for update' });
    }

    try {
        const params = {
            Bucket: process.env.MINIO_BUCKET_NAME,
            Key: fileId,
            Body: req.file.buffer,
        };

        await s3.upload(params).promise();
        res.send('File updated successfully!');
    } catch (error) {
        console.error('Error in update:', error);
        res.status(500).json({ error: 'Error updating file' });
    }
});

app.delete('/delete/:file_id', verifyToken, async (req, res) => {
    const fileId = req.params.file_id;

    try {
        const params = {
            Bucket: process.env.MINIO_BUCKET_NAME,
            Key: fileId,
        };

        await s3.deleteObject(params).promise();
        res.send('File deleted successfully!');
    } catch (error) {
        console.error('Error in delete:', error);
        res.status(500).json({ error: 'Error deleting file' });
    }
});


app.listen(5000, () => console.log('Backend running on port 5000'));
