import { makeAutoObservable } from 'mobx';
import { history, setToken, getToken, removeToken } from '@/utils';
import * as openai from 'openai'; // 导入openai库

class ApiStore {
  apiKey = getToken() || '';
  selectedModel = localStorage.getItem('selectedModel') || 'gpt-3.5-turbo';

  constructor() {
    makeAutoObservable(this);
  }

  setApiKey = (apiKey) => {
    console.log(apiKey);
    this.apiKey = apiKey;
    setToken(apiKey);
  };

  getApiKey = () => {
    return this.apiKey;
  };

  removeApiKey = () => {
    this.apiKey = '';
    removeToken();
    history.push('/login');
  };

  setSelectedModel = (model) => {
    this.selectedModel = model;
    localStorage.setItem('selectedModel', model);
  };

  getSelectedModel = () => {
    return this.selectedModel;
  };

  validateApiKeyWithModel = async ( modelName = 'text-davinci-003') => {
    try {
      const response = await fetch(`https://api.openai.com/v1/engines/${modelName}/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          prompt: '测试 API Key...',
          max_tokens: 5,
        }),
        
      });

      return response.status === 200;
    } catch (error) {
      console.error(error);
      return false;
    }
  };

  callGPT = async (prompt = 'test', model = "gpt-4", maxTokens = 1) => {
    try {
      const response = await fetch(`https://api.openai.com/v1/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model: model, // 添加模型参数
          messages: [
            { role: "user", content: prompt },
          ],
          max_tokens: maxTokens,
        }),
      });

      if (response.status === 200) {
        
        return true;
      } else {
        throw new Error(`Error: ${response.status} ${response.statusText}`);
      }
    } catch (error) {
      console.error(error);

      return false;
    }
  };
}

export default ApiStore;