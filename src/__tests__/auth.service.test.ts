/// <reference types="jest" />

import { signAccessToken, verifyAccessToken } from "../utils/jwt.js";

describe("jwt utils", () => {
  test("sign + verify roundtrip", () => {
    const token = signAccessToken({ id: "u1", email: "a@b.com", name: "A" });
    const payload = verifyAccessToken(token);

    expect(payload.id).toBe("u1");
    expect(payload.email).toBe("a@b.com");
  });
});
