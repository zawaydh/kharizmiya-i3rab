export type PlaceGameChoice = {
  id: string;
  sentence: string;
  requiredForm: string;
  role: string;
  explanation: string;
};

export type PlaceGameChallenge = {
  id: string;
  topic: string;
  skill: string;
  word: string;
  correctChoiceId: string;
  hint: string;
  choices: [PlaceGameChoice, PlaceGameChoice, PlaceGameChoice];
};

export type PlaceGameCycle = {
  id: string;
  title: string;
  theme: string;
  challenges: PlaceGameChallenge[];
};
