import React, { useState, useEffect } from 'react';
import {
  Card,
  Breadcrumb,
  Form,
  Input,
  Upload,
  Button,
  message,
  Typography,
  Progress,
  Space,
  Checkbox,
  Row,
  Tag,
} from 'antd';
import { PlusOutlined, InboxOutlined } from '@ant-design/icons';
import { v4 as uuidv4 } from 'uuid';
import { useStore } from '@/store';
import FormData from 'form-data';
import './index.scss';
import { useTranslation } from 'react-i18next';
import { tokenCounter } from '@/utils'
import { observer } from 'mobx-react-lite';
import { set } from 'lodash';


const { Configuration, OpenAIApi } = require('openai');
const { Title, Paragraph } = Typography;

class CustomFormData extends FormData {
  getHeaders() {
    return {};
  }
}


const Legal = () => {
  const { t } = useTranslation();
  const { apiStore } = useStore();
  const [response, setResponse] = useState('');
  const [audioList, setAudioList] = useState([]);
  const [progressPercent, setProgressPercent] = useState(0);
  const [preferences, setPreferences] = useState([]);
  const [customContent, setCustomContent] = useState('');
  const [form] = Form.useForm();
  const [country, setCountry] = useState();
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState(''); 

  useEffect(() => {
    // 假设您已经有了这个 Promise
    const countryPromise = Promise.resolve('United States');
  
    const fetchCountryName = async () => {
      const result = await countryPromise;
      setCountry(result);
  
      // 使用 setFieldsValue 设置国家输入框的初始值
      form.setFieldsValue({ defCountry: result });
    };
  
    fetchCountryName();
  }, []);
  
  

  console.log(country);
  
  useEffect(() => {
    const fetchData = async () => {
      if (messages.length > 0) {
        const response = await apiStore.callModel(
          messages,
          apiStore.selectedModel,
          (newResponse) => {
            setResponse((prevResponse) => prevResponse + newResponse);
          }
        );
      }
    };
  
    fetchData();
  }, [messages]);

  const handleCountryChange = (event) => {
    setCountry(event.target.value);
  };
  

  const callOpenAICompletionAPI = async ({ content, remarks}) => {
    setProgressPercent(33);
    const configuration = new Configuration({
      organization: 'org-9QcLes4mblKdTtxRSBBYJTCd',
      apiKey: apiStore.apiKey,
      formDataCtor: CustomFormData,
    });
    
    delete configuration.baseOptions.headers['User-Agent'];
    const openai = new OpenAIApi(configuration);
    
    let audio_text = '';
    const hasCustomContent = customContent.trim() !== '';
    const otherPreferences = preferences.filter(option => option !== t('custom'));
    console.log(customContent);
    const extraOutput = hasCustomContent
      ? (otherPreferences.length > 0 ? otherPreferences.join(', ') + ', ' : '') + customContent
      : preferences.join(', ');
    
    let audioFileName = "";  
    if (audioList.length > 0) {
      console.log(audioList[0]);
      const audioFile = audioList[0];
    
      const formData = new FormData();
      formData.append('file', audioFile, audioFile.name);
    
      const audioTranscription = await openai.createTranscription(audioFile, 'whisper-1');
      audio_text = audioTranscription.data.text;
    } else if (!content) {
      message.error(t('nothingError'));
      return;
    }
    
    setProgressPercent(66);
    let prompt = `${t('legal.prompt.intro')} \n`;
    if (country) {
      prompt += `${country} ${t('legal.prompt.country')} \n`;
    }
    if (content) {
      prompt += `${t('legal.prompt.content')}: ${content}\n`;
    }

    if (audio_text) {
      prompt += `${t('prompt.audioIntro')}:\n`;
      prompt += `${t('prompt.audioFileName')}: ${audioFileName}\n`;
      prompt += `${t('prompt.audioText')}: ${audio_text}\n`;
       
    }

    if (extraOutput) {
      prompt += `${t('legal.prompt.extra')}: ${extraOutput}\n`;
    }
    
    
    
    prompt += `${t('sayLng')}`
    console.log(prompt);


    
    setMessages((prevMessages) => [
      ...prevMessages,
      ...(response ? [{ content: response, role: 'system' }] : []),
      { content: prompt, role: 'user' },
    ]);
    
    setProgressPercent(100);
  };

  const handleChatSubmit = () => {
    if (inputValue.trim() === "") 
    {
      message.error(t('chatNothingError'));
      return;
    }
    // 向messages中添加用户输入内容
    setMessages((prevMessages) => [
      ...prevMessages,
      ...(response ? [{ content: response, role: 'system' }] : []),
      { content: inputValue, role: 'user' },
    ]);
  
    // 清空输入框内容
    setInputValue('');
    setResponse('');
    // 处理用户输入的逻辑
  };

  const handleSubmit = (values) => {
    const { content, remarks, country } = values;
    setResponse('');
    callOpenAICompletionAPI({ content, remarks, country });
  };

  const handleUpload = async (file) => {
      const isAudio = file.type.startsWith('audio');
      const maxFileSize = 25 * 1024 * 1024; // 25 MB
  
      if (isAudio && audioList.length < 1 && file.size <= maxFileSize) {
        return true;
      }
  
      // 如果文件不是音频格式
      else if (!isAudio) {
        message.error(t('upload.TypeError'));
        return false;
      }
  
      // 如果已经上传了一个文件
      else if (audioList.length > 0) {
        message.warning(t('upload.NumError'));
        return false;
      }
      
      // 如果文件大小超过限制
      else if (file.size > maxFileSize) {
        message.error(t('upload.SizeError'));
        return false;
      }
  };
  
  
  
  // "偏好"复选框改变函数
  const onChangePreferences = (checkedValues) => {
    setPreferences(checkedValues);
  };
  // "自定义内容"输入框内容改变函数
  const onCustomContentChange = (e) => {
    setCustomContent(e.target.value);
  };


  return (
    <div>
      <Card
        title={
          <Breadcrumb separator=">">
            <Breadcrumb.Item>
              <a href="#">{t('homeTitle')}</a>
            </Breadcrumb.Item>
            <Breadcrumb.Item>{t('legal.breadcrumb.noteAssistant')}</Breadcrumb.Item>
          </Breadcrumb>
        }
      >
        <Form>
    <Form.Item>
      <Progress className="progress_circle" type="circle" style={{ left: '50%' }} percent={progressPercent} />
    </Form.Item>
      <Title level={3}>{t('resultTitle')}</Title>
      <Form.Item>
        <div className="chat-wrapper">
          {messages.length < 1 ? (
            <div className="empty"></div>
          ) : (
            messages.map((msg, i) => (
              //console.log("msg",msg),
              <Card
                key={i}
                className={`message-wrapper ${i === 0 && msg.role === 'user' ? 'first-user-message' : ''}`}
                bordered={false}
              >
                <div className="role">
                  <Tag color={msg.role === 'user' ? 'blue' : 'green'}>
                    {msg.role === 'user' ? t('user') : t('legal.system')}
                  </Tag>
                  
                </div>
                <pre className="chat-message">{msg.content}</pre>
              </Card>
            ))
          )}
        </div>
      </Form.Item>
      <Form.Item>
        <Card>
          <div className="role">
            <Tag color='purple'>{t("latestAnswer")}</Tag>
          </div>
          <div
            dangerouslySetInnerHTML={{
              __html: response ? response.replace(/\n/g, '<br/>') : '',
            }}
          ></div>
        </Card>
      </Form.Item>
      <Form.Item>
        {/* 在此处添加输入框 */}
        <Input
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder={t('continueChat')}
          onPressEnter={(e) => {
            e.preventDefault();
            //共用处理逻辑
            handleChatSubmit();
          }}
        />
      </Form.Item>
      <Form.Item>
        {/* 添加按钮，并设置 onClick 函数 */}
        <Button
          className="submit-button"
          type="primary"
          onClick={() => {
            //共用处理逻辑
            handleChatSubmit();
          }}
        >
          {t('countinueChatButton')}
        </Button>
      </Form.Item>
      
        
      
    </Form>
      </Card>
      <Card>
        <Form form={form} initialValues={{ content: '' }} onFinish={handleSubmit}>
          
  
          <Form.Item label={t('legal.extra')}>
            <Checkbox.Group onChange={onChangePreferences}>
              <Row>
                <Checkbox value={t('legal.extraOptions.relevantCase')}>{t('legal.extraOptions.relevantCase')}</Checkbox>
                <Checkbox value={t('legal.extraOptions.method')}>{t('legal.extraOptions.method')}</Checkbox>
                <Checkbox value={t('legal.extraOptions.result')}>{t('legal.extraOptions.result')}</Checkbox>
                <Checkbox value={t('custom')}>{t('custom')}</Checkbox>
              </Row>
            </Checkbox.Group>
            {preferences.includes(t('custom')) && (
              <Input
                placeholder= {t("customPlaceholder")}
                style={{ width: '100%', marginTop: 8 }}
                value={customContent}
                onChange={onCustomContentChange}
              />
            )}
          </Form.Item>
  
          <Form.Item label={t('legal.country')} name="defCountry">
            <Input
              placeholder={t('legal.countryPlaceholder')}
              value={country}
              onChange={handleCountryChange}
              name="country"
            />
          </Form.Item>
          
          
          <Form.Item
            label={t('legal.prompt.content')}
            name="content"
            rules={[{ required: false, message: t('legal.contentRulesMessage') }]}
          >
            <Input.TextArea rows={10} />
          </Form.Item>
          <Form.Item label={t('upload.uploadAudio')}>
            <Upload.Dragger
              name="audio"
              listType="picture-card"
              className="avatar-uploader"
              showUploadList={{
                showPreviewIcon: true,
                showRemoveIcon: true,
                showDownloadIcon: false,
              }}
              fileList={audioList}
              beforeUpload={(file) => {
                (async () => {
                  if (await handleUpload(file)) {
                    setAudioList([file]);
                    console.log(await handleUpload(file));
                  } else {
  
                    console.log(false, audioList);
                  }
                })();
                return false;
              }}
              onRemove={(file) => {
                // Remove the selected file from the audioList state
                setAudioList((oldAudioList) => oldAudioList.filter((item) => item.uid !== file.uid));
              }}
              onPreview={() => {}}
            >
              <p className="ant-upload-drag-icon">
                <InboxOutlined />
              </p>
              <p className="ant-upload-text">{t('dragger.uploadText')}</p>
              <p className="ant-upload-hint">{t('dragger.uploadHint')}</p>
            </Upload.Dragger>
          </Form.Item>
          <Form.Item
            label={t('remarks')}
            name="remarks"
            rules={[{ required: false, message: t('remarksPlaceholder') }]}
          >
            <Input placeholder={t('remarksPlaceholder')} style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item>
            <Button className="submit-button" size="large" type="primary" htmlType="submit">
              {t('legal.submitButton')}
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
} 

export default observer(Legal)