import axios from "axios";
import { ShippingService } from "services/shippingService";
import { ShippingInfoApi } from "api/shippingInfo";
import { ShippingMethodsApi } from "api/shippingMethods";
import cartWithWallarts from "testData/cartWithWallarts";
import cartWithWallartInCH from "testData/cartWithWallartInCH";
import emptyCart from "testData/emptyCart";
import { normalizedShippingInfo } from "testData/shippingInfo";
import standardShippingData from "testData/standardShipping";
import { posterProductTypeIds } from "constants/lineItems";

jest.mock("axios");

describe("ShippingService", function () {
  beforeEach(() => {
    axios.mockClear();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe("getPosterShippingInfo", function () {
    it("should return correct express shipping info for not empty cart in DE domain", async function () {
      const normilizedData = normalizedShippingInfo();

      const getInfoMock = jest
        .spyOn(ShippingInfoApi.prototype, "getInfo")
        .mockImplementation(({ id, width, height }, shippingCountry, domainCountry) => Promise.resolve(normilizedData[id]));

      const getAccessoryMock = jest
        .spyOn(ShippingInfoApi.prototype, "getAccessory")
        .mockImplementation((shippingCountry) => Promise.resolve(normilizedData[posterProductTypeIds.accessories]));

      const shippingService = new ShippingService(new ShippingInfoApi(), {});

      const posterShippingInfo = await shippingService.getPosterShippingInfo(cartWithWallarts);

      expect(getInfoMock).toHaveBeenCalledTimes(5);
      expect(getInfoMock).toHaveBeenCalledWith(
        { id: "material-poster", width: 3000, height: 4500 },
        { shippingCountry: "FR", domainCountry: "DE" }
      );
      expect(getInfoMock).toHaveBeenCalledWith(
        { id: "material-poster-frame-holzrahmen", width: 6000, height: 9000 },
        { shippingCountry: "FR", domainCountry: "DE" }
      );
      expect(getInfoMock).toHaveBeenCalledWith(
        { id: "material-poster", width: 2000, height: 3000 },
        { shippingCountry: "FR", domainCountry: "DE" }
      );
      expect(getInfoMock).toHaveBeenCalledWith(
        { id: "material-leinwand", width: 4000, height: 6000 },
        { shippingCountry: "FR", domainCountry: "DE" }
      );
      expect(getInfoMock).toHaveBeenCalledWith(
        { id: "material-leinwand", width: 4000, height: 6000 },
        { shippingCountry: "FR", domainCountry: "DE" }
      );
      expect(getInfoMock).toHaveBeenCalledWith(
        { id: "material-aludibond", width: 6000, height: 9000 },
        { shippingCountry: "FR", domainCountry: "DE" }
      );

      expect(getAccessoryMock).toHaveBeenCalledTimes(1);
      expect(getAccessoryMock).toHaveBeenCalledWith({ shippingCountry: "FR", domainCountry: "DE" });

      expect(posterShippingInfo.supportsExpress()).toEqual(true);
      expect(posterShippingInfo.getExpressSurcharge()).toEqual({
        centAmount: 3599,
        currencyCode: "EUR",
        fractionDigits: 2
      });
    });

    it("should return correct express shipping info for not empty cart in CH domain", async function () {
      const normilizedData = normalizedShippingInfo("CHF");

      const getAccessoryMock = jest
        .spyOn(ShippingInfoApi.prototype, "getAccessory")
        .mockImplementation((shippingCountry) => Promise.resolve(normilizedData[posterProductTypeIds.accessories]));

      const getInfoMock = jest
        .spyOn(ShippingInfoApi.prototype, "getInfo")
        .mockImplementation(({ id, width, height }, { shippingCountry, domainCountry }) => Promise.resolve(normilizedData[id]));

      const shippingService = new ShippingService(new ShippingInfoApi(), {});

      const posterShippingInfo = await shippingService.getPosterShippingInfo(cartWithWallartInCH);

      expect(getInfoMock).toHaveBeenCalledTimes(2);
      expect(getInfoMock).toHaveBeenCalledWith(
        { id: "material-poster", width: 1300, height: 1800 },
        { shippingCountry: "CH", domainCountry: "CH" }
      );
      expect(getInfoMock).toHaveBeenCalledWith(
        { id: "material-poster", width: 6000, height: 9000 },
        { shippingCountry: "CH", domainCountry: "CH" }
      );

      expect(getAccessoryMock).toHaveBeenCalledTimes(1);
      expect(getAccessoryMock).toHaveBeenCalledWith({ shippingCountry: "CH", domainCountry: "CH" });

      expect(posterShippingInfo.supportsExpress()).toEqual(true);
      expect(posterShippingInfo.getExpressSurcharge()).toEqual({
        centAmount: 1748,
        currencyCode: "CHF",
        fractionDigits: 2
      });
    });

    it("should throw an error for getting express shipping surcharge for empty cart", async function () {
      const shippingService = new ShippingService({}, {});
      const posterShippingInfo = await shippingService.getPosterShippingInfo(emptyCart);

      expect(posterShippingInfo.supportsExpress()).toEqual(false);
      expect(() => posterShippingInfo.getExpressSurcharge()).toThrow();
    });
  });

  describe("getStandardShippingPrice", function () {
    afterEach(() => {
      ShippingMethodsApi.prototype.getStandardShipping.mockClear();
    });

    it("should return correct standard shipping price for not empty cart", async function () {
      const getStandardShippingMock = jest
        .spyOn(ShippingMethodsApi.prototype, "getStandardShipping")
        .mockResolvedValue(standardShippingData);

      const shippingService = new ShippingService({}, new ShippingMethodsApi());
      const standardShippingPrice = await shippingService.getStandardShippingPrice(cartWithWallarts);

      expect(getStandardShippingMock).toHaveBeenCalledTimes(1);
      expect(standardShippingPrice).toEqual({
        centAmount: 999,
        currencyCode: "EUR",
        fractionDigits: 2,
        type: "centPrecision"
      });
    });

    it("should return correct standard shipping price for empty cart", async function () {
      const getStandardShippingMock = jest
        .spyOn(ShippingMethodsApi.prototype, "getStandardShipping")
        .mockResolvedValue(standardShippingData);

      const shippingService = new ShippingService({}, new ShippingMethodsApi());
      const standardShippingPrice = await shippingService.getStandardShippingPrice(emptyCart);

      expect(getStandardShippingMock).toHaveBeenCalledTimes(1);
      expect(standardShippingPrice).toEqual({
        type: "centPrecision",
        currencyCode: "EUR",
        centAmount: 399,
        fractionDigits: 2
      });
    });
  });
});
