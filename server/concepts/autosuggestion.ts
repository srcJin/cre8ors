import axios from "axios";
import DocCollection, { BaseDoc } from "../framework/doc";

const openaiAPI = process.env.OPENAI_API_KEY;

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
    const prompt = ideaBlockContent.join("\n");

    try {
      const response = await axios.post(
        "https://api.openai.com/v1/engines/davinci/completions",
        {
          prompt: prompt,
          max_tokens: 150, // Adjust as needed
          ...options, // Any additional options you want to pass
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${openaiAPI}`, // Properly format the Authorization header
          },
        },
      );

      const suggestions = response.data.choices.map((choice: { text: string }) => choice.text.trim());
      const generatedOrderText = response.data.choices[0].text;
      const generatedOrder = generatedOrderText.split(",").map((num: string) => parseInt(num.trim()));

      // Reorder the suggestions based on the specified order
      const orderedSuggestions: string[] = generatedOrder.map((index: string | number) => suggestions[index]);
      return orderedSuggestions;
    } catch (error) {
      console.error("Error making GPT-3 API call:", error);
      throw error;
    }
  }

  async accept() {
    return { msg: "Suggestion added to mindmap successfully!" };
  }

  async reject() {
    return { msg: "Suggestion removed from mindmap successfully!" };
  }
}
