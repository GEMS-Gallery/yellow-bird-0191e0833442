import Bool "mo:base/Bool";
import Order "mo:base/Order";

import Array "mo:base/Array";
import HashMap "mo:base/HashMap";
import Hash "mo:base/Hash";
import Iter "mo:base/Iter";
import List "mo:base/List";
import Nat "mo:base/Nat";
import Option "mo:base/Option";
import Result "mo:base/Result";
import Text "mo:base/Text";
import Time "mo:base/Time";

actor {
  type Post = {
    id: Nat;
    author: Text;
    content: Text;
    timestamp: Time.Time;
  };

  type Profile = {
    username: Text;
    following: List.List<Text>;
    followers: List.List<Text>;
  };

  stable var nextPostId: Nat = 0;
  stable var posts: [(Nat, Post)] = [];
  stable var users: [(Text, Profile)] = [];

  var postStore = HashMap.fromIter<Nat, Post>(posts.vals(), 0, Nat.equal, Hash.hash);
  var userStore = HashMap.fromIter<Text, Profile>(users.vals(), 0, Text.equal, Text.hash);

  // Create a new post
  public func createPost(content: Text, username: Text) : async Result.Result<Post, Text> {
    switch (userStore.get(username)) {
      case (null) { #err("User not found") };
      case (?_) {
        let post : Post = {
          id = nextPostId;
          author = username;
          content = content;
          timestamp = Time.now();
        };
        postStore.put(nextPostId, post);
        nextPostId += 1;
        #ok(post)
      };
    }
  };

  // Get posts for a specific user
  public query func getPosts(username: Text) : async [Post] {
    let userPosts = Iter.toArray(Iter.filter(postStore.vals(), func (post: Post) : Bool { post.author == username }));
    Array.sort(userPosts, func (a: Post, b: Post) : Order.Order {
      if (a.timestamp > b.timestamp) { #less } else if (a.timestamp < b.timestamp) { #greater } else { #equal }
    })
  };

  // Get timeline (posts from followed users)
  public query func getTimeline(username: Text) : async [Post] {
    switch (userStore.get(username)) {
      case (null) { [] };
      case (?profile) {
        let followedUsers = List.toArray(profile.following);
        let timelinePosts = Iter.toArray(Iter.filter(postStore.vals(), func (post: Post) : Bool {
          Array.find(followedUsers, func (user: Text) : Bool { user == post.author }) != null
        }));
        Array.sort(timelinePosts, func (a: Post, b: Post) : Order.Order {
          if (a.timestamp > b.timestamp) { #less } else if (a.timestamp < b.timestamp) { #greater } else { #equal }
        })
      };
    }
  };

  // Follow a user
  public func followUser(follower: Text, toFollow: Text) : async Result.Result<(), Text> {
    switch (userStore.get(follower), userStore.get(toFollow)) {
      case (null, _) { #err("Follower not found") };
      case (_, null) { #err("User to follow not found") };
      case (?followerProfile, ?toFollowProfile) {
        if (follower == toFollow) { return #err("Cannot follow yourself") };
        if (List.some(followerProfile.following, func (u: Text) : Bool { u == toFollow })) {
          return #err("Already following this user");
        };
        let updatedFollowerProfile : Profile = {
          username = followerProfile.username;
          following = List.push(toFollow, followerProfile.following);
          followers = followerProfile.followers;
        };
        let updatedToFollowProfile : Profile = {
          username = toFollowProfile.username;
          following = toFollowProfile.following;
          followers = List.push(follower, toFollowProfile.followers);
        };
        userStore.put(follower, updatedFollowerProfile);
        userStore.put(toFollow, updatedToFollowProfile);
        #ok()
      };
    }
  };

  // Unfollow a user
  public func unfollowUser(follower: Text, toUnfollow: Text) : async Result.Result<(), Text> {
    switch (userStore.get(follower), userStore.get(toUnfollow)) {
      case (null, _) { #err("Follower not found") };
      case (_, null) { #err("User to unfollow not found") };
      case (?followerProfile, ?toUnfollowProfile) {
        if (follower == toUnfollow) { return #err("Cannot unfollow yourself") };
        if (List.find(followerProfile.following, func (u: Text) : Bool { u == toUnfollow }) == null) {
          return #err("Not following this user");
        };
        let updatedFollowerProfile : Profile = {
          username = followerProfile.username;
          following = List.filter(followerProfile.following, func (u: Text) : Bool { u != toUnfollow });
          followers = followerProfile.followers;
        };
        let updatedToUnfollowProfile : Profile = {
          username = toUnfollowProfile.username;
          following = toUnfollowProfile.following;
          followers = List.filter(toUnfollowProfile.followers, func (u: Text) : Bool { u != follower });
        };
        userStore.put(follower, updatedFollowerProfile);
        userStore.put(toUnfollow, updatedToUnfollowProfile);
        #ok()
      };
    }
  };

  // Get user profile
  public query func getProfile(username: Text) : async Result.Result<Profile, Text> {
    switch (userStore.get(username)) {
      case (null) { #err("User not found") };
      case (?profile) { #ok(profile) };
    }
  };

  // Create a new user
  public func createUser(username: Text) : async Result.Result<(), Text> {
    switch (userStore.get(username)) {
      case (?_) { #err("Username already taken") };
      case (null) {
        let newProfile : Profile = {
          username = username;
          following = List.nil();
          followers = List.nil();
        };
        userStore.put(username, newProfile);
        #ok()
      };
    }
  };

  system func preupgrade() {
    posts := Iter.toArray(postStore.entries());
    users := Iter.toArray(userStore.entries());
  };

  system func postupgrade() {
    postStore := HashMap.fromIter<Nat, Post>(posts.vals(), 0, Nat.equal, Hash.hash);
    userStore := HashMap.fromIter<Text, Profile>(users.vals(), 0, Text.equal, Text.hash);
  };
}