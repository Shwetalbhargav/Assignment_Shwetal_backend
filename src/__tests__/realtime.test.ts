import { REALTIME_EVENTS, userRoom } from "../modules/realtime/realtime.events";

describe("realtime events", () => {
  test("userRoom formats correctly", () => {
    expect(userRoom("123")).toBe("user:123");
  });

  test("events have expected keys", () => {
    expect(REALTIME_EVENTS.TASK_UPDATED).toBe("task:updated");
    expect(REALTIME_EVENTS.AUTH).toBe("auth");
  });
});
