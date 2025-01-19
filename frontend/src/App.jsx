import React, { useRef } from 'react';
import axios from 'axios';
import './App.css';
import FileTable from './components/FileTable/FileTable';

function App() {

    const uploadFileRef = useRef(null);
    async function triggerUploadFile() {
        await uploadFileRef.current.click();
    }

    const updateFileRef = useRef(null);
    async function triggerUpdateFile() {
        await updateFileRef.current.click();
    }

    async function uploadFile(event) {
        const uploadedFile = event.target.files[0];
        if (uploadedFile) {
            const formData = new FormData();
            formData.append('file', uploadedFile);

            try {
                const response = await axios.post('http://localhost:5000/upload', formData, {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                        Authorization: `Bearer ${localStorage.getItem('authToken')}`, // Replace with your token storage method
                    },
                });
                console.log('File uploaded successfully:', response.data);
            } catch (error) {
                console.error('Error uploading file:', error.response?.data || error.message);
            }
        }
    }

    async function getFile() {
        const fileId = prompt("Enter File ID:");
        if (fileId) {
            try {
                const response = await axios.get(`http://localhost:5000/download/${fileId}`, {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('authToken')}`, // Replace with your token storage method
                    },
                    responseType: 'blob', // This ensures you get the file as a Blob
                });

                // Create a download link for the user
                const url = window.URL.createObjectURL(new Blob([response.data]));
                const link = document.createElement('a');
                link.href = url;
                link.setAttribute('download', fileId); // Set the file name
                document.body.appendChild(link);
                link.click();
                link.parentNode.removeChild(link);
            } catch (error) {
                console.error('Error downloading file:', error.response?.data || error.message);
            }
        }
    }

    async function updateFile(event) {
        const uploadedFile = event.target.files[0];
        const fileId = prompt("Enter File ID to update:");
        if (uploadedFile && fileId) {
            const formData = new FormData();
            formData.append('file', uploadedFile);

            try {
                const response = await axios.put(`http://localhost:5000/update/${fileId}`, formData, {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                        Authorization: `Bearer ${localStorage.getItem('authToken')}`, // Replace with your token storage method
                    },
                });
                console.log('File updated successfully:', response.data);
            } catch (error) {
                console.error('Error updating file:', error.response?.data || error.message);
            }
        }
    }

    async function deleteFile() {
        const fileId = prompt("Enter File ID to delete:");
        if (fileId) {
            try {
                const response = await axios.delete(`http://localhost:5000/delete/${fileId}`, {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('authToken')}`, // Replace with your token storage method
                    },
                });
                console.log('File deleted successfully:', response.data);
            } catch (error) {
                console.error('Error deleting file:', error.response?.data || error.message);
            }
        }
    }

    return (
        <>
            <div id="top">
                <h1 id="main-title">File Management System</h1>
                <img id="pfp" src="../public/profile-user-account.svg" />
            </div>

            <section>
                <div onClick={triggerUploadFile}>
                    <img src="../public/upload-sign.svg" />
                    <input type="file" ref={uploadFileRef} style={{ display: 'none' }} onChange={(e) => uploadFile(e)} />
                    <h2>POST</h2>
                </div>
                <div onClick={getFile}>
                    <img src="../public/download-button.svg" />
                    <h2>GET</h2>
                </div>
                <div onClick={triggerUpdateFile}>
                    <img src="../public/update-icon.svg" />
                    <input type="file" ref={updateFileRef} style={{ display: 'none' }} onChange={(e) => updateFile(e)} />
                    <h2>UPDATE</h2>
                </div>
                <div onClick={deleteFile}>
                    <img src="../public/delete-button.svg" />
                    <h2>DELETE</h2>
                </div>
            </section>

            <FileTable></FileTable>
        </>
    );
}

export default App;
