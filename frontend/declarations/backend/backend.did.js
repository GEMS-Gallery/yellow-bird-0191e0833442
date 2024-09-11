export const idlFactory = ({ IDL }) => {
  const List = IDL.Rec();
  const Time = IDL.Int;
  const Post = IDL.Record({
    'id' : IDL.Nat,
    'content' : IDL.Text,
    'author' : IDL.Text,
    'timestamp' : Time,
  });
  const Result_2 = IDL.Variant({ 'ok' : Post, 'err' : IDL.Text });
  const Result = IDL.Variant({ 'ok' : IDL.Null, 'err' : IDL.Text });
  List.fill(IDL.Opt(IDL.Tuple(IDL.Text, List)));
  const Profile = IDL.Record({
    'username' : IDL.Text,
    'followers' : List,
    'following' : List,
  });
  const Result_1 = IDL.Variant({ 'ok' : Profile, 'err' : IDL.Text });
  return IDL.Service({
    'createPost' : IDL.Func([IDL.Text, IDL.Text], [Result_2], []),
    'createUser' : IDL.Func([IDL.Text], [Result], []),
    'followUser' : IDL.Func([IDL.Text, IDL.Text], [Result], []),
    'getPosts' : IDL.Func([IDL.Text], [IDL.Vec(Post)], ['query']),
    'getProfile' : IDL.Func([IDL.Text], [Result_1], ['query']),
    'getTimeline' : IDL.Func([IDL.Text], [IDL.Vec(Post)], ['query']),
    'unfollowUser' : IDL.Func([IDL.Text, IDL.Text], [Result], []),
  });
};
export const init = ({ IDL }) => { return []; };
