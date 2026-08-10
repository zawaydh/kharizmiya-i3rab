import type { ExerciseExample, ExerciseTree } from "./exercise/model";
import { firstWordTree } from "../content/trees/first_word";
import { pastVerbTree } from "../content/trees/verb_past";
import { presentVerbTree } from "../content/trees/verb_present";
import { imperativeVerbTree } from "../content/trees/verb_imperative";
import { faelTree } from "../content/trees/fael";
import { mafoolTree } from "../content/trees/mafool";
import { mafoolatTree } from "../content/trees/mafoolat";
import { halTree } from "../content/trees/hal";
import { tamyizTree } from "../content/trees/tamyiz";
import { munadaTree } from "../content/trees/munada";
import { istithnaTree } from "../content/trees/istithna";
import { laNafiyaTree } from "../content/trees/la_nafiya";
import { naibFaelTree } from "../content/trees/naib_fael";
import { tawabiTree, tawabiNaatTree, tawabiAtfTree, tawabiTawkidTree, tawabiBadalTree } from "../content/trees/tawabi";
import { attachedPronounsTree } from "../content/trees/attached_pronouns";
import { ismManqousTree } from "../content/trees/ism_manqous";
import { cleanMubtadaTree } from "../content/trees/clean_mubtada";
import { cleanKhabarTree } from "../content/trees/clean_khabar";
import { cleanKanaTree } from "../content/trees/clean_kana";
import { cleanInnaTree } from "../content/trees/clean_inna";
import { firstWordExamples, firstWordCoverageKeysOrdered, firstWordQuizExamples } from "../content/examples/first_word.examples";
import { pastVerbExamples, pastVerbCoverageKeysOrdered, pastVerbQuizExamples } from "../content/examples/verb_past.examples";
import { presentVerbExamples, presentVerbCoverageKeysOrdered, presentVerbQuizExamples } from "../content/examples/verb_present.examples";
import { imperativeVerbExamples, imperativeVerbCoverageKeysOrdered, imperativeVerbQuizExamples } from "../content/examples/verb_imperative.examples";
import { faelExamples, faelCoverageKeysOrdered, faelQuizExamples } from "../content/examples/fael.examples";
import { mafoolExamples, mafoolCoverageKeysOrdered, mafoolQuizExamples } from "../content/examples/mafool.examples";
import { mafoolatExamples, mafoolatCoverageKeysOrdered, mafoolatQuizExamples } from "../content/examples/mafoolat.examples";
import { halExamples, halCoverageKeysOrdered, halQuizExamples } from "../content/examples/hal.examples";
import { tamyizExamples, tamyizCoverageKeysOrdered, tamyizQuizExamples } from "../content/examples/tamyiz.examples";
import { munadaExamples, munadaCoverageKeysOrdered, munadaQuizExamples } from "../content/examples/munada.examples";
import { istithnaExamples, istithnaCoverageKeysOrdered, istithnaQuizExamples } from "../content/examples/istithna.examples";
import { laNafiyaExamples, laNafiyaCoverageKeysOrdered, laNafiyaQuizExamples } from "../content/examples/la_nafiya.examples";
import { naibFaelExamples, naibFaelCoverageKeysOrdered, naibFaelQuizExamples } from "../content/examples/naib_fael.examples";
import {
  tawabiExamples,
  tawabiCoverageKeysOrdered,
  tawabiQuizExamples,
  tawabiNaatExamples,
  tawabiNaatCoverageKeysOrdered,
  tawabiNaatQuizExamples,
  tawabiAtfExamples,
  tawabiAtfCoverageKeysOrdered,
  tawabiAtfQuizExamples,
  tawabiTawkidExamples,
  tawabiTawkidCoverageKeysOrdered,
  tawabiTawkidQuizExamples,
  tawabiBadalExamples,
  tawabiBadalCoverageKeysOrdered,
  tawabiBadalQuizExamples,
} from "../content/examples/tawabi.examples";
import { attachedPronounsExamples, attachedPronounsCoverageKeysOrdered, attachedPronounsQuizExamples } from "../content/examples/attached_pronouns.examples";
import { ismManqousExamples, ismManqousCoverageKeysOrdered, ismManqousQuizExamples } from "../content/examples/ism_manqous.examples";
import { cleanMubtadaExamples, cleanMubtadaCoverageKeysOrdered, cleanMubtadaQuizExamples } from "../content/examples/clean_mubtada.examples";
import { cleanKhabarExamples, cleanKhabarCoverageKeysOrdered, cleanKhabarQuizExamples } from "../content/examples/clean_khabar.examples";
import { cleanKanaExamples, cleanKanaCoverageKeysOrdered, cleanKanaQuizExamples } from "../content/examples/clean_kana.examples";
import { cleanInnaExamples, cleanInnaCoverageKeysOrdered, cleanInnaQuizExamples } from "../content/examples/clean_inna.examples";
import {
  getTopicMeta,
  type TopicMetadata,
} from "./topicCatalog";

export {
  VISUAL_PATH_TOPIC_CODES,
  getTopicRoutes,
  hasVisualPath,
  resolveVisualPathTopic,
  type TopicRoutes,
  type VisualPathResolution,
} from "./topicCatalog";

export type TopicDefinition = TopicMetadata & {
  tree: ExerciseTree;
  examples: ExerciseExample[];
  coverageKeysOrdered: string[];
  quizExamples: ExerciseExample[];
  quizCoverageKeysOrdered: string[];
};

type TopicContent = Omit<TopicDefinition, keyof TopicMetadata>;

function defineTopic(code: string, content: TopicContent): TopicDefinition {
  const metadata = getTopicMeta(code);
  if (!metadata) throw new Error(`TOPIC_METADATA_MISSING:${code}`);
  return {
    ...metadata,
    ...content,
    quizCount: Math.min(metadata.quizCount, content.quizExamples.length),
  };
}

export const TOPICS: TopicDefinition[] = [
  defineTopic("first-word-key", { tree: firstWordTree, examples: firstWordExamples, coverageKeysOrdered: firstWordCoverageKeysOrdered, quizExamples: firstWordQuizExamples, quizCoverageKeysOrdered: firstWordCoverageKeysOrdered }),
  defineTopic("past-verb", { tree: pastVerbTree, examples: pastVerbExamples, coverageKeysOrdered: pastVerbCoverageKeysOrdered, quizExamples: pastVerbQuizExamples, quizCoverageKeysOrdered: pastVerbCoverageKeysOrdered }),
  defineTopic("present-verb", { tree: presentVerbTree, examples: presentVerbExamples, coverageKeysOrdered: presentVerbCoverageKeysOrdered, quizExamples: presentVerbQuizExamples, quizCoverageKeysOrdered: presentVerbCoverageKeysOrdered }),
  defineTopic("imperative-verb", { tree: imperativeVerbTree, examples: imperativeVerbExamples, coverageKeysOrdered: imperativeVerbCoverageKeysOrdered, quizExamples: imperativeVerbQuizExamples, quizCoverageKeysOrdered: imperativeVerbCoverageKeysOrdered }),
  defineTopic("fael", { tree: faelTree, examples: faelExamples, coverageKeysOrdered: faelCoverageKeysOrdered, quizExamples: faelQuizExamples, quizCoverageKeysOrdered: faelCoverageKeysOrdered }),
  defineTopic("mafool-bih", { tree: mafoolTree, examples: mafoolExamples, coverageKeysOrdered: mafoolCoverageKeysOrdered, quizExamples: mafoolQuizExamples, quizCoverageKeysOrdered: mafoolCoverageKeysOrdered }),
  defineTopic("mafoolat", { tree: mafoolatTree, examples: mafoolatExamples, coverageKeysOrdered: mafoolatCoverageKeysOrdered, quizExamples: mafoolatQuizExamples, quizCoverageKeysOrdered: mafoolatCoverageKeysOrdered }),
  defineTopic("naib-fael", { tree: naibFaelTree, examples: naibFaelExamples, coverageKeysOrdered: naibFaelCoverageKeysOrdered, quizExamples: naibFaelQuizExamples, quizCoverageKeysOrdered: naibFaelCoverageKeysOrdered }),
  defineTopic("hal", { tree: halTree, examples: halExamples, coverageKeysOrdered: halCoverageKeysOrdered, quizExamples: halQuizExamples, quizCoverageKeysOrdered: halCoverageKeysOrdered }),
  defineTopic("tamyiz", { tree: tamyizTree, examples: tamyizExamples, coverageKeysOrdered: tamyizCoverageKeysOrdered, quizExamples: tamyizQuizExamples, quizCoverageKeysOrdered: tamyizCoverageKeysOrdered }),
  defineTopic("munada", { tree: munadaTree, examples: munadaExamples, coverageKeysOrdered: munadaCoverageKeysOrdered, quizExamples: munadaQuizExamples, quizCoverageKeysOrdered: munadaCoverageKeysOrdered }),
  defineTopic("istithna", { tree: istithnaTree, examples: istithnaExamples, coverageKeysOrdered: istithnaCoverageKeysOrdered, quizExamples: istithnaQuizExamples, quizCoverageKeysOrdered: istithnaCoverageKeysOrdered }),
  defineTopic("la-nafiya", { tree: laNafiyaTree, examples: laNafiyaExamples, coverageKeysOrdered: laNafiyaCoverageKeysOrdered, quizExamples: laNafiyaQuizExamples, quizCoverageKeysOrdered: laNafiyaCoverageKeysOrdered }),
  defineTopic("tawabi-naat", { tree: tawabiNaatTree, examples: tawabiNaatExamples, coverageKeysOrdered: tawabiNaatCoverageKeysOrdered, quizExamples: tawabiNaatQuizExamples, quizCoverageKeysOrdered: tawabiNaatCoverageKeysOrdered }),
  defineTopic("tawabi-atf", { tree: tawabiAtfTree, examples: tawabiAtfExamples, coverageKeysOrdered: tawabiAtfCoverageKeysOrdered, quizExamples: tawabiAtfQuizExamples, quizCoverageKeysOrdered: tawabiAtfCoverageKeysOrdered }),
  defineTopic("tawabi-tawkid", { tree: tawabiTawkidTree, examples: tawabiTawkidExamples, coverageKeysOrdered: tawabiTawkidCoverageKeysOrdered, quizExamples: tawabiTawkidQuizExamples, quizCoverageKeysOrdered: tawabiTawkidCoverageKeysOrdered }),
  defineTopic("tawabi-badal", { tree: tawabiBadalTree, examples: tawabiBadalExamples, coverageKeysOrdered: tawabiBadalCoverageKeysOrdered, quizExamples: tawabiBadalQuizExamples, quizCoverageKeysOrdered: tawabiBadalCoverageKeysOrdered }),
  defineTopic("tawabi", { tree: tawabiTree, examples: tawabiExamples, coverageKeysOrdered: tawabiCoverageKeysOrdered, quizExamples: tawabiQuizExamples, quizCoverageKeysOrdered: tawabiCoverageKeysOrdered }),
  defineTopic("attached-pronouns", { tree: attachedPronounsTree, examples: attachedPronounsExamples, coverageKeysOrdered: attachedPronounsCoverageKeysOrdered, quizExamples: attachedPronounsQuizExamples, quizCoverageKeysOrdered: attachedPronounsCoverageKeysOrdered }),
  defineTopic("ism-manqous", { tree: ismManqousTree, examples: ismManqousExamples, coverageKeysOrdered: ismManqousCoverageKeysOrdered, quizExamples: ismManqousQuizExamples, quizCoverageKeysOrdered: ismManqousCoverageKeysOrdered }),
  defineTopic("nominal-advanced", { tree: cleanMubtadaTree, examples: cleanMubtadaExamples, coverageKeysOrdered: cleanMubtadaCoverageKeysOrdered, quizExamples: cleanMubtadaQuizExamples, quizCoverageKeysOrdered: cleanMubtadaCoverageKeysOrdered }),
  defineTopic("khabar", { tree: cleanKhabarTree, examples: cleanKhabarExamples, coverageKeysOrdered: cleanKhabarCoverageKeysOrdered, quizExamples: cleanKhabarQuizExamples, quizCoverageKeysOrdered: cleanKhabarCoverageKeysOrdered }),
  defineTopic("kana-wa-akhawatuha", { tree: cleanKanaTree, examples: cleanKanaExamples, coverageKeysOrdered: cleanKanaCoverageKeysOrdered, quizExamples: cleanKanaQuizExamples, quizCoverageKeysOrdered: cleanKanaCoverageKeysOrdered }),
  defineTopic("inna-wa-akhawatuha", { tree: cleanInnaTree, examples: cleanInnaExamples, coverageKeysOrdered: cleanInnaCoverageKeysOrdered, quizExamples: cleanInnaQuizExamples, quizCoverageKeysOrdered: cleanInnaCoverageKeysOrdered }),
];

export function getTopicByCode(code: string): TopicDefinition | null {
  return TOPICS.find((topic) => topic.code === code) ?? null;
}

export function getReadyTopics(): TopicDefinition[] {
  return TOPICS.filter((topic) => topic.isReady);
}
