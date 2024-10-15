import axios from "axios";
import { buildShippingMethodActions } from "...";
import { methodKey } from "...";
import { commonActions } from "...";
import { RestrictedCompanyNameShippingInfo } from "...";
import { ShippingService } from "...";
import { ShippingInfoApi } from "...";
import { ShippingMethodsApi } from "...";

jest.mock("axios");

describe("buildShippingMethodActions", () => {
  beforeAll(() => {});

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("should return empty actions if cart isn't defined", async () => {
    const cart = undefined;

    const actions = await buildShippingMethodActions(cart);

    expect(actions).toEqual([]);
  });

  it("should set digital shipping method", async () => {
    const getExpressShippingInfoMock = jest.spyOn(ShippingService.prototype, "getRestrictedCompanyNameShippingInfo").mockRejectedValue(new Error());
    const getStandardShippingInfoMock = jest.spyOn(ShippingService.prototype, "getStandardShippingPrice").mockRejectedValue(new Error());
    const shippingService = new ShippingService(new ShippingInfoApi(), new ShippingMethodsApi());

    const cart = {
      store: {
        key: "de"
      },
      shippingAddress: {
        country: "DE"
      },
      lineItems: [
        {
          variant: {
            attributes: []
          }
        },
        {
          variant: {
            attributes: []
          }
        }
      ]
    };

    const actions = await buildShippingMethodActions(cart, shippingService);

    expect(getExpressShippingInfoMock).not.toHaveBeenCalled();
    expect(getStandardShippingInfoMock).not.toHaveBeenCalled();
    expect(actions.find((v) => v.action === "setShippingMethod")).toEqual(commonActions.setDigitalMethodActions);
    expect(actions.find((v) => v.action === "setShippingRateInput")).toEqual(commonActions.resetShippingRateAction);
    expect(actions.find((v) => v.action === "setCustomField" && v.name === "shippingMethods")).toEqual(
      commonActions.resetCustomFieldWithMethodsActions
    );
    expect(actions.find((v) => v.action === "recalculate")).toEqual(commonActions.recalculateAction);
  });

  it("should set standard shipping method if line items are empty without shipping custom field", async () => {
    const getExpressShippingInfoMock = jest.spyOn(ShippingService.prototype, "getRestrictedCompanyNameShippingInfo").mockRejectedValue(new Error());
    const getStandardShippingInfoMock = jest.spyOn(ShippingService.prototype, "getStandardShippingPrice").mockRejectedValue(new Error());
    const shippingService = new ShippingService(new ShippingInfoApi(), new ShippingMethodsApi());

    const cart = {
      store: {
        key: "de"
      },
      shippingAddress: {
        country: "DE"
      },
      lineItems: []
    };

    const actions = await buildShippingMethodActions(cart, shippingService);

    expect(getExpressShippingInfoMock).not.toHaveBeenCalled();
    expect(getStandardShippingInfoMock).not.toHaveBeenCalled();
    expect(actions.find((v) => v.action === "setShippingMethod")).toEqual(commonActions.setStandardMethodActions);
    expect(actions.find((v) => v.action === "setShippingRateInput")).toEqual(undefined);
    expect(actions.find((v) => v.action === "setCustomField" && v.name === "shippingMethods")).toEqual(
      commonActions.resetCustomFieldWithMethodsActions
    );
  });

  it("should set standard shipping and reset custom field for shipping methods if shipping country isn't supported", async () => {
    const supportsExpressMock = jest.spyOn(RestrictedCompanyNameShippingInfo.prototype, "supportsExpress").mockReturnValue(false);
    const getExpressPriceMock = jest.spyOn(RestrictedCompanyNameShippingInfo.prototype, "getExpressSurcharge").mockImplementation(() => {
      throw new Error();
    });
    const getExpressShippingInfoMock = jest
      .spyOn(ShippingService.prototype, "getRestrictedCompanyNameShippingInfo")
      .mockResolvedValue(new RestrictedCompanyNameShippingInfo());
    const getStandardShippingPriceMock = jest.spyOn(ShippingService.prototype, "getStandardShippingPrice").mockResolvedValue({
      centAmount: 999,
      currencyCode: "EUR",
      fractionDigits: 2,
      type: "centPrecision"
    });

    const shippingService = new ShippingService(new ShippingInfoApi(), new ShippingMethodsApi());

    const cart = {
      store: {
        key: "de"
      },
      shippingAddress: {
        country: "GB"
      },
      shippingInfo: {
        shippingMethodName: methodKey.standard
      },
      lineItems: [
        {
          productKey: "some-key",
          variant: {
            attributes: [
              {
                name: "shipping_score",
                value: 250
              }
            ]
          }
        },
        {
          productKey: "some-key",
          variant: {
            attributes: [
              {
                name: "shipping_score",
                value: 0.1
              }
            ]
          }
        }
      ]
    };

    const actions = await buildShippingMethodActions(cart, shippingService);

    expect(supportsExpressMock).not.toHaveBeenCalled();
    expect(getExpressPriceMock).not.toHaveBeenCalled();
    expect(getExpressShippingInfoMock).not.toHaveBeenCalled();
    expect(getStandardShippingPriceMock).not.toHaveBeenCalled();
    expect(actions.find((v) => v.action === "setShippingMethod")).toEqual(commonActions.setStandardMethodActions);
    expect(actions.find((v) => v.action === "setShippingRateInput")).toEqual({
      action: "setShippingRateInput",
      shippingRateInputType: {
        type: "CartScore",
        score: 4
      },
      shippingRateInput: {
        type: "Score",
        score: 4
      }
    });
    expect(actions.find((v) => v.action === "setCustomField" && v.name === "shippingMethods")).toEqual(
      commonActions.resetCustomFieldWithMethodsActions
    );
    expect(actions.find((v) => v.action === "recalculate")).toEqual(commonActions.recalculateAction);
  });
});
