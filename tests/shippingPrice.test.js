import { calculateExpressShippingSurcharge, calculateStandardShippingPrice } from "utils/shippingPrice";
import { getMaxPrice } from "utils/money";
import cartWithWallarts from "testData/cartWithWallarts";
import emptyCart from "testData/emptyCart";
import standardShipping from "testData/standardShipping";

describe("Shipping Price", function () {
  describe("calculateExpressShippingSurcharge", function () {
    it("should return correct price when persentage less than minimum", function () {
      const lineItems = [
        {
          price: {
            value: {
              type: "centPrecision",
              currencyCode: "EUR",
              centAmount: 750,
              fractionDigits: 2
            }
          },
          quantity: 2
        },
        {
          price: {
            value: {
              type: "centPrecision",
              currencyCode: "EUR",
              centAmount: 1500,
              fractionDigits: 2
            }
          },
          quantity: 1
        },
        {
          price: {
            value: {
              type: "centPrecision",
              currencyCode: "EUR",
              centAmount: 500,
              fractionDigits: 2
            }
          },
          quantity: 4
        }
      ];

      const price = calculateExpressShippingSurcharge(lineItems, {
        express_minimum: 2499,
        express_percentage: 20,
        currency: "EUR"
      });

      expect(price).toEqual({
        centAmount: 2499,
        currencyCode: "EUR",
        fractionDigits: 2
      });
    });

    it("should return correct price when roundig down", function () {
      const lineItems = [
        {
          price: {
            value: {
              type: "centPrecision",
              currencyCode: "EUR",
              centAmount: 3333,
              fractionDigits: 2
            }
          },
          quantity: 3
        }
      ];

      const price = calculateExpressShippingSurcharge(lineItems, {
        express_minimum: 2499,
        express_percentage: 25,
        currency: "EUR"
      });

      expect(price).toEqual({
        centAmount: 2499,
        currencyCode: "EUR",
        fractionDigits: 2
      });
    });

    it("should return correct price when persentage greater than minimum", function () {
      const lineItems = [
        {
          price: {
            value: {
              type: "centPrecision",
              currencyCode: "EUR",
              centAmount: 1000,
              fractionDigits: 2
            }
          },
          quantity: 10
        },
        {
          price: {
            value: {
              type: "centPrecision",
              currencyCode: "EUR",
              centAmount: 9999,
              fractionDigits: 2
            }
          },
          quantity: 1
        }
      ];

      const res1 = calculateExpressShippingSurcharge(lineItems, {
        express_minimum: 2499,
        express_percentage: 25,
        currency: "EUR"
      });

      expect(res1).toEqual({
        centAmount: 4999,
        currencyCode: "EUR",
        fractionDigits: 2
      });
    });

    it("should return persentage when min = 0", function () {
      const lineItems = [
        {
          price: {
            value: {
              type: "centPrecision",
              currencyCode: "EUR",
              centAmount: 1000,
              fractionDigits: 2
            }
          },
          quantity: 1
        },
        {
          price: {
            value: {
              type: "centPrecision",
              currencyCode: "EUR",
              centAmount: 500,
              fractionDigits: 2
            }
          },
          quantity: 1
        }
      ];

      const res1 = calculateExpressShippingSurcharge(lineItems, {
        express_minimum: 0,
        express_percentage: 20,
        currency: "EUR"
      });

      expect(res1).toEqual({
        centAmount: 300,
        currencyCode: "EUR",
        fractionDigits: 2
      });
    });

    it("should return min when percentage = 0", function () {
      const lineItems = [
        {
          price: {
            value: {
              type: "centPrecision",
              currencyCode: "EUR",
              centAmount: 1000,
              fractionDigits: 2
            }
          },
          quantity: 1
        },
        {
          price: {
            value: {
              type: "centPrecision",
              currencyCode: "EUR",
              centAmount: 500,
              fractionDigits: 2
            }
          },
          quantity: 1
        }
      ];

      const res1 = calculateExpressShippingSurcharge(lineItems, {
        express_minimum: 2499,
        express_percentage: 0,
        currency: "EUR"
      });

      expect(res1).toEqual({
        centAmount: 2499,
        currencyCode: "EUR",
        fractionDigits: 2
      });
    });

    it("should return 0 when percentage = 0 and min = 0", function () {
      const lineItems = [
        {
          price: {
            value: {
              type: "centPrecision",
              currencyCode: "EUR",
              centAmount: 2500,
              fractionDigits: 2
            }
          },
          quantity: 4
        },
        {
          price: {
            value: {
              type: "centPrecision",
              currencyCode: "EUR",
              centAmount: 500,
              fractionDigits: 2
            }
          },
          quantity: 1
        }
      ];

      const res1 = calculateExpressShippingSurcharge(lineItems, {
        express_minimum: 0,
        express_percentage: 0,
        currency: "EUR"
      });

      expect(res1).toEqual({
        centAmount: 0,
        currencyCode: "EUR",
        fractionDigits: 2
      });
    });

    it("should return 0 when percentage = 0 and min = 0", function () {
      const lineItems = [
        {
          price: {
            value: {
              type: "centPrecision",
              currencyCode: "EUR",
              centAmount: 500,
              fractionDigits: 2
            }
          },
          quantity: 2
        },
        {
          price: {
            value: {
              type: "centPrecision",
              currencyCode: "EUR",
              centAmount: 500,
              fractionDigits: 2
            }
          },
          quantity: 1
        }
      ];

      const res1 = calculateExpressShippingSurcharge(lineItems, {
        express_minimum: 0,
        express_percentage: 0,
        currency: "EUR"
      });

      expect(res1).toEqual({
        centAmount: 0,
        currencyCode: "EUR",
        fractionDigits: 2
      });
    });

    it("should throw an error when percentage = null", function () {
      const lineItems = [
        {
          price: {
            value: {
              type: "centPrecision",
              currencyCode: "EUR",
              centAmount: 1000,
              fractionDigits: 2
            }
          },
          quantity: 1
        },
        {
          price: {
            value: {
              type: "centPrecision",
              currencyCode: "EUR",
              centAmount: 500,
              fractionDigits: 2
            }
          },
          quantity: 1
        }
      ];

      expect(() =>
        calculateExpressShippingSurcharge(lineItems, {
          express_minimum: 2499,
          express_percentage: null,
          currency: "EUR"
        })
      ).toThrow();
    });

    it("should throw an error when min = null", function () {
      const lineItems = [
        {
          price: {
            value: {
              type: "centPrecision",
              currencyCode: "EUR",
              centAmount: 2500,
              fractionDigits: 2
            }
          },
          quantity: 4
        },
        {
          price: {
            value: {
              type: "centPrecision",
              currencyCode: "EUR",
              centAmount: 500,
              fractionDigits: 2
            }
          },
          quantity: 1
        }
      ];

      expect(() =>
        calculateExpressShippingSurcharge(lineItems, {
          express_minimum: null,
          express_percentage: 20,
          currency: "EUR"
        })
      ).toThrow();
    });

    it("should throw an error when percentage = null and min = null", function () {
      const lineItems = [
        {
          price: {
            value: {
              type: "centPrecision",
              currencyCode: "EUR",
              centAmount: 1000,
              fractionDigits: 2
            }
          },
          quantity: 1
        },
        {
          price: {
            value: {
              type: "centPrecision",
              currencyCode: "EUR",
              centAmount: 500,
              fractionDigits: 2
            }
          },
          quantity: 1
        }
      ];

      expect(() =>
        calculateExpressShippingSurcharge(lineItems, {
          express_minimum: null,
          express_percentage: null,
          currency: "EUR"
        })
      ).toThrow();
    });
  });

  describe("calculateStandardShippingPrice", function () {
    it("should return correct price", function () {
      expect(calculateStandardShippingPrice(cartWithWallarts, standardShipping)).toEqual({
        type: "centPrecision",
        currencyCode: "EUR",
        centAmount: 999,
        fractionDigits: 2
      });

      expect(calculateStandardShippingPrice(emptyCart, standardShipping)).toEqual({
        type: "centPrecision",
        currencyCode: "EUR",
        centAmount: 399,
        fractionDigits: 2
      });
    });
  });
});
