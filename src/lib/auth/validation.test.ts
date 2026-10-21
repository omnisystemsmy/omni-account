import { describe, expect, it } from "vitest";
import { passwordStrength, safeNext, validateEmail, validateNewPassword } from "./validation";

describe("validation", () => {
  it("validates email", () => {
    expect(validateEmail("")).not.toBeNull();
    expect(validateEmail("a@b")).not.toBeNull();
    expect(validateEmail(" a@b.co ")).toBeNull();
  });
  it("validates password", () => {
    expect(validateNewPassword("short1")).not.toBeNull();
    expect(validateNewPassword("onlyletters")).not.toBeNull();
    expect(validateNewPassword("longenough1")).toBeNull();
  });
  it("rates strength", () => {
    expect(passwordStrength("")).toBeNull();
    expect(passwordStrength("abc")?.label).toBe("Weak");
    expect(passwordStrength("Abcdefgh1!xyz")?.label).toBe("Strong");
  });
  it("blocks open redirects", () => {
    expect(safeNext("/account/security")).toBe("/account/security");
    expect(safeNext("//evil.com")).toBe("/account");
    expect(safeNext("https://evil.com")).toBe("/account");
    expect(safeNext("/\\evil.com")).toBe("/account");
    expect(safeNext(null)).toBe("/account");
  });
});
