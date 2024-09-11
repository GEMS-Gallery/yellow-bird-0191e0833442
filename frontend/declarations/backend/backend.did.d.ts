import type { Principal } from '@dfinity/principal';
import type { ActorMethod } from '@dfinity/agent';
import type { IDL } from '@dfinity/candid';

export type List = [] | [[string, List]];
export interface Post {
  'id' : bigint,
  'content' : string,
  'author' : string,
  'timestamp' : Time,
}
export interface Profile {
  'username' : string,
  'followers' : List,
  'following' : List,
}
export type Result = { 'ok' : null } |
  { 'err' : string };
export type Result_1 = { 'ok' : Profile } |
  { 'err' : string };
export type Result_2 = { 'ok' : Post } |
  { 'err' : string };
export type Time = bigint;
export interface _SERVICE {
  'createPost' : ActorMethod<[string, string], Result_2>,
  'createUser' : ActorMethod<[string], Result>,
  'followUser' : ActorMethod<[string, string], Result>,
  'getPosts' : ActorMethod<[string], Array<Post>>,
  'getProfile' : ActorMethod<[string], Result_1>,
  'getTimeline' : ActorMethod<[string], Array<Post>>,
  'unfollowUser' : ActorMethod<[string, string], Result>,
}
export declare const idlFactory: IDL.InterfaceFactory;
export declare const init: (args: { IDL: typeof IDL }) => IDL.Type[];
