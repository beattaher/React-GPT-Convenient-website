import React, { useState } from 'react';
import './index.scss';
import { Card, Form, Input, Button, message, Radio, Popover } from 'antd';
import { QuestionCircleOutlined } from '@ant-design/icons'; // 导入 QuestionCircleOutlined 图标
import { useStore } from '@/store';
import { useTranslation } from 'react-i18next';

const Home = () => {
  const [form] = Form.useForm();
  const { apiStore } = useStore();
  const { t, ready } = useTranslation();
  const [selectedModel, setSelectedModel] = useState(apiStore.getSelectedModel());

  // 判断是否已经存有 key
  const hasApiKey = !!apiStore.apiKey;
  const apiKeyLabel = hasApiKey ? t('login.inputNewApiKey') : t('login.inputApiKey');
  const apiKeyPlaceholder = hasApiKey ? t('login.inputNewApiKey') : t('login.inputApiKey');

  

  const handleModelChange = async (e) => {
    const model = e.target.value;
    if (model === 'gpt-4') {
      const apiKey = form.getFieldValue('title');
      const isValid = await apiStore.callGPT();
      if (isValid) {
        message.success(t('home.modelChangeSuccess'));
        setSelectedModel(model);
        apiStore.setSelectedModel(model);
      } else {
        message.error(t('home.gpt4VerifyError'));
      }
    } else {
      setSelectedModel(model);
      apiStore.setSelectedModel(model);
      message.success(t('home.modelChangeSuccess'));
    }
  };

  const handleApikeySubmit = async (values) => {
    const apiKey = values.title;

    if (!apiKey) {
      return message.error(t('errorApiKey'));
    }

    // Save the validated API key in the apiStore
    console.log(apiKey);
    apiStore.setApiKey(apiKey);
  };

  const modelDifference = ( // 定义三个模型之间的区别
    <div>
      <p><strong>GPT-3.5-turbo:</strong> {t('home.introduction.GPT-3.5-turbo')}</p>
      <p><strong>Text-davinci-003:</strong> {t('home.introduction.Text-davinci-003')}</p>
      <p><strong>GPT-4:</strong> {t('home.introduction.GPT-4')}</p>
    </div>
  );

  return (
    <Card
      title={t('homeTitle')}
    >
      {/* 设置 initialValues 中的 model 为 selectedModel */}
      <Form form={form} initialValues={{ title: '', model: selectedModel }} onFinish={handleApikeySubmit}>
        <Form.Item
          label={apiKeyLabel}
          name="title"
          rules={[{ required: true, message: t('login.errorApiKey') }]}
        >
          <Input placeholder={apiKeyPlaceholder} style={{ width: '100%' }} />
        </Form.Item>
        <Form.Item>
          <Button type="primary" htmlType="submit">
            {t('home.saveApiKey')}
          </Button>
        </Form.Item>
        <Form.Item
        name="model"
        label={t('home.changeModel')}
      >
        <Radio.Group onChange={handleModelChange} value={selectedModel}>
          <Radio value="gpt-3.5-turbo">GPT-3.5-turbo</Radio>
          <Radio value="text-davinci-003">Text-davinci-003</Radio>
          <Radio value="gpt-4">GPT-4</Radio>
        </Radio.Group>
        <Popover content={modelDifference} title={t('home.modelDifferenceTitle')}>
          <QuestionCircleOutlined style={{ marginLeft: '8px' }} />
        </Popover>
      </Form.Item>
        
      </Form>
      <div className="home-logo" />
      <div />

      <div>
        {t('home.thanksMessage')}<br /><br />
        {t('home.author')}<br />
        {t('home.email')}<br />
        {t('home.wechat')}<br />
        {t('home.github')}<br /><br />
        {t('home.copyright')}<br />
      </div>
    </Card>
  );
};

export default Home;

