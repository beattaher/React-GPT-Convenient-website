import { makeAutoObservable } from 'mobx';
import { history, http, setToken, getToken, removeToken } from '@/utils';

class KeyStore {
  apiKey = getToken() || '';

  constructor() {
    makeAutoObservable(this);
  }

  // 设置API密钥并保存到localStorage
  setApiKey = ( apiKey ) => {
    console.log(apiKey);
    this.apiKey = apiKey;
    setToken(apiKey);
  };

  // 获取当前设置的API密钥（如果已设置）
  getApiKey = () => {
    return this.apiKey;
  };

  // 注销并删除API密钥
  removeApiKey = () => {
    this.apiKey = '';
    removeToken();
    history.push('/login');
  };
}

export default KeyStore;
