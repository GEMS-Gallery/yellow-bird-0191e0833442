import React, { useState, useEffect } from 'react';
import { backend } from 'declarations/backend';
import { Typography, CircularProgress, List, ListItem, ListItemText, Divider } from '@mui/material';

interface Post {
  id: bigint;
  author: string;
  content: string;
  timestamp: bigint;
}

function Home() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        // For simplicity, we're using a hardcoded username here.
        // In a real app, you'd get this from user authentication.
        const timelinePosts = await backend.getTimeline('exampleUser');
        setPosts(timelinePosts);
      } catch (error) {
        console.error('Error fetching timeline:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, []);

  if (loading) {
    return <CircularProgress />;
  }

  return (
    <div>
      <Typography variant="h4" gutterBottom>
        Timeline
      </Typography>
      <List>
        {posts.map((post, index) => (
          <React.Fragment key={Number(post.id)}>
            <ListItem alignItems="flex-start">
              <ListItemText
                primary={post.author}
                secondary={
                  <React.Fragment>
                    <Typography
                      component="span"
                      variant="body2"
                      color="text.primary"
                    >
                      {post.content}
                    </Typography>
                    {` — ${new Date(Number(post.timestamp) / 1000000).toLocaleString()}`}
                  </React.Fragment>
                }
              />
            </ListItem>
            {index < posts.length - 1 && <Divider />}
          </React.Fragment>
        ))}
      </List>
    </div>
  );
}

export default Home;
