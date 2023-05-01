import React, { useState } from 'react';
import './index.scss';
import { Bar } from '@/components/Bar';
import { Card, Breadcrumb, Form, Input, Upload, Button, message } from 'antd';
import { useStore } from '@/store';

const Home = () => {
  const [form] = Form.useForm();
  const { keyStore } = useStore();

  // 判断是否已经存有 key
  const hasApiKey = !!keyStore.apiKey;
  const apiKeyLabel = hasApiKey ? "更改你的openAI key" : "你的openAI key";
  const apiKeyPlaceholder = hasApiKey ? "请输入新的openAI key" : "请输入你的openAI key";

  const handleSubmit = async (values) => {
    const apiKey = values.title;

    if (!apiKey) {
      return message.error('请输入你的openAI key');
    }

    // 验证Key是否有效
    try {
      const response = await fetch('https://api.openai.com/v1/engines/text-davinci-003/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          prompt: '测试 API Key...',
          max_tokens: 5,
        }),
      });

      if (response.status === 200) {
        message.success('API Key 验证成功！');
        // Save the validated API key in the KeyStore
        console.log(apiKey);
        keyStore.setApiKey(apiKey);
        
        console.log(keyStore.apiKey);
      } else if (response.status === 401) {
        message.error('API Key 无效，请重试。');
      } else {
        message.error('验证 API Key 时发生错误，请稍后再试。');
      }
    } catch (error) {
      message.error('发生错误，请检查网络连接并稍后再试。');
    }
  };

  return (
    <Card
      title=  
          '首页'
    >
      <Form form={form} initialValues={{ title: '' }} onFinish={handleSubmit}>
        <Form.Item
          label={apiKeyLabel}
          name="title"
          rules={[{ required: true, message: '请输入你的openAI key' }]}
        >
          <Input placeholder={apiKeyPlaceholder} style={{ width: 400 }} />
        </Form.Item>
        <Form.Item>
          <Button type="primary" htmlType="submit">
            验证Key
          </Button>
        </Form.Item>
      </Form>
      <div className="home-logo" />
      <div>
        首先非常感谢您的使用。由于本人拙劣的编程能力和有限的精力，相信该网站肯定还有许多的缺陷和漏洞。由于目前还没有开发后端部分，再加上openAI严格的api管理规则，我无法公开自己的api，一公开就封我的api。非常抱歉。但是你可以私下找我要一个。但是最好还是自己去买一个，不然容易封号。<br />
        我相信gpt会掀起新一轮工业革命，这将进一步削减权威，提高生产力，这是激动人心的一刻！希望我能尽绵薄之力参与其中，并帮助更多的人。<br /><br />
        作者：吴浩<br />
        邮箱：wuhaodawang87@gmail.com（这是我小时候创建的，我知道这看起来有点2）
        
        
      </div>
      
    </Card>
  );
};

export default Home;