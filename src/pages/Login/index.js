import './index.scss';
import {
  Button,
  Card,
  Form,
  Input,
  message,
  Modal,
  Space,
  Select,
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
  
  const { t, i18n, ready } = useTranslation();

  const handleLanguageChange = (value) => {
    i18n.changeLanguage(value);
  };

  const apiKeyLabel = hasApiKey ? t("login.newApiKey") : t("login.apiKey");
  const apiKeyPlaceholder = hasApiKey
    ? t("login.inputNewApiKey")
    : t("login.inputApiKey");

  const handleSubmit = async (values) => {
    const apiKey = values.title;

    if (!apiKey) {
      return message.error(t("login.errorApiKey"));
    }
    
    apiStore.setApiKey(apiKey);


      if (await apiStore.callEngines()) {
        navigate('/')
        message.success(t('login.validApiKey'));
        console.log(apiStore.apiKey);
      } else{
        message.error(t('login.invalidApiKey'));
        apiStore.removeApiKey()
      }
    }
 

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
              className="buttom"
              type="primary"
              htmlType="submit"
            >
              {t("login.validateKey")}
            </Button>
          </Form.Item> 
          <Form.Item>
          <Select className="buttom" defaultValue={i18n.language} onChange={handleLanguageChange} style={{ width: 120 }}>
            <Select.Option value="en">English</Select.Option>
            <Select.Option value="zh">中文</Select.Option>
          </Select>

          </Form.Item>
        </Form>
      </Card>
    </div>
  );
}

export default Login;
