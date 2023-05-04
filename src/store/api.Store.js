import { makeAutoObservable } from 'mobx';
import { history, setToken, getToken, removeToken } from '@/utils';
import * as openai from 'openai'; // 导入openai库
import { tokenCounter } from '../utils';
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

  callEngines = async ( prompt = "test", model = 'text-davinci-003') => {
    let maxTokens = prompt !== 'test' ? 3700 - tokenCounter(prompt) : 1;
    try {
      const response = await fetch(`https://api.openai.com/v1/engines/${model}/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          prompt: prompt,
          max_tokens: maxTokens,
        }),
  
      });
  
      if (response.status === 200) {
        const data = await response.json();
        // 返回测试用例结果或实际完成内容
        return prompt === 'test' ? true : data.choices[0].text;
      } else {
        throw new Error(`Error: ${response.status} ${response.statusText}`);
      }
    } catch (error) {
      console.error(error);
      return false;
    }
  };
  

  callGPT = async (prompt = 'test', model = "gpt-4") => {
    try {
      let maxTokens;
      if (prompt === 'test') {
        maxTokens = 5;
      } else if (model === "gpt-4") {
        maxTokens = 7700 - tokenCounter(prompt);
      } else {
        maxTokens = 3700 - tokenCounter(prompt);
      }
  
      const response = await fetch(`https://api.openai.com/v1/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model: model,
          messages: [{ role: "user", content: prompt }],
          max_tokens: maxTokens,
          temperature: 0.5,
        }),
      });
  
      if (response.status === 200) {
        const responseData = await response.json();
        console.log(responseData);
        return prompt === 'test' ? true : responseData.choices[0].message.content;
      } else {
        throw new Error(`Error: ${response.status} ${response.statusText}`);
      }
    } catch (error) {
      console.error(error);
      return false;
    }
  };
  

  callModel = async (prompt , model ) => {
    if (model === 'gpt-3.5-turbo' || model === 'gpt-4') {
      return await this.callGPT(prompt, model);
    } else {
      return await this.callEngines(prompt, model);
    }
  };
}

export default ApiStore;