import React, { useState } from 'react';
import axios from 'axios';
import io from 'socket.io-client';
import { makeStyles } from '@material-ui/core/styles';
import { Button, TextField } from '@material-ui/core';
import '../public/css/styles.css';

const socket = io('http://localhost:3000');

const useStyles = makeStyles((theme) => ({
  root: {
    '& > *': {
      margin: theme.spacing(1),
    },
  },
}));

export default function Home() {
  const classes = useStyles();
  const [file, setFile] = useState(null);
  const [description, setDescription] = useState('');

  const handleFileChange = (event) => {
    setFile(event.target.files[0]);
  };

  const handleDescriptionChange = (event) => {
    setDescription(event.target.value);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const formData = new FormData();
    formData.append('file', file);
    formData.append('description', description);
    try {
      const response = await axios.post('/api/posts', formData);
      socket.emit('newPost');
    } catch (error) {
      console.error(error);
    }
  };

  socket.on('newPost', () => {
    // Fetch new posts and update the UI
    axios.get('/api/posts').then((response) => {
      setPosts(response.data);
    });
  });

  return (
    <div className={classes.root}>
      <form onSubmit={handleSubmit}>
        <TextField
          id="description"
          label="Description"
          variant="outlined"
          value={description}
          onChange={handleDescriptionChange}
        />
        <input type="file" onChange={handleFileChange} />
        <Button type="submit" variant="contained" color="primary">
          Upload
        </Button>
      </form>
    </div>
  );
}