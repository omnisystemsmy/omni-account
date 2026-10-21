import { describe, expect, it } from "vitest";
import { initials, lastUsedLabel, parseRemembered, removeAccount, upsertAccount, MAX_REMEMBERED } from "./remembered";

const A = { id: "a", email: "a@x.com", name: "Aiman Yusuf" };
const B = { id: "b", email: "b@x.com", name: "" };

describe("remembered accounts", () => {
  it("upserts, de-duplicates and orders by last use", () => {
    let l = upsertAccount([], A, 1);
    l = upsertAccount(l, B, 2);
    expect(l.map((x) => x.id)).toEqual(["b", "a"]);
    l = upsertAccount(l, { ...A, name: "New" }, 3);
    expect(l.map((x) => x.id)).toEqual(["a", "b"]);
    expect(l[0].name).toBe("New");
  });
  it("caps the list", () => {
    let l: ReturnType<typeof upsertAccount> = [];
    for (let i = 0; i < MAX_REMEMBERED + 3; i++) l = upsertAccount(l, { id: `i${i}`, email: `i${i}@x.com`, name: "" }, i);
    expect(l).toHaveLength(MAX_REMEMBERED);
  });
  it("removes only the entry", () => {
    const l = upsertAccount(upsertAccount([], A, 1), B, 2);
    expect(removeAccount(l, "a").map((x) => x.id)).toEqual(["b"]);
  });
  it("rejects tampered or malformed storage", () => {
    expect(parseRemembered(null)).toEqual([]);
    expect(parseRemembered("not json")).toEqual([]);
    expect(parseRemembered('{"a":1}')).toEqual([]);
    const raw = JSON.stringify([
      { id: "ok", email: "o@x.com", name: "O", lastUsedAt: 5 },
      { id: "bad", email: "nope", name: "O", lastUsedAt: 5 },
      { id: 7, email: "o@x.com", name: "O", lastUsedAt: 5 },
      { id: "ok", email: "dup@x.com", name: "O", lastUsedAt: 4 },
      null,
    ]);
    expect(parseRemembered(raw).map((x) => x.id)).toEqual(["ok"]);
  });
  it("never keeps unexpected fields such as tokens", () => {
    const raw = JSON.stringify([{ id: "a", email: "a@x.com", name: "A", lastUsedAt: 1, access_token: "secret", password: "pw" }]);
    expect(Object.keys(parseRemembered(raw)[0]).sort()).toEqual(["email", "id", "lastUsedAt", "name"]);
  });
  it("builds initials and labels", () => {
    expect(initials("Aiman Yusuf", "a@x.com")).toBe("AY");
    expect(initials("", "zed@x.com")).toBe("ZE");
    const now = new Date(2026, 9, 21, 15).getTime();
    expect(lastUsedLabel(now - 1000, now)).toBe("Today");
    expect(lastUsedLabel(new Date(2026, 9, 20, 10).getTime(), now)).toBe("Yesterday");
  });
});
