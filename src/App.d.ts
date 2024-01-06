import { ReactElement } from "react";

export interface Stories {
  [key: string | number]: StoriesObjects;
}

export interface StoriesObject {
  title: string;
  url: string;
  author: string;
  num_comments?: number;
  points: number;
  objectID: number;
}

export interface SearchProps {
  onInputChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  value: string;
  id: string;
  type?: string;
  children: ReactElement;
}

interface StoriesDataObject {
  stories: StoriesObject;
}

export interface StoriesData {
  data: StoriesDataObject<Array>;
}

interface StoriesReducerPayload {
  objectID?: string | number;
}

export interface StoriesReducerAction {
  type?: string;
  payload?: typeof StoriesReducerPayload;
}