import type { ExerciseTree } from "../../lib/exercise/types";

export const demoTree: ExerciseTree = {
  startNodeId: "q1",
  nodes: {
    q1: {
      id: "q1",
      type: "question",
      text: "هل الجملة اسمية؟",
      hint: "إذا بدأت باسم أو ضمير فهي غالبًا اسمية.",
      answers: [
        {
          id: "a",
          text: "نعم",
          correct: true,
          next: "r1",
          actions: [{ type: "flag.set", key: "canSeeResult" }],
        },
        {
          id: "b",
          text: "لا",
          correct: false,
          next: "wrong1",
        },
      ],
    },
    wrong1: {
      id: "wrong1",
      type: "result",
      text: "هذه إجابة غير صحيحة في هذا المثال. ارجع وحاول مرة أخرى.",
    },
    r1: {
      id: "r1",
      type: "result",
      text: "نتيجة: وصلت إلى النهاية بعد تحقق الشرط.",
      requires: ["canSeeResult"],
    },
  },
};
