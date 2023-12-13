// import fetch from "node-fetch";
import DocCollection, { BaseDoc } from "../framework/doc";
const openaiAPI = process.env.OPENAI_API_KEY;

import OpenAI from "openai";
const openai = new OpenAI();

export interface AutosuggestionOptions {
  backgroundColor?: string;
}

export interface AutosuggestionDoc extends BaseDoc {
  ideaBlockContent: string[];
  options?: AutosuggestionOptions;
}

export default class AutosuggestionConcept {
  public readonly autosuggestion = new DocCollection<AutosuggestionDoc>("autosuggestion");

  async suggest(nodeList: { [key: string]: string }) {
    console.log("suggest nodeList", nodeList);
    const connections = await this.GPTAPICall(nodeList);
    return connections;
  }

  async accept() {
    return { msg: "Suggestion added to mindmap successfully!" };
  }

  async reject() {
    return { msg: "Suggestion removed from mindmap successfully!" };
  }

  createJSONPromptFromNodeList = (nodeList: Record<string, string> | undefined) => {
    // console.log("nodeList", nodeList);
    let prompt = "Here are some mindmap node ids with their contents:\n";
    for (const id in nodeList) {
      prompt += `Node ${id}: ${nodeList[id]}\n`;
      // console.log("adding", `Node ${id}: ${nodeList[id]}\n`);
    }
    prompt +=
      "Generate a JSON file that suggests connections between nodes. Less than 5 connection each time, no repeat connections. Return a json formatted object with only the connecting node ids, strictly no other texts.";

    const systemMessage =
      'You are a helpful assistant designed to output JSON. Return a JSON-formatted object with only the connecting node ids, and no other text. strictly follow the example format [{"connections": [{"source": "", "target": ""},{"source": "", "target": ""}...]}]';

    const messages = [
      { role: "system", content: systemMessage },
      { role: "user", content: prompt },
    ];

    return messages;
  };

  GPTAPICall = async (nodeList: { [key: string]: string }) => {
    // Convert nodeList to a string for the GPT prompt
    // OpenAI API endpoint and headers
    // add as any to bypass type checking, it seems that the api doesn't support typescript
    // https://platform.openai.com/docs/guides/text-generation/json-mode
    const completion = await openai.chat.completions.create({
      messages: this.createJSONPromptFromNodeList(nodeList) as any,
      // model: "gpt-4-1106-preview",
      model: "gpt-3.5-turbo-1106",
      response_format: { type: "json_object" },
    });
    const result = completion.choices[0].message.content;
    // console.log("GPTAPICall result=", result);
    return result;
  };
  // // API request body
  // const body = {
  //   model: "GPT-4", // or another model of your choice
  //   messages: message,
  //   max_tokens: 200, // Adjust as needed
  //   temperature: 1.0, // Adjust for creativity
  // };

  // try {
  //   const response = await fetch(endpoint, {
  //     method: "POST",
  //     headers: headers,
  //     body: JSON.stringify(body),
  //   });

  //     const data = await response.json();

  //     // Parse the JSON-formatted response
  //     const connections = JSON.parse(data.choices[0].text);
  //     return connections;
  //   } catch (error) {
  //     console.error("Error in making API call:", error);
  //   }
  // };
}
