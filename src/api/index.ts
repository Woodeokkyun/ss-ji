import axios, {
  AxiosRequestConfig,
  AxiosRequestTransformer,
  AxiosResponseTransformer,
} from 'axios';
import { getCookie } from 'cookies-next';

type Transformer = AxiosRequestTransformer | AxiosResponseTransformer;
export const cookieOptions = {
  path: '/',
  secure: true,
  expires: new Date(Date.now() + 24 * 60 * 60 * 1000 * 60), // 60일
  httpOnly: true,
};

const getDefaultTransfrom = <T extends Transformer>(
  func: T[] | T | undefined
): T[] => (func ? (Array.isArray(func) ? func : [func]) : []);

export const defaultTransformRequest = getDefaultTransfrom(
  axios.defaults.transformRequest
);
export const defaultTransformResponse = getDefaultTransfrom(
  axios.defaults.transformResponse
);

const transformRequest: AxiosRequestTransformer[] = [
  (data: object) => {
    return data;
  },
  ...defaultTransformRequest,
];

export const solvookAPIConfig: AxiosRequestConfig = {
  baseURL: process.env.NEXT_PUBLIC_STUDIO_API_URL,
  responseType: 'json',
  transformRequest,
  headers: {
    Authorization: `${getCookie('accessToken')}`,
    'Content-Type': 'application/json',
  },
  transformResponse: [
    ...defaultTransformResponse,
    (data) => {
      return data;
    },
  ],
};

export interface APIPagination {
  pagination: {
    limit: number;
    offset: number;
    total: number;
  };
}

const studioInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_STUDIO_API_URL,
  responseType: 'json',
  transformRequest,
  headers: {
    Authorization: `${getCookie('accessToken')}`,
    'Content-Type': 'application/json',
  },
  transformResponse: [
    ...defaultTransformResponse,
    (data) => {
      return data;
    },
  ],
});

const marketInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  responseType: 'json',
  transformRequest,
  headers: {
    Authorization: `${getCookie('accessToken')}`,
    'Content-Type': 'application/json',
  },
  transformResponse: [
    ...defaultTransformResponse,
    (data) => {
      return data;
    },
  ],
});

export const api = studioInstance;
export const apiMarket = marketInstance;
