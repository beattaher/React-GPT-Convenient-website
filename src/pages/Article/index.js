import React, { useState } from 'react';
import { Card, Breadcrumb, Form, Input, Upload, Button, message } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { v4 as uuidv4 } from 'uuid';
import { useStore } from '@/store';
import FormData from 'form-data';
import './index.scss';
const { Configuration, OpenAIApi } = require('openai');

// Create a custom CustomFormData class that includes a getHeaders method
class CustomFormData extends FormData {
  getHeaders() {
    return {};
  }
}

const Article = () => {
  const { keyStore } = useStore();
  const [response, setResponse] = useState('');
  const [audioList, setAudioList] = useState([]);

  const estimateTokenCount = (text) => {
    return text.split(/\s+/).length;
  };

  const callOpenAICompletionAPI = async ({ title, formType, content }) => {
    const configuration = new Configuration({
      organization: 'org-9QcLes4mblKdTtxRSBBYJTCd',
      apiKey: keyStore.apiKey,
      formDataCtor: CustomFormData,
    });
    console.log(configuration);
    delete configuration.baseOptions.headers['User-Agent'];
    const openai = new OpenAIApi(configuration);

    let audio_text = '';

    if (audioList.length > 0) {
      const audioFile = audioList[0].originFileObj;

      // Create a FormData object and attach the audio file
      const formData = new FormData();
      formData.append('file', audioFile, audioFile.name);

      const audioTranscription = await openai.createTranscription(audioFile, 'whisper-1');
      audio_text = audioTranscription.data.text;
    }

    const prompt = `Title: ${title}\nForm Type: ${formType}\nContent: ${content}\nAudio Text: ${audio_text || ''}\nPlease summarize the given information.`;

    const promptTokenCount = estimateTokenCount(prompt);
    const maxTokens = 3700 - promptTokenCount;
    console.log(maxTokens);
    const getResponse = await openai.createCompletion({
    model: 'text-davinci-003',
    prompt,
    temperature: 0,
    max_tokens: maxTokens,
    top_p: 1.0,
    frequency_penalty: 0.0,
    presence_penalty: 0.0,
  });
  
    setResponse(getResponse.data.choices[0].text);
  };

  const handleSubmit = (values) => {
    const { title, formType, content } = values;

    callOpenAICompletionAPI({ title, formType, content });
  };

  const handleUpload = async (file) => {
    const isAudio = file.type.startsWith('audio');

    if (!isAudio) {
      message.error('Please upload an audio file!');
      return Upload.LIST_IGNORE;
    }

    return true;
  };
  return (
    <div>
      <Card
        title={
          <Breadcrumb separator=">">
            <Breadcrumb.Item>
              <a href="#">首页</a>
            </Breadcrumb.Item>
            <Breadcrumb.Item>笔记助手</Breadcrumb.Item>
          </Breadcrumb>
        }
      >
        <Form initialValues={{ title: '', formType: '', content: '' }} onFinish={handleSubmit}>
          <div>{response}</div>
          <Form.Item
            label="主题"
            name="title"
            rules={[{ required: false, message: 'What is this about?' }]}
          >
            <Input placeholder="What is this about?" style={{ width: 400 }} />
          </Form.Item>
          <Form.Item
            label="形式"
            name="formType"
            rules={[{ required: false, message: 'What is it? Article? Meeting? Class?' }]}
          >
            <Input placeholder="What is it? Article? Meeting? Class?" style={{ width: 400 }} />
          </Form.Item>
          {/* Upload audio */}
          <Form.Item label="上传音频">
            <Upload
              name="audio"
              listType="picture-card"
              className="avatar-uploader"
              showUploadList
              fileList={audioList}
              beforeUpload={handleUpload}
              onPreview={() => {}}
              onChange={({ fileList }) => setAudioList(fileList)}
            >
              {audioList.length >= 1 ? null : (
                <div style={{ marginTop: 8 }}>
                  <PlusOutlined />
                </div>
              )}
            </Upload>
          </Form.Item>
          <Form.Item
            label="文字内容"
            name="content"
            rules={[{ required: true, message: 'Please enter article content' }]}
          >
            
          </Form.Item>
          <Input.TextArea rows={10} />
          <Form.Item>
            <Button className=" summary" size="large" type="primary" htmlType="submit">
              {'Summarize'}
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default Article;


