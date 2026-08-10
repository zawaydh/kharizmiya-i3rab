import type { PlaceGameCycle } from "./model";
import { SchoolFoundationsCycle } from "./cycle-1";
import { WorkProjectsCycle } from "./cycle-2";
import { FamilyCommunityCycle } from "./cycle-3";
import { CourtMediaCycle } from "./cycle-4";
import { SportsHealthCycle } from "./cycle-5";
import { ResearchNatureCycle } from "./cycle-6";
import { DailyLifeCycle } from "./cycle-7";

export type { PlaceGameChallenge, PlaceGameChoice, PlaceGameCycle } from "./model";

export const WHERE_IS_MY_PLACE_CYCLES: PlaceGameCycle[] = [
  SchoolFoundationsCycle,
  WorkProjectsCycle,
  FamilyCommunityCycle,
  CourtMediaCycle,
  SportsHealthCycle,
  ResearchNatureCycle,
  DailyLifeCycle,
];
