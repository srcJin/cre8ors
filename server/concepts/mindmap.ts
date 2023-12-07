import { ObjectId } from "mongodb";
import DocCollection, { BaseDoc } from "../framework/doc";
import { NotAllowedError, NotFoundError } from "./errors";

export interface MindMapDoc extends BaseDoc {
  title: string;
  description: string;
  content: string;
  contributors: ObjectId[];
  ideaBlocks: ObjectId[];
}

export default class MindMapConcept {
  public readonly mindMap = new DocCollection<MindMapDoc>("mindMaps");

  // Create Mindmap
  async create(title: string, description: string, content: string, contributors: ObjectId[], ideaBlocks: ObjectId[]) {
    const _id = await this.mindMap.createOne({ title, description, content, contributors, ideaBlocks });
    return { msg: " MindMap successfully created!", mindMap: await this.mindMap.readOne({ _id }) };
  }

  // Get content by id
  async getMap(_id: ObjectId) {
    const mindMap = await this.mindMap.readOne({ _id });
    if (!mindMap) {
      throw new NotFoundError(`Mindmap ${_id} does not exist`);
    }
    return mindMap;
  }

  // Get Mindmap by User
  async getMapByUser(user: ObjectId) {
    const maps = await this.mindMap.readMany({ contributors: { $exists: true } }, {
        sort: { dateUpdated: -1 },
      },);
    const usermaps: MindMapDoc[] = [];
    for (const map of maps) {
      const contributors = map.contributors.map((contributor) => contributor.toString());
      if (contributors.includes(user.toString())) {
        usermaps.push(map);
      }
    }
    return usermaps;
  }

  async getIdeaBlocks(_id: ObjectId) {
    const mindMap = await this.mindMap.readOne({ _id });
    if (!mindMap) {
      throw new NotFoundError(`Mindmap ${_id} does not exist`);
    }
    return mindMap.ideaBlocks;
  }

  //Delete by id
  async deleteMap(_id: ObjectId) {
    await this.mindMap.deleteOne({ _id });
    return { msg: "MindMap Deleted Successfully" };
  }

  //save
  async saveMap(_id: ObjectId, content: string) {
    const mindMap = await this.mindMap.readOne({ _id });
    if (!mindMap) {
      throw new NotFoundError(`Mindmap ${_id} does not exist`);
    }
    await this.updateMap(_id, { content });
    return { msg: "MindMap Saved" };
  }

  //Clear Map
  async clearMap(_id: ObjectId) {
    const mindMap = await this.mindMap.readOne({ _id });
    if (!mindMap) {
      throw new NotFoundError(`Mindmap ${_id} does not exist`);
    }
    await this.updateMap(_id, { content: "" });
    return { msg: "MindMap Cleared" };
  }

  //Add a list of ideablocks to MindMap
  async updateIdeaBlocks(_id: ObjectId, ideaBlocks: ObjectId[]) {
    const mindMap = await this.mindMap.readOne({ _id });
    if (!mindMap) {
      throw new NotFoundError(`Mindmap ${_id} does not exist`);
    }
    await this.updateMap(_id, { ideaBlocks });
    return { msg: "ideaBlock successfully added!" };
  }

  //Remove ideablock
  async removeideaBlock(_id: ObjectId, ideaBlock: ObjectId) {
    const mindMap = await this.mindMap.readOne({ _id });
    if (!mindMap) {
      throw new NotFoundError(`Mindmap ${_id} does not exist`);
    }

    const ideaBlocks = mindMap.ideaBlocks.filter((elt) => {
      return elt.toString() !== ideaBlock.toString();
    });

    await this.updateMap(_id, { ideaBlocks });
    return { msg: "IdeaBlock successfully removed!" };
  }

  //Add users to Map
  async shareMap(_id: ObjectId, user: ObjectId) {
    const mindMap = await this.mindMap.readOne({ _id });
    if (!mindMap) {
      throw new NotFoundError(`Mindmap ${_id} does not exist`);
    }
    const contributors = mindMap.contributors;
    if (contributors.includes(user)) {
      throw new AlreadyAddedError(user);
    }

    contributors.push(user);
    await this.updateMap(_id, { contributors });
    return { msg: "Project successfully shared!" };
  }

  private async updateMap(_id: ObjectId, update: Partial<MindMapDoc>) {
    await this.mindMap.updateOne({ _id }, update);
    return { msg: "Updated mindMap ideaBlocks!", updated_mindMap: await this.mindMap.readOne({ _id }) };
  }
}

export class AlreadyAddedError extends NotAllowedError {
  constructor(public readonly ideaBlock: ObjectId) {
    super("The ideaBlock/user {0} was already added!", ideaBlock);
  }
}
