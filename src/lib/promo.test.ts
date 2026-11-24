import { describe, expect, it } from "vitest";
import { addDays, daysBetween, formatKazakhDate, isValidCalendarDate, toCalendarDate } from "./dates";
import { isPromoEligible } from "./promo";

describe("isPromoEligible", () => {
  it("exactly 7 days ahead → eligible", () => {
    expect(isPromoEligible("2026-12-13", "2026-12-20")).toBe(true);
  });
  it("8 days ahead → eligible", () => {
    expect(isPromoEligible("2026-12-12", "2026-12-20")).toBe(true);
  });
  it("10 days ahead → eligible (spec example)", () => {
    expect(isPromoEligible("2026-12-10", "2026-12-20")).toBe(true);
  });
  it("6 days ahead → not eligible", () => {
    expect(isPromoEligible("2026-12-14", "2026-12-20")).toBe(false);
  });
  it("5 days ahead → not eligible (spec example)", () => {
    expect(isPromoEligible("2026-12-15", "2026-12-20")).toBe(false);
  });
  it("same day → not eligible", () => {
    expect(isPromoEligible("2026-12-20", "2026-12-20")).toBe(false);
  });
  it("delivery date in the past → not eligible", () => {
    expect(isPromoEligible("2026-12-20", "2026-12-10")).toBe(false);
  });
  it("across a month boundary", () => {
    expect(isPromoEligible("2026-11-24", "2026-12-01")).toBe(true); // 7 days
    expect(isPromoEligible("2026-11-25", "2026-12-01")).toBe(false); // 6 days
  });
  it("across a year boundary", () => {
    expect(isPromoEligible("2026-12-26", "2027-01-02")).toBe(true); // 7 days
    expect(isPromoEligible("2026-12-27", "2027-01-02")).toBe(false); // 6 days
  });
  it("across February in a leap year", () => {
    expect(isPromoEligible("2028-02-22", "2028-02-29")).toBe(true);
    expect(isPromoEligible("2028-02-23", "2028-03-01")).toBe(true); // 2028-02-29 exists
    expect(isPromoEligible("2027-02-23", "2027-03-01")).toBe(false); // 6 days in a non-leap year
  });
  it("across a DST change elsewhere (date math is timezone-free)", () => {
    // Europe switches to winter time on 2026-10-25; calendar distance is still 7
    expect(isPromoEligible("2026-10-20", "2026-10-27")).toBe(true);
    expect(isPromoEligible("2026-03-25", "2026-04-01")).toBe(true);
  });
  it("missing or invalid dates → not eligible", () => {
    expect(isPromoEligible("2026-12-01", null)).toBe(false);
    expect(isPromoEligible(null, "2026-12-20")).toBe(false);
    expect(isPromoEligible("2026-12-01", "")).toBe(false);
    expect(isPromoEligible("2026-12-01", "2026-02-30")).toBe(false);
    expect(isPromoEligible("2026-12-01", "20.12.2026")).toBe(false);
  });
});

describe("dates", () => {
  it("daysBetween / addDays", () => {
    expect(daysBetween("2026-12-31", "2027-01-01")).toBe(1);
    expect(addDays("2026-12-31", 1)).toBe("2027-01-01");
    expect(addDays("2028-02-28", 1)).toBe("2028-02-29");
  });
  it("rejects impossible dates", () => {
    expect(isValidCalendarDate("2026-02-29")).toBe(false);
    expect(isValidCalendarDate("2028-02-29")).toBe(true);
  });
  it("today is taken in Almaty time, not the device's", () => {
    // 2026-12-19 20:30 UTC is already 2026-12-20 in Almaty (UTC+5)
    const instant = new Date(Date.UTC(2026, 11, 19, 20, 30));
    expect(toCalendarDate(instant, "Asia/Almaty")).toBe("2026-12-20");
    expect(toCalendarDate(instant, "UTC")).toBe("2026-12-19");
  });
  it("formats in Kazakh", () => {
    expect(formatKazakhDate("2026-12-20")).toBe("20 желтоқсан 2026");
  });
});
