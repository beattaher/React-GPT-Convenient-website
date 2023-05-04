import './index.scss';
import {
  Button,
  Card,
  Form,
  Input,
  message,
  Modal,
  Space,
} from 'antd';
import { useStore } from '@/store';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

function Login() {
  
  const [form] = Form.useForm();
  const { apiStore } = useStore();
  const navigate = useNavigate();

  const hasApiKey = !!apiStore.apiKey;
  
  const { t ,ready} = useTranslation();

  

  const apiKeyLabel = hasApiKey ? t("login.newApiKey") : t("login.apiKey");
  const apiKeyPlaceholder = hasApiKey
    ? t("login.inputNewApiKey")
    : t("login.inputApiKey");

  const handleSubmit = async (values) => {
    const apiKey = values.title;

    if (!apiKey) {
      return message.error(t("login.errorApiKey"));
    }

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
        navigate('/')
        message.success(t('login.validateKey'));
        apiStore.setApiKey(apiKey);
        
        console.log(apiStore.apiKey);
      } else if (response.status === 401) {
        message.error(t('login.invalidApiKey'));
      } else {
        message.error(t('login.errorVerifyApiKey'));
      }
    } catch (error) {
      message.error(t('login.errorNetwork'));
    }
  };

  const [isModalOpen, setIsModalOpen] = useState(false);
  const showModal = () => {
    setIsModalOpen(true);
  };
  const handleOk = () => {
    setIsModalOpen(false);
  };
  const handleCancel = () => {
    setIsModalOpen(false);
  };
  return (
    <div className="login">
      <Card className="login-container">
      <Form form={form} initialValues={{ title: '' }} onFinish={handleSubmit}>
        <Form.Item>
          <div className = "company_name"/>
        </Form.Item>
          
            
        <Form.Item label={apiKeyLabel}>
            <Space>
              <Form.Item
                name="title"
                rules={[{ required: true, message: t('login.errorApiKey') }]}
              >
                <Input className="key_input" placeholder={apiKeyPlaceholder} />
              </Form.Item>
              <Form.Item>
                <Button className="what_key_link" type="link" onClick={showModal}>
                {t("login.whatIsKey")}
              </Button>
              </Form.Item>
              
            </Space>
            <Modal title={t("login.modalTitle")} visible={isModalOpen} onOk={handleOk} onCancel={handleCancel}>
              <p>{t("login.modalExplanation")}</p>
            </Modal>
          </Form.Item> 
          <Form.Item>
            <Button
              className="verify_key"
              type="primary"
              htmlType="submit"
            >
              {t("login.validateKey")}
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
}

export default Login;
