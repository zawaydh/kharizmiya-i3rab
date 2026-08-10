/** @vitest-environment jsdom */

import React from "react";
import { afterEach, describe, expect, it } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import WhereIsMyPlaceGame from "../app/components/WhereIsMyPlaceGame";

afterEach(cleanup);

describe("Where Is My Place interaction", () => {
  it("explains the selected wrong location before allowing another attempt", async () => {
    const user = userEvent.setup();
    render(<WhereIsMyPlaceGame />);

    await user.click(screen.getByRole("button", { name: /كَرَّمَ المُعَلِّمُ/u }));

    expect(screen.getByText("هذه البوابة تحتاج صورة أخرى للكلمة")).toBeTruthy();
    expect(screen.getByText("الطَّالِبَ", { exact: true })).toBeTruthy();
    expect(screen.getByText("مفعول به منصوب", { exact: true })).toBeTruthy();

    await user.click(screen.getByRole("button", { name: "جرّب مكانًا آخر" }));
    expect(screen.getByRole("button", { name: /حَضَرَ/u })).toBeTruthy();
  });

  it("rewards the corrected answer and moves to a new mission", async () => {
    const user = userEvent.setup();
    render(<WhereIsMyPlaceGame />);

    await user.click(screen.getByRole("button", { name: /كَرَّمَ المُعَلِّمُ/u }));
    await user.click(screen.getByRole("button", { name: "جرّب مكانًا آخر" }));
    await user.click(screen.getByRole("button", { name: /حَضَرَ/u }));

    expect(screen.getByText("+60")).toBeTruthy();
    await user.click(screen.getByRole("button", { name: "إلى المهمّة التالية" }));
    expect(screen.getByText("المُعَلِّمَ", { exact: true })).toBeTruthy();
  });

  it("turns three direct answers into a streak bonus and an unlocked badge", async () => {
    const user = userEvent.setup();
    render(<WhereIsMyPlaceGame />);

    await user.click(screen.getByRole("button", { name: /حَضَرَ/u }));
    await user.click(screen.getByRole("button", { name: "إلى المهمّة التالية" }));
    await user.click(screen.getByRole("button", { name: /شَكَرَ الطَّالِبُ/u }));
    await user.click(screen.getByRole("button", { name: "إلى المهمّة التالية" }));
    await user.click(screen.getByRole("button", { name: /ذَهَبْتُ إِلَى/u }));

    expect(screen.getByText("+120")).toBeTruthy();
    expect(screen.getByText("فُتح وسام السلسلة الذهبية")).toBeTruthy();
    expect(screen.getByText("منها +20 مكافأة السلسلة")).toBeTruthy();
  });

  it("makes the smart hint visible and lowers a first-attempt reward to eighty", async () => {
    const user = userEvent.setup();
    render(<WhereIsMyPlaceGame />);

    await user.click(screen.getByRole("button", { name: "دليل ذكي" }));
    expect(screen.getByText(/ابحث عن الجملة التي يكون فيها الطالب/u)).toBeTruthy();
    await user.click(screen.getByRole("button", { name: /حَضَرَ/u }));

    expect(screen.getByText("+80")).toBeTruthy();
  });
});
