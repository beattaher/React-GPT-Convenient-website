import { makeAutoObservable } from 'mobx';
import { history, setToken, getToken, removeToken } from '@/utils';
import * as openai from 'openai'; // 导入openai库
import { tokenCounter } from '../utils';
import { max } from 'lodash';
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

  
  streamRequest = async (endpoint, prompt, model, maxTokens, updateCallback) => {
    try {

      const requestBody = {
        model: model,

        max_tokens: maxTokens,
        temperature: 0.5,
        stream: true,
      };
      
      
      if (model === false) {
        delete requestBody.model;
        requestBody.prompt = prompt;
      }else{
        requestBody.messages = [{ role: "user", content: prompt }];
      }
      
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify(requestBody),
      });
      
  
      if (response.status === 200) {

        const reader = response.body.getReader();
        let result = "";
  
        const processStream = async () => {
          const { done, value } = await reader.read();
          
          if (done) {
            // Stream has ended; return the result
            return result;
          }
    
          const text = new TextDecoder("utf-8").decode(value);
          const lines = text?.split("\n").filter((line) => line.trim() !== "");
          
          for (const line of lines) {
            
            const message = line.replace(/^data: /, "");
            if (message === "[DONE]") {
              await reader.cancel(); // Stop reading the stream
              break; // Stream finished
            }
            try {
              const parsed = JSON.parse(message);
              let newText;
              if (model === false) {
                newText = parsed.choices[0].text;
              } else {
                newText = parsed.choices[0].delta.content;
              }
                
              if (newText !== undefined) {
                result += newText;
                if (updateCallback) {
                  updateCallback(newText);
                  console.log("result",result);
                }
              }
               // Append the choice text to the result
              
              // Invoke the update callback with the new text
              
              
            } catch (error) {
              console.error("Could not JSON parse stream message", message, error);
            }
          }
    
          return processStream(); // Continue processing the stream
        };
  
        const finalResult = await processStream();
        return prompt === "test" ? true : finalResult;
      } else {
        throw new Error(`Error: ${response.status} ${response.statusText}`);
      }
    } catch (error) {
      console.error(error);
      return false;
    }
  };
  
  callEngines = async (prompt = "test", model = "text-davinci-003", updateCallback) => {
    const maxTokens = prompt !== "test" ? 3700 - tokenCounter(prompt) : 1;
    const endpoint = `https://api.openai.com/v1/engines/${model}/completions`;
    
    return await this.streamRequest(endpoint, prompt, false, maxTokens, updateCallback);
  };
  

  callGPT = async (prompt = "test", model = "gpt-4", updateCallback) => {

    let maxTokens;
    if (prompt === "test") {
      maxTokens = 5;
    } else if (model === "gpt-4") {
      maxTokens = 7700 - tokenCounter(prompt);
    } else {
      maxTokens = 3700 - tokenCounter(prompt);
    }
    const endpoint = 'https://api.openai.com/v1/chat/completions';
    
    return await this.streamRequest(endpoint, prompt, model, maxTokens, updateCallback);
  };
  
  

  callModel = async (prompt, model, updateCallback) => {
    console.log("updateCallback",updateCallback);
    if (model === 'gpt-3.5-turbo' || model === 'gpt-4') {
      return await this.callGPT(prompt, model, updateCallback);
    } else {
      return await this.callEngines(prompt, model, updateCallback);
    }
  };
  
}

export default ApiStore;