export enum CardType {
  url = "url",
  note = "note",
}

export interface Card {
  _id: string;
  title: string;
  type: CardType;
  content: string;
  author: string;
}
