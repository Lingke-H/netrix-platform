import { afterEach, describe, expect, it } from "vitest";

import { buildAuthRedirectUrl, parseAuthEmailRequestFormData } from "@/features/auth/server/request";

const originalAppBaseUrl = process.env.APP_BASE_URL;

afterEach(() => {
  process.env.APP_BASE_URL = originalAppBaseUrl;
});

describe("auth server actions helpers", () => {
  it("parses campus email sign-in form data with a safe next route", () => {
    const formData = new FormData();
    formData.set("email", " Student@Nottingham.Edu.Cn ");
    formData.set("next", "/feed?from=auth");

    const parsed = parseAuthEmailRequestFormData(formData);

    expect(parsed.email.success).toBe(true);
    expect(parsed.email.success ? parsed.email.data : null).toBe("student@nottingham.edu.cn");
    expect(parsed.nextRoute).toBe("/feed?from=auth");
  });

  it("rejects non-campus email sign-in form data and unsafe next routes", () => {
    const formData = new FormData();
    formData.set("email", "student@example.com");
    formData.set("next", "https://example.com");

    const parsed = parseAuthEmailRequestFormData(formData);

    expect(parsed.email.success).toBe(false);
    expect(parsed.nextRoute).toBe("/me");
  });

  it("builds the Supabase callback URL with a sanitized next route", () => {
    process.env.APP_BASE_URL = "https://netrix.example";

    expect(buildAuthRedirectUrl("/recommendations?from=auth")).toBe(
      "https://netrix.example/auth/callback?next=%2Frecommendations%3Ffrom%3Dauth",
    );
    expect(buildAuthRedirectUrl("/auth?next=/feed")).toBe("https://netrix.example/auth/callback?next=%2Fme");
  });
});
