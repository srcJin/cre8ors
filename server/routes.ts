import { ObjectId } from "mongodb";

import { Router, getExpressRouter } from "./framework/router";

import { Friend, Mindmap, Post, User, WebSession } from "./app";
import { PostDoc, PostOptions } from "./concepts/post";
import { UserDoc } from "./concepts/user";
import { WebSessionDoc } from "./concepts/websession";
import Responses from "./responses";

class Routes {
  @Router.get("/session")
  async getSessionUser(session: WebSessionDoc) {
    const user = WebSession.getUser(session);
    return await User.getUserById(user);
  }

  @Router.get("/users")
  async getUsers() {
    return await User.getUsers();
  }

  @Router.get("/users/:username")
  async getUser(username: string) {
    return await User.getUserByUsername(username);
  }

  @Router.post("/users")
  async createUser(session: WebSessionDoc, username: string, password: string) {
    WebSession.isLoggedOut(session);
    return await User.create(username, password);
  }

  @Router.patch("/users")
  async updateUser(session: WebSessionDoc, update: Partial<UserDoc>) {
    const user = WebSession.getUser(session);
    return await User.update(user, update);
  }

  @Router.delete("/users")
  async deleteUser(session: WebSessionDoc) {
    const user = WebSession.getUser(session);
    WebSession.end(session);
    return await User.delete(user);
  }

  @Router.post("/login")
  async logIn(session: WebSessionDoc, username: string, password: string) {
    const u = await User.authenticate(username, password);
    WebSession.start(session, u._id);
    return { msg: "Logged in!" };
  }

  @Router.post("/logout")
  async logOut(session: WebSessionDoc) {
    WebSession.end(session);
    return { msg: "Logged out!" };
  }

  @Router.get("/posts")
  async getPosts(author?: string) {
    let posts;
    if (author) {
      const id = (await User.getUserByUsername(author))._id;
      posts = await Post.getByAuthor(id);
    } else {
      posts = await Post.getPosts({});
    }
    return Responses.posts(posts);
  }

  @Router.post("/posts")
  async createPost(session: WebSessionDoc, content: string, options?: PostOptions) {
    const user = WebSession.getUser(session);
    const created = await Post.create(user, content, options);
    return { msg: created.msg, post: await Responses.post(created.post) };
  }

  @Router.patch("/posts/:_id")
  async updatePost(session: WebSessionDoc, _id: ObjectId, update: Partial<PostDoc>) {
    const user = WebSession.getUser(session);
    await Post.isAuthor(user, _id);
    return await Post.update(_id, update);
  }

  @Router.delete("/posts/:_id")
  async deletePost(session: WebSessionDoc, _id: ObjectId) {
    const user = WebSession.getUser(session);
    await Post.isAuthor(user, _id);
    return Post.delete(_id);
  }

  @Router.get("/friends")
  async getFriends(session: WebSessionDoc) {
    const user = WebSession.getUser(session);
    return await User.idsToUsernames(await Friend.getFriends(user));
  }

  @Router.delete("/friends/:friend")
  async removeFriend(session: WebSessionDoc, friend: string) {
    const user = WebSession.getUser(session);
    const friendId = (await User.getUserByUsername(friend))._id;
    return await Friend.removeFriend(user, friendId);
  }

  @Router.get("/friend/requests")
  async getRequests(session: WebSessionDoc) {
    const user = WebSession.getUser(session);
    return await Responses.friendRequests(await Friend.getRequests(user));
  }

  @Router.post("/friend/requests/:to")
  async sendFriendRequest(session: WebSessionDoc, to: string) {
    const user = WebSession.getUser(session);
    const toId = (await User.getUserByUsername(to))._id;
    return await Friend.sendRequest(user, toId);
  }

  @Router.delete("/friend/requests/:to")
  async removeFriendRequest(session: WebSessionDoc, to: string) {
    const user = WebSession.getUser(session);
    const toId = (await User.getUserByUsername(to))._id;
    return await Friend.removeRequest(user, toId);
  }

  @Router.put("/friend/accept/:from")
  async acceptFriendRequest(session: WebSessionDoc, from: string) {
    const user = WebSession.getUser(session);
    const fromId = (await User.getUserByUsername(from))._id;
    return await Friend.acceptRequest(fromId, user);
  }

  @Router.put("/friend/reject/:from")
  async rejectFriendRequest(session: WebSessionDoc, from: string) {
    const user = WebSession.getUser(session);
    const fromId = (await User.getUserByUsername(from))._id;
    return await Friend.rejectRequest(fromId, user);
  }

  @Router.post("/mindmaps")
  async startProject(session: WebSessionDoc, title: string, description: string) {
    const user = WebSession.getUser(session);
    const mindMap = (await Mindmap.create(title, description, "", [user], [])).mindMap;
    return Responses.mindMap(mindMap);
  }

  @Router.post("/mindmaps/:mapId/ideablocks/:ideaBlock")
  async addIdeaBlock(mapId: ObjectId, ideaBlock: ObjectId) {
    return Mindmap.addideaBlocks(mapId, ideaBlock);
  }

  @Router.delete("/mindmaps/:mapId/ideablocks/:ideablock")
  async removeIdeaBlock(mapId: ObjectId, ideablock: ObjectId) {
    return Mindmap.removeideaBlock(mapId, ideablock);
  }

  @Router.get("/mindmaps/:mapId/ideablocks")
  async getCards(mapId: ObjectId) {
    const cards = await Mindmap.getIdeaBlocks(mapId);
    return { msg: `IdeaBlocks in Mindmap ${mapId}`, cards: cards };
  }

  //Get Map By id
  @Router.get("/mindmaps/:_id")
  async getMap(_id: ObjectId) {
    const map = await Mindmap.getMap(_id);
    return Responses.mindMap(map);
  }

  //Get Maps By user
  @Router.get("/mindmaps/user/:user")
  async getMapByUser(user: ObjectId) {
    const maps = await Mindmap.getMapByUser(user);
    return maps;
  }

  //Delete Map
  @Router.delete("/mindmaps/:mapId")
  async deleteMap(mapId: ObjectId) {
    return Mindmap.deleteMap(mapId);
  }

  //Save Map
  @Router.patch("/mindmaps/:mapId")
  async save(mapId: ObjectId, content: string) {
    return Mindmap.saveMap(mapId, content);
  }

  //Clear Map
  @Router.patch("/mindmaps/:mapId/clear")
  async clearMap(mapId: ObjectId) {
    return Mindmap.clearMap(mapId);
  }
}

export default getExpressRouter(new Routes());
