import type { Node } from "@vue-flow/core";

export type CustomNodeTypes = "note" | "url";
export interface CustomData {
  _id: string;
  title: string;
  text: string;
}
export type CustomNode = Node<CustomData, {}, CustomNodeTypes>;

export interface Card extends CustomData {
  type: CustomNodeTypes;
}
