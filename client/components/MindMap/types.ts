import type { Node } from "@vue-flow/core";
import { Card } from "../../types/card";

export type CustomNodeTypes = "custom";
export interface CustomData {
  card: Card;
}
export type CustomNode = Node<CustomData, {}, CustomNodeTypes>;
