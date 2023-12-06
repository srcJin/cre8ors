import DocCollection, { BaseDoc } from "../framework/doc";

export interface AutosuggestionOptions {
  backgroundColor?: string;
}

export interface AutosuggestionDoc extends BaseDoc {
  ideaBlockContent: string[];
  options?: AutosuggestionOptions;
}

export default class AutosuggestionConcept {
  public readonly autosuggestion = new DocCollection<AutosuggestionDoc>("autosuggestion");

  async suggest(ideaBlockContent: string[], options?: AutosuggestionOptions) {
    // loop
    // gpt call
    const _id = await this.autosuggestion.createOne({ ideaBlockContent, options });
    return { msg: "Suggestion created successfully!", autosuggestion: await this.autosuggestion.readOne({ _id }) };
  }

  async accept() {
    // project: ObjectId, card: ObjectId, options?: AutosuggestionOptions
    // find autosuggestion with given card in autosuggestion collection above
    // add autosuggestion to proj
    return { msg: "Suggestion added to mindmap successfully!" }; // this method is currently not used
  }

  async reject() {
    return { msg: "Suggestion removed from mindmap successfully!" };
  }
}
