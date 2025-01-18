import React, { useRef, useState } from 'react';
import axios from 'axios';
import './App.css';
import FileTable from './components/FileTable/FileTable';

function App() {
    const [file, setFile] = useState(null);

    const uploadFileRef = useRef(null);
    async function triggerUploadFile(){
        await uploadFileRef.current.click();
    };

    const updateFileRef = useRef(null);
    async function triggerUpdateFile(){
        await updateFileRef.current.click();
    };

    async function uploadFile(event) {
        const uploadedFile = event.target.files[0];
        if (uploadedFile) {
            setFile(uploadedFile.name);
            console.log(`Uploaded file: ${uploadedFile.name}`);
        }
    }
    async function getFile() {
        prompt("File id:")
    }
    async function updateFile(event) {
        const uploadedFile = event.target.files[0];
        if (uploadedFile) {
            setFile(uploadedFile.name);
            console.log(`Uploaded file: ${uploadedFile.name}`);
        }
    }
    async function deleteFile() {
        prompt("File id:")
    }


	return (
		<>
			<div id="top">
				<h1 id="main-title">File Managment System</h1>
				<img id="pfp" src="../public/profile-user-account.svg" />
			</div>

			<section>
				<div onClick={triggerUploadFile}>
					<img src="../public/upload-sign.svg"/>
                    <input type='file' ref={uploadFileRef} style={{ display: 'none' }} onChange={(e) => uploadFile(e)}></input>
					<h2>POST</h2>
				</div>
				<div onClick={getFile}>
					<img src="../public/download-button.svg"/>
					<h2>GET</h2>
				</div>
				<div onClick={triggerUpdateFile}>
					<img src="../public/update-icon.svg"/>
                    <input type='file' ref={updateFileRef} style={{ display: 'none' }} onChange={(e) => updateFile(e)}></input>
					<h2>UPDATE</h2>
				</div>
				<div onClick={deleteFile}>
					<img src="../public/delete-button.svg"/>
					<h2>DELETE</h2>
				</div>
			</section>

            <FileTable></FileTable>
		</>
	);
}

export default App;
