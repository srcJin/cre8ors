import FriendConcept from "./concepts/friend";
import MindMapConcept from "./concepts/mindmap";
import PostConcept from "./concepts/post";
import UserConcept from "./concepts/user";
import WebSessionConcept from "./concepts/websession";

// App Definition using concepts
export const WebSession = new WebSessionConcept();
export const User = new UserConcept();
export const Post = new PostConcept();
export const Friend = new FriendConcept();
export const Card = new CardConcept();
export const Mindmap = new MindMapConcept();
