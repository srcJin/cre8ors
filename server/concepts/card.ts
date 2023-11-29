import { Filter, ObjectId } from "mongodb";

import DocCollection, { BaseDoc } from "../framework/doc";
import { NotAllowedError, NotFoundError } from "./errors";

export interface CardOptions {
  backgroundColor?: string;
}

export interface CardDoc extends BaseDoc {
  author: ObjectId;
  content: string; // TODO do we not? String or URL
  options?: CardOptions;
}

export default class CardConcept {
  public readonly card = new DocCollection<CardDoc>("card");

  async create(author: ObjectId, content: string, options?: CardOptions) {
    const _id = await this.card.createOne({ author, content, options });
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
}

export class CardAuthorNotMatchError extends NotAllowedError {
  constructor(
    public readonly author: ObjectId,
    public readonly _id: ObjectId,
  ) {
    super("You are not the author of this card!");
  }
}
