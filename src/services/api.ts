import axios from 'axios';
import {
  ICircle,
  ITokenGift,
  IUser,
  IUserPendingGift,
  PostCirclesParam,
  PostTokenGiftsParam,
  PostUsersParam,
  PutCirclesParam,
  PutUsersParam,
} from 'types';
import { IEpoch } from 'types/models/epoch.model';
import { apiBaseURL } from 'utils/domain';
import { getSignature } from 'utils/provider';

axios.defaults.baseURL = apiBaseURL(); // process.env.REACT_APP_API_BASE_URL as string;

class APIService {
  constructor() {}

  getCircles = async (): Promise<ICircle[]> => {
    const response = await axios.get('/circles');
    return response.data as ICircle[];
  };

  postCircles = async (
    address: string,
    params: PostCirclesParam,
    provider?: any
  ): Promise<any> => {
    const data = JSON.stringify(params);
    const signature = await getSignature(data, provider);
    const response = await axios.post('/circles', {
      signature,
      data,
      address,
    });
    return response.data;
  };

  putCircles = async (
    address: string,
    id: number,
    params: PutCirclesParam,
    provider?: any
  ): Promise<any> => {
    const data = JSON.stringify(params);
    const signature = await getSignature(data, provider);
    const response = await axios.post(`/circles/${id}`, {
      signature,
      data,
      address,
    });
    return response.data;
  };

  getEpochs = async (current?: number): Promise<IEpoch[]> => {
    const params: any = {};
    if (current) {
      params.current = current;
    }
    const response = await axios.get('/epoches', { params });
    return response.data as IEpoch[];
  };

  getMe = async (address: string): Promise<IUser> => {
    const response = await axios.get(`/users/${address}`);
    return response.data as IUser;
  };

  getUsers = async (
    address?: string,
    circle_id?: number,
    id?: number
  ): Promise<IUser[]> => {
    const params: any = {};
    if (circle_id) {
      params.circle_id = circle_id;
    }
    if (address) {
      params.address = address;
    }
    if (id) {
      params.id = id;
    }
    const response = await axios.get('/users', { params });
    return response.data as IUser[];
  };

  postUsers = async (
    address: string,
    params: PostUsersParam,
    provider?: any
  ): Promise<IUser> => {
    const data = JSON.stringify(params);
    const signature = await getSignature(data, provider);
    const response = await axios.post('/users', {
      signature,
      data,
      address,
    });
    return response.data;
  };

  putUsers = async (
    address: string,
    params: PutUsersParam,
    provider?: any
  ): Promise<IUser> => {
    const data = JSON.stringify(params);
    const signature = await getSignature(data, provider);
    const response = await axios.put(`/users/${address}`, {
      signature,
      data,
      address,
    });
    return response.data;
  };

  postUploadImage = async (
    address: string,
    file: File,
    provider?: any
  ): Promise<any> => {
    const filename = 'avatar.png';
    const data = filename;
    const signature = await getSignature(data, provider);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('signature', signature);
    formData.append('address', address);
    formData.append('data', data);
    const response = await axios.post('/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  };

  postTeammates = async (
    address: string,
    teammates: number[],
    provider?: any
  ): Promise<IUser> => {
    const data = JSON.stringify({ teammates: teammates });
    const signature = await getSignature(data, provider);
    const response = await axios.post('/teammates', {
      signature,
      data,
      address,
    });
    return response.data;
  };

  getPendingTokenGifts = async (
    sender_address?: string,
    recipient_address?: string,
    circle_id?: number,
    id?: number
  ): Promise<ITokenGift[]> => {
    const params: any = {};
    if (sender_address) {
      params.sender_address = sender_address;
    }
    if (recipient_address) {
      params.recipient_address = recipient_address;
    }
    if (circle_id) {
      params.circle_id = circle_id;
    }
    if (id) {
      params.id = id;
    }
    const response = await axios.get('/pending-token-gifts', { params });
    return response.data as ITokenGift[];
  };

  getTokenGifts = async (
    sender_address?: string,
    recipient_address?: string,
    circle_id?: number,
    id?: number
  ): Promise<ITokenGift[]> => {
    const params: any = {};
    if (sender_address) {
      params.sender_address = sender_address;
    }
    if (recipient_address) {
      params.recipient_address = recipient_address;
    }
    if (circle_id) {
      params.circle_id = circle_id;
    }
    if (id) {
      params.id = id;
    }
    const response = await axios.get('/token-gifts', { params });
    return response.data as ITokenGift[];
  };

  postTokenGifts = async (
    address: string,
    params: PostTokenGiftsParam[],
    provider?: any
  ): Promise<IUserPendingGift> => {
    const data = JSON.stringify(params);
    const signature = await getSignature(data, provider);
    const response = await axios.post(`/token-gifts/${address}`, {
      signature,
      data,
      address,
    });
    return response.data;
  };
}

let apiService: APIService;

export const getApiService = (): APIService => {
  if (apiService) return apiService;
  apiService = new APIService();
  return apiService;
};
