import React, { useState, useEffect } from 'react';
import {
  Card,
  Tag,
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
} from 'antd';
import { PlusOutlined, InboxOutlined } from '@ant-design/icons';
import { v4 as uuidv4 } from 'uuid';
import { useStore } from '@/store';
import FormData from 'form-data';
import './index.scss';
import { useTranslation } from 'react-i18next';
import { tokenCounter, handleAudioUpload } from '@/utils'
import { observer } from 'mobx-react-lite';

const { Configuration, OpenAIApi } = require('openai');
const { Title, Paragraph } = Typography;

class CustomFormData extends FormData {
  getHeaders() {
    return {};
  }
}

const NoteHelper = () => {
  const { t } = useTranslation();
  const { apiStore } = useStore();
  const [response, setResponse] = useState('');
  const [audioList, setAudioList] = useState([]);
  const [progressPercent, setProgressPercent] = useState(0);
  const [preferences, setPreferences] = useState([]);
  const [customContent, setCustomContent] = useState('');
  const [removeClutter, setRemoveClutter] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState(''); 

  // 异步把信息给API
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
  
  const callOpenAICompletionAPI = async ({ title, formType, content, remarks}) => {
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
    const preferredOutput = hasCustomContent
      ? (otherPreferences.length > 0 ? otherPreferences.join(', ') + ', ' : '') + customContent
      : preferences.join(', ');
  
    
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
    let prompt = `${t('noteHelper.prompt.intro')} \n`;
    if (title) {
      prompt += `${t('noteHelper.prompt.title')}: ${title}\n`;
    }
    
    if (formType) {
      prompt += `${t('noteHelper.prompt.formType')}: ${formType}\n`;
    }
    
    if (content) {
      prompt += `${t('noteHelper.prompt.content')}: ${content}\n`;
    }

    if (audio_text) {
      prompt += `${t('noteHelper.prompt.audioText')}: ${audio_text}\n`;
    }

    if (preferredOutput) {
      prompt += `${t('noteHelper.prompt.preferences')}: ${preferredOutput}\n`;
    }
    if (remarks || removeClutter) {
      const remarksContent = `${removeClutter ? t('noteHelper.prompt.removeClutter') : ''}${remarks ? ' ' + remarks : ''}`;
      prompt += `${t('remarks')}: ${remarksContent.trim()}\n`;
    }
    
    
    prompt += `${t('noteHelper.prompt.sayLng')}`
    console.log("in page",prompt);
    

    setMessages((prevMessages) => [
      ...prevMessages,
      ...(response ? [{ content: response, role: 'system' }] : []),
      { content: prompt, role: 'user' },
    ]);
    
    
    console.log("messages",messages);
    
    

    
    //setResponse(getResponse.data.choices[0].text); //for text-davinci-003
    setProgressPercent(100);
  };

  const handleChatSubmit = () => {
    // 添加这个条件检查
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
    const { title, formType, content, remarks } = values;
    setResponse('');
    console.log(response)
    callOpenAICompletionAPI({ title, formType, content, remarks });
  };

  const handleUpload = async (file) => {
    if (await handleAudioUpload(file, audioList, t)) {
      setAudioList([file]);
    } else {
      console.log(false, audioList);
    }
    return false;
  };
  
  
  
  // "偏好"复选框改变函数
  const onChangePreferences = (checkedValues) => {
    setPreferences(checkedValues);
  };
  // "自定义内容"输入框内容改变函数
  const onCustomContentChange = (e) => {
    setCustomContent(e.target.value);
  };

  // "是否除去废话"状态改变函数
  const toggleRemoveClutter = () => {
    setRemoveClutter(!removeClutter);
  };
  
  React.useEffect(() => {
    window.scrollTo(0, document.body.scrollHeight);
  }, [messages]);

  

  return (
    <div>
      <Card
    title={
      <Breadcrumb separator=">">
        <Breadcrumb.Item>
          <a href="#">{t('homeTitle')}</a>
        </Breadcrumb.Item>
        <Breadcrumb.Item>{t('noteHelper.breadcrumb.noteAssistant')}</Breadcrumb.Item>
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
                    {msg.role === 'user' ? t('user') : t('noteHelper.system')}
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
        <Form initialValues={{ title: '', formType: '', content: '' }} onFinish={handleSubmit}>
          <Form.Item
            label={t('noteHelper.formLabel.title')}
            name="title"
            rules={[{ required: false, message: t('noteHelper.titlePlaceholder') }]}
          >
            <Input placeholder={t('noteHelper.titlePlaceholder')} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item
            label={t('noteHelper.formLabel.formType')}
            name="formType"
            rules={[{ required: false, message: t('noteHelper.formTypePlaceholder') }]}
          >
            <Input placeholder={t('noteHelper.formTypePlaceholder')} style={{ width: '100%' }} />
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
            label={t('noteHelper.formLabel.outputPreferences')}

            rules={[
              {
                required: true,
                type: 'array',
                min: 1,
                message: t('noteHelper.preferencesOptions.requiredCheckMessage'),
              },
            ]}
          >
            <Checkbox.Group onChange={onChangePreferences}>
              <Row>
                <Checkbox value={t('noteHelper.preferencesOptions.summary')}>{t('noteHelper.preferencesOptions.summary')}</Checkbox>
                <Checkbox value={t('noteHelper.preferencesOptions.outline')}>{t('noteHelper.preferencesOptions.outline')}</Checkbox>
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

          <Form.Item
            label={t('noteHelper.formLabel.textContent')}
            name="content"
            rules={[{ required: false, message: t('noteHelper.contentRulesMessage') }]}
          >
            <Input.TextArea rows={10} />
          </Form.Item>
          <Form.Item
            label={t('remarks')}
            name="remarks"
            rules={[{ required: false, message: t('remarksPlaceholder') }]}
          >
            <Input placeholder={t('remarksPlaceholder')} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item>
            <Button
              size="large"
              type={removeClutter ? 'primary' : 'default'}
              onClick={toggleRemoveClutter}
            >
              {t('noteHelper.removeClutterButton')}
            </Button>
          </Form.Item>
          <Form.Item>
            <Button className="submit-button" size="large" type="primary" htmlType="submit">
              {t('noteHelper.summarizeButton')}
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default observer(NoteHelper);



