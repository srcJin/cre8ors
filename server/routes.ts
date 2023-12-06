import { ObjectId } from "mongodb";

import { Router, getExpressRouter } from "./framework/router";

import { Autosuggestion, Card, Mindmap, User, WebSession } from "./app";
import { CardDoc } from "./concepts/card";
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

  @Router.post("/mindmaps")
  async startProject(session: WebSessionDoc, title: string, description: string) {
    const user = WebSession.getUser(session);
    const mindMap = (await Mindmap.create(title, description, "", [user], [])).mindMap;
    return Responses.mindMap(mindMap);
  }

  @Router.post("/mindmaps/:mapId/ideablocks")
  async updateIdeaBlocks(mapId: ObjectId, ideaBlocks: ObjectId[]) {
    return Mindmap.updateIdeaBlocks(mapId, ideaBlocks);
  }

  @Router.delete("/mindmaps/:mapId/ideablocks/:ideablock")
  async removeIdeaBlock(mapId: ObjectId, ideablock: ObjectId) {
    return Mindmap.removeideaBlock(mapId, ideablock);
  }

  @Router.get("/mindmaps/:mapId/ideablocks")
  async getIdeaBlocks(mapId: ObjectId) {
    const cardIds = await Mindmap.getIdeaBlocks(mapId);
    console.log(cardIds);
    return await Card.getCards({ _id: { $in: cardIds.map((id) => new ObjectId(id)) } });
  }

  //Get Map By id
  @Router.get("/mindmaps/:_id")
  async getMap(_id: ObjectId) {
    const map = await Mindmap.getMap(_id);
    return Responses.mindMap(map);
  }

  //Get Maps By user
  @Router.get("/mindmaps/user/:username")
  async getMapByUser(username: string) {
    const id = (await User.getUserByUsername(username))._id;
    const maps = await Mindmap.getMapByUser(id);
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

  @Router.get("/cards")
  async getCards(author?: string) {
    let cards;
    if (author) {
      const id = (await User.getUserByUsername(author))._id;
      cards = await Card.getByAuthor(id);
    } else {
      cards = await Card.getCards({});
    }
    return Responses.cards(cards);
  }

  @Router.post("/cards")
  async createCard(session: WebSessionDoc, title: string, type: CardType, content: string) {
    const user = WebSession.getUser(session);
    const created = await Card.create(user, type, title, content);
    return { msg: created.msg, card: await Responses.card(created.card) };
  }

  @Router.patch("/cards/:_id")
  async updateCard(session: WebSessionDoc, _id: ObjectId, update: Partial<CardDoc>) {
    const user = WebSession.getUser(session);
    await Card.isAuthor(user, _id);
    return await Card.update(_id, update);
  }

  @Router.delete("/cards/:_id")
  async deleteCard(session: WebSessionDoc, _id: ObjectId) {
    const user = WebSession.getUser(session);
    await Card.isAuthor(user, _id);
    return Card.delete(_id);
  }
  @Router.post("/autosuggestion/suggest")
  async suggest(mapId: ObjectId) {
    const cards = await Mindmap.getIdeaBlocks(mapId);
    const cardDocs = await Promise.all(cards.map(async (card) => (await Card.getCards(card))[0]));
    const cardContents = cardDocs.map((card) => card.content);
    const suggestion = await Autosuggestion.suggest(cardContents);
    return suggestion.autosuggestion;
  }

  // TODO: Fix Mindmap doesn't have Mindmap.addideaBlock
  @Router.post("/autosuggestion/accept")
  async accept(mapId: ObjectId, cardId: ObjectId) {
    return Mindmap.addideaBlock(mapId, cardId);
  }

  @Router.post("/autosuggestion/reject")
  async reject() {
    return await Autosuggestion.reject();
  }
}

export default getExpressRouter(new Routes());
