import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { backend } from 'declarations/backend';
import { Typography, CircularProgress, Button, List, ListItem, ListItemText, Divider } from '@mui/material';

interface Profile {
  username: string;
  following: string[];
  followers: string[];
}

interface Post {
  id: bigint;
  author: string;
  content: string;
  timestamp: bigint;
}

function Profile() {
  const { username } = useParams<{ username: string }>();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfileAndPosts = async () => {
      if (!username) return;
      try {
        const profileResult = await backend.getProfile(username);
        if ('ok' in profileResult) {
          setProfile(profileResult.ok);
        } else {
          console.error('Error fetching profile:', profileResult.err);
        }

        const userPosts = await backend.getPosts(username);
        setPosts(userPosts);
      } catch (error) {
        console.error('Error fetching profile or posts:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfileAndPosts();
  }, [username]);

  const handleFollow = async () => {
    if (!username) return;
    try {
      // For simplicity, we're using a hardcoded follower username here.
      // In a real app, you'd get this from user authentication.
      const result = await backend.followUser('currentUser', username);
      if ('ok' in result) {
        // Refresh profile data
        const updatedProfile = await backend.getProfile(username);
        if ('ok' in updatedProfile) {
          setProfile(updatedProfile.ok);
        }
      } else {
        console.error('Error following user:', result.err);
      }
    } catch (error) {
      console.error('Error following user:', error);
    }
  };

  if (loading) {
    return <CircularProgress />;
  }

  if (!profile) {
    return <Typography>Profile not found</Typography>;
  }

  return (
    <div>
      <Typography variant="h4" gutterBottom>
        {profile.username}
      </Typography>
      <Typography variant="body1">
        Following: {profile.following.length} | Followers: {profile.followers.length}
      </Typography>
      <Button variant="contained" color="primary" onClick={handleFollow} sx={{ mt: 2, mb: 2 }}>
        Follow
      </Button>
      <Typography variant="h5" gutterBottom>
        Posts
      </Typography>
      <List>
        {posts.map((post, index) => (
          <React.Fragment key={Number(post.id)}>
            <ListItem alignItems="flex-start">
              <ListItemText
                primary={post.content}
                secondary={`${new Date(Number(post.timestamp) / 1000000).toLocaleString()}`}
              />
            </ListItem>
            {index < posts.length - 1 && <Divider />}
          </React.Fragment>
        ))}
      </List>
    </div>
  );
}

export default Profile;
