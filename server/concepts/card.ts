import { Filter, ObjectId } from "mongodb";

import DocCollection, { BaseDoc } from "../framework/doc";
import { NotAllowedError, NotFoundError } from "./errors";

export type CardType = "note" | "url";
export interface CardDoc extends BaseDoc {
  author: ObjectId;
  title: string;
  type: CardType;
  content: string; // String or URL
}

export default class CardConcept {
  public readonly card = new DocCollection<CardDoc>("card");

  async create(author: ObjectId, type: CardType, title: string, content: string) {
    const _id = await this.card.createOne({ author, type, title, content });
    return { msg: "Card created successfully!", card: await this.card.readOne({ _id }) };
  }

  async getCards(query: Filter<CardDoc>) {
    const card = await this.card.readMany(query, {
      sort: { dateUpdated: -1 },
    });
    return card;
  }

  async getByAuthor(author: ObjectId) {
    return await this.getCards({ author });
  }

  async getByContent(content: string) {
    return await this.getCards({ content: content });
  }

  async getById(_id: ObjectId) {
    // console.log("cards.ts getById", _id);
    return await this.card.readOne({ _id });
  }

  async update(_id: ObjectId, update: Partial<CardDoc>) {
    this.sanitizeUpdate(update);
    await this.card.updateOne({ _id }, update);
    return { msg: "Card updated successfully!" };
  }

  async delete(_id: ObjectId) {
    await this.card.deleteOne({ _id });
    return { msg: "Card deleted successfully!" };
  }

  async isAuthor(user: ObjectId, _id: ObjectId) {
    const card = await this.card.readOne({ _id });
    if (!card) {
      throw new NotFoundError(`Card ${_id} does not exist!`);
    }
    if (card.author.toString() !== user.toString()) {
      throw new CardAuthorNotMatchError(user, _id);
    }
  }

  private sanitizeUpdate(update: Partial<CardDoc>) {
    // Make sure the update cannot change the author.
    const allowedUpdates = ["content", "options"];
    for (const key in update) {
      if (!allowedUpdates.includes(key)) {
        throw new NotAllowedError(`Cannot update '${key}' field!`);
      }
    }
  }
}

export class CardAuthorNotMatchError extends NotAllowedError {
  constructor(
    public readonly author: ObjectId,
    public readonly _id: ObjectId,
  ) {
    super("You are not the author of this card!");
  }
}
