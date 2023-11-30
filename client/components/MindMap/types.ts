import type { Node } from "@vue-flow/core";

export type CustomNodeTypes = "note" | "url";
export interface CustomData {
  title: string;
  text: string;
}
export type CustomNode = Node<CustomData, {}, CustomNodeTypes>;
