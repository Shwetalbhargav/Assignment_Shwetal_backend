import { isOverdue } from "../utils/date";

describe("date utils", () => {
  test("isOverdue true for past due date unless completed", () => {
    const past = new Date(Date.now() - 60_000).toISOString();

    expect(isOverdue(past, "To Do")).toBe(true);
    expect(isOverdue(past, "Completed")).toBe(false);
  });
});
