import React, { useState, useEffect, useRef } from 'react';
import { Button, ListGroup, ListGroupItem, FormControl } from 'react-bootstrap';

function AudioPlayer() {
  const [files, setFiles] = useState(JSON.parse(localStorage.getItem('audioFiles')) || []);
  const [currentFile, setCurrentFile] = useState(localStorage.getItem('currentAudio') || null);
  const audioElementRef = useRef(null);

  useEffect(() => {
    if (audioElementRef.current) {
      const audioElement = audioElementRef.current;

      audioElement.onended = () => {
        const currentIndex = files.findIndex(file => file.url === currentFile);
        const nextFile = files[currentIndex + 1];
        if (nextFile) {
          setCurrentFile(nextFile.url);
          audioElement.src = nextFile.url;
          audioElement.onloadeddata = () => {
            audioElement.play();
            audioElement.onloadeddata = null; 
          };
        }
      };

      return () => {
        audioElement.onended = null;
      };
    }
  }, [audioElementRef, currentFile, files]);

  useEffect(() => {
    if (currentFile && audioElementRef.current) {
      const audioElement = audioElementRef.current;
      audioElement.src = currentFile;
      audioElement.onloadeddata = () => {
        audioElement.currentTime = 0;
        audioElement.play();
        audioElement.onloadeddata = null; 
      };
    }
  }, [audioElementRef, currentFile]);

  const uploadFile = (event) => {
    const file = event.target.files[0];
    const url = URL.createObjectURL(file);
    const newFile = { url, name: file.name };
    setFiles([...files, newFile]);
    localStorage.setItem('audioFiles', JSON.stringify([...files, newFile]));
  };

  const playFile = (file) => {
    setCurrentFile(file.url);
    localStorage.setItem('currentAudio', file.url);
    if (audioElementRef.current) {
      const audioElement = audioElementRef.current;
      audioElement.src = file.url;
      audioElement.onloadeddata = () => {
        audioElement.currentTime = 0;
        audioElement.play();
        audioElement.onloadeddata = null;
      };
    }
  };

  const deleteFile = (file) => {
    const newFiles = files.filter(f => f.url !== file.url);
    setFiles(newFiles);
    localStorage.setItem('audioFiles', JSON.stringify(newFiles));
    if (file.url === currentFile) {
      setCurrentFile(null);
      localStorage.removeItem('currentAudio');
    }
  };

  const handleTimeUpdate = () => {
    localStorage.setItem('lastPlayedTime', audioElementRef.current.currentTime.toString());
  };

  return (
    <div className="container">
      <FormControl type="file" accept="audio/*" onChange={uploadFile} className="my-3" />
      <audio
        ref={audioElementRef}
        src={currentFile}
        controls
        className="mb-3 w-100"
        onTimeUpdate={handleTimeUpdate}
      />
      <h2>Now Playing: {files.find(file => file.url === currentFile)?.name}</h2>
      <ListGroup>
        {files.map((file, index) => (
          <ListGroupItem key={index}>
            <div className="d-flex justify-content-between align-items-center">
              <div onClick={() => playFile(file)}>{file.name}</div>
              <div>
                <Button variant="primary" onClick={() => playFile(file)}>
                  Play
                </Button>
                <Button variant="danger" onClick={() => deleteFile(file)}>
                  Delete
                </Button>
              </div>
            </div>
          </ListGroupItem>
        ))}
      </ListGroup>
    </div>
  );
}

export default AudioPlayer;
