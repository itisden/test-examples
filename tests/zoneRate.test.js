import { getShippingRateByCurrency } from "utils/zoneRate";

describe("Zone Rate utils", () => {
  describe("getShippingRateByCurrency", () => {
    it("should return correct shipping rate", () => {
      const eurShippingRate = {
        price: {
          type: "centPrecision",
          currencyCode: "EUR",
          centAmount: 399,
          fractionDigits: 2
        },
        tiers: []
      };

      const gbpShippingRate = {
        price: {
          type: "centPrecision",
          currencyCode: "GBP",
          centAmount: 395,
          fractionDigits: 2
        },
        tiers: []
      };

      const zoneRate = {
        zone: {},
        shippingRates: [eurShippingRate, gbpShippingRate]
      };

      expect(getShippingRateByCurrency(zoneRate, "EUR")).toBe(eurShippingRate);
      expect(getShippingRateByCurrency(zoneRate, "GBP")).toBe(gbpShippingRate);
      expect(getShippingRateByCurrency(zoneRate, "DKK")).toBe(undefined);
    });
  });
});
