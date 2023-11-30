import { ObjectId } from "mongodb";
import DocCollection, { BaseDoc } from "../framework/doc";
import { NotAllowedError, NotFoundError } from "./errors";

export interface MindMapDoc extends BaseDoc {
  title: string;
  description: string;
  owner: ObjectId;
  contributors: ObjectId[];
  ideaBlocks: ObjectId[];
}

export interface MindMapConnectionsDoc extends BaseDoc {
  mapId: ObjectId;
  from: ObjectId;
  to: ObjectId;
}

export default class MindMapConcept {
  public readonly mindMap = new DocCollection<MindMapDoc>("ideaBlocks");
  public readonly connections = new DocCollection<MindMapConnectionsDoc>("mapConnections");

  async create(title: string, description: string, owner: ObjectId, contributors: ObjectId[], ideaBlocks: ObjectId[]) {
    const _id = await this.mindMap.createOne({ title, description, owner, contributors, ideaBlocks });
    return { msg: " project successfully created!", mindMap: await this.mindMap.readOne({ _id }) };
  }
  async getConnectionsFrom(_id: ObjectId, ideaBlock: ObjectId) {
    return await this.connections.readMany({ $and: [{ mapId: _id }, { from: ideaBlock }] });
  }

  async getConnectionsTo(_id: ObjectId, ideaBlock: ObjectId) {
    return await this.connections.readMany({ $and: [{ mapId: _id }, { to: ideaBlock }] });
  }

  async connect(_id: ObjectId, from: ObjectId, to: ObjectId) {
    const mindMap = await this.mindMap.readOne({ _id });
    if (!mindMap) {
      throw new NotFoundError(`Mindmap ${_id} does not exist`);
    }
    if (!mindMap.ideaBlocks.includes(from)) {
      await this.addideaBlock(_id, from);
    }
    if (!mindMap.ideaBlocks.includes(to)) {
      await this.addideaBlock(_id, to);
    }
    await this.isNotConnected(_id, from, to);
    await this.connections.createOne({ mapId: _id, from, to });
    return { msg: `${from} got connected to ${to} in mindmap ${_id}` };
  }

  async disconnect(_id: ObjectId, ideaBlock1: ObjectId, ideaBlock2: ObjectId) {
    const connection = await this.connections.popOne({ mapId: _id, from: ideaBlock1, to: ideaBlock2 });
    if (connection === null) {
      throw new ConnectionNotFoundError(_id, ideaBlock1, ideaBlock2);
    }
    return { msg: "Disconnected!" };
  }

  async getIdeaBlocks(_id: ObjectId) {
    const mindMap = await this.mindMap.readOne({ _id });
    if (!mindMap) {
      throw new NotFoundError(`Mindmap ${_id} does not exist`);
    }
    return mindMap.ideaBlocks;
  }

  async addideaBlock(_id: ObjectId, ideaBlock: ObjectId) {
    const mindMap = await this.mindMap.readOne({ _id });
    if (!mindMap) {
      throw new NotFoundError(`Mindmap ${_id} does not exist`);
    }
    const ideaBlocks = mindMap.ideaBlocks;
    if (ideaBlocks.includes(ideaBlock)) {
      throw new AlreadyAddedError(ideaBlock);
    }

    ideaBlocks.push(ideaBlock);
    await this.updateMap(_id, { ideaBlocks });
    return { msg: "ideaBlock successfully added!" };
  }

  async removeideaBlock(_id: ObjectId, ideaBlock: ObjectId) {
    const mindMap = await this.mindMap.readOne({ _id });
    if (!mindMap) {
      throw new NotFoundError(`Mindmap ${_id} does not exist`);
    }
    const connectionsFrom = await this.getConnectionsFrom(_id, ideaBlock);
    for (const connection of connectionsFrom) {
      await this.connections.deleteOne({ _id: connection._id });
    }
    const connectionsTo = await this.getConnectionsTo(_id, ideaBlock);
    for (const connection of connectionsTo) {
      await this.connections.deleteOne({ _id: connection._id });
    }

    const ideaBlocks = mindMap.ideaBlocks.filter((elt) => {
      return elt.toString() !== ideaBlock.toString();
    });

    await this.updateMap(_id, { ideaBlocks });
    return { msg: "IdeaBlock successfully removed!" };
  }

  async updateTo(id_1: ObjectId, id_2: ObjectId) {
    const mindMap1 = await this.mindMap.readOne({ _id: id_1 });
    const mindMap2 = await this.mindMap.readOne({ _id: id_2 });
    if (!mindMap2 || !mindMap1) {
      throw new NotFoundError(`Can not update non-existing maps`);
    }

    const newIdeaBlocks = mindMap2.ideaBlocks;
    await this.updateMap(id_1, { ideaBlocks: newIdeaBlocks }); //transfer ideaBlocks
    await this.connections.deleteMany({ mapId: id_1 });
    const connections = await this.getConnections(id_2);
    for (const connection of connections) {
      //transfer ideaBlocks connections
      await this.connections.updateOne({ _id: connection._id }, { mapId: id_1 });
    }
  }

  async getConnections(_id: ObjectId) {
    const mindMap = await this.mindMap.readOne({ _id });
    if (!mindMap) {
      throw new NotFoundError(`Mindmap ${_id} does not exist`);
    }
    const ideaBlocks = mindMap.ideaBlocks;
    const connections: ObjectId[] = [];

    for (const block of ideaBlocks) {
      const connectionsFrom = (await this.getConnectionsFrom(_id, block)).map((elt) => elt._id);
      for (const connection of connectionsFrom) {
        if (!connections.includes(connection)) {
          connections.push(connection);
        }
      }
      const connectionsTo = (await this.getConnectionsTo(_id, block)).map((elt) => elt._id);
      for (const connection of connectionsTo) {
        if (connections.includes(connection)) {
          connections.push(connection);
        }
      }
    }

    const result: MindMapConnectionsDoc[] = [];
    for (const _id of connections) {
      const connection = await this.connections.readOne({ _id });
      if (connection) {
        result.push(connection);
      }
    }

    return result;
  }

  private async updateMap(_id: ObjectId, update: Partial<MindMapDoc>) {
    await this.mindMap.updateOne({ _id }, update);
    return { msg: "Updated mindMap ideaBlocks!", updated_mindMap: await this.mindMap.readOne({ _id }) };
  }

  private async isNotConnected(mapId: ObjectId, ideaBlock1: ObjectId, ideaBlock2: ObjectId) {
    const connection = await this.connections.readOne({ mapId: mapId, from: ideaBlock1, to: ideaBlock2 });
    if (connection !== null || ideaBlock1.toString() === ideaBlock2.toString()) {
      throw new ConnectionAlreadyExistsError(mapId, ideaBlock1, ideaBlock2);
    }
  }
}

export class ConnectionNotFoundError extends NotFoundError {
  constructor(
    public readonly map: ObjectId,
    public readonly from: ObjectId,
    public readonly to: ObjectId,
  ) {
    super("Connection from {0} to {1} does not exist in map {2}!", from, to, map);
  }
}

export class ConnectionAlreadyExistsError extends NotAllowedError {
  constructor(
    public readonly map: ObjectId,
    public readonly from: ObjectId,
    public readonly to: ObjectId,
  ) {
    super("The connection between {0} and {1} already exists in map {2}!", from, to, map);
  }
}

export class AlreadyAddedError extends NotAllowedError {
  constructor(public readonly ideaBlock: ObjectId) {
    super("The ideaBlock {0} was already added!", ideaBlock);
  }
}
