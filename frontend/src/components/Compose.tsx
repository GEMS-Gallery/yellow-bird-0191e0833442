import React, { useState } from 'react';
import { backend } from 'declarations/backend';
import { Typography, TextField, Button, CircularProgress } from '@mui/material';
import { useNavigate } from 'react-router-dom';

function Compose() {
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    setLoading(true);
    try {
      // For simplicity, we're using a hardcoded username here.
      // In a real app, you'd get this from user authentication.
      const result = await backend.createPost(content, 'exampleUser');
      if ('ok' in result) {
        navigate('/');
      } else {
        console.error('Error creating post:', result.err);
      }
    } catch (error) {
      console.error('Error creating post:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Typography variant="h4" gutterBottom>
        Compose New Post
      </Typography>
      <form onSubmit={handleSubmit}>
        <TextField
          fullWidth
          multiline
          rows={4}
          variant="outlined"
          placeholder="What's happening?"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          disabled={loading}
          sx={{ mb: 2 }}
        />
        <Button
          type="submit"
          variant="contained"
          color="primary"
          disabled={loading || !content.trim()}
        >
          {loading ? <CircularProgress size={24} /> : 'Post'}
        </Button>
      </form>
    </div>
  );
}

export default Compose;
