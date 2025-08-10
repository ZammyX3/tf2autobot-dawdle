import axios, { AxiosRequestConfig, Method, AxiosError } from 'axios';
import filterAxiosError from '@tf2autobot/filter-axios-error';
import { PricerOptions } from '../../../classes/IPricer';
import log from '../../logger';
import { PricesTfGetPricesResponse, PricesTfItem, PricesTfRequestCheckResponse } from '../../../types/TeamFortress2';

export default class PricesTfApi {
  private static readonly URL = 'https://pricedb.io/api';

  public static async apiRequest<B>(
    httpMethod: string,
    path: string,
    params?: Record<string, any>,
    data?: Record<string, any>,
    headers?: Record<string, unknown>,
    customURL?: string
  ): Promise<B> {
    const options: AxiosRequestConfig = {
      method: httpMethod as Method,
      url: path,
      baseURL: customURL ? customURL : PricesTfApi.URL,
      headers: {
        'User-Agent': 'TF2Autobot@' + process.env.BOT_VERSION,
        ...(headers || {})
      },
      timeout: 30000,
      params,
      data
    };

    try {
      const response = await axios(options);
      return response.data as B;
    } catch (err) {
      throw filterAxiosError(err as AxiosError);
    }
  }

  async getPricelistPage(page: number): Promise<PricesTfGetPricesResponse> {
    return PricesTfApi.apiRequest('GET', '/autob/items', { page, limit: 100 });
  }

  async getPrice(sku: string): Promise<PricesTfItem> {
    return PricesTfApi.apiRequest('GET', `/autob/items/${sku}`);
  }

  async requestCheck(sku: string): Promise<PricesTfRequestCheckResponse> {
    return PricesTfApi.apiRequest('POST', `/autob/items/${sku}`);
  }

  getOptions(): PricerOptions {
    return { pricerUrl: PricesTfApi.URL };
  }
}
