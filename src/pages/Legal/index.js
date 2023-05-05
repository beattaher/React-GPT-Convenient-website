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
  Cascader
} from 'antd';
import { PlusOutlined, InboxOutlined } from '@ant-design/icons';
import { v4 as uuidv4 } from 'uuid';
import { useStore } from '@/store';
import FormData from 'form-data';
import './index.scss';
import { useTranslation } from 'react-i18next';
import { tokenCounter } from '@/utils'
import { observer } from 'mobx-react-lite';

import { getUserCountryName } from '@/utils';

const { Configuration, OpenAIApi } = require('openai');
const { Title, Paragraph } = Typography;

class CustomFormData extends FormData {
  getHeaders() {
    return {};
  }
}

// Mock 数据源
const countries = [
  {
    value: 'China',
    label: '中国'
  },
  {
    value: 'United States',
    label: '美国'
  },
  // 添加更多的国家数据...
];

const Legal = () => {
  const { t } = useTranslation();
  const { apiStore } = useStore();
  const [response, setResponse] = useState('');
  const [audioList, setAudioList] = useState([]);
  const [progressPercent, setProgressPercent] = useState(0);
  const [preferences, setPreferences] = useState([]);
  const [customContent, setCustomContent] = useState('');
  const [country, setCountry] = useState();

  useEffect(() => {
    // 假设您已经有了这个 Promise
    const countryPromise = Promise.resolve('United States');

    const fetchCountryName = async () => {
      const result = await countryPromise;
      setCountry(result);
    };

    fetchCountryName();
  }, []);
  

  console.log(country);
  
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
    const extraOutput = preferences.includes(t('legal.extraOptions.custom'))
      ? preferences.join(', ') + ': ' + customContent
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
    let prompt = `${t('legal.prompt.intro')} \n`;
    if (country) {
      prompt += `${country} ${t('legal.prompt.country')} \n`;
    }
    if (content) {
      prompt += `${t('legal.prompt.content')}: ${content}\n`;
    }

    if (audio_text) {
      prompt += `${t('legal.prompt.audioText')}: ${audio_text}\n`;
    }

    if (extraOutput) {
      prompt += `${t('legal.prompt.extra')}: ${extraOutput}\n`;
    }
    
    
    
    prompt += `${t('sayLng')}`
    console.log(prompt);
    const promptTokenCount = tokenCounter(prompt);
    const maxTokens = 3700 - promptTokenCount;
    console.log(maxTokens);

    const response = await apiStore.callModel(prompt, apiStore.selectedModel)
    
    setResponse(response);
    setProgressPercent(100);
  };

  const handleSubmit = (values) => {
    const { content, remarks, country } = values;

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
        <Space>
          <Progress className="progress_circle" type="circle" percent={progressPercent} />
          <div>
            <Title level={3}>{t('resultTitle')}</Title>
            <div
              dangerouslySetInnerHTML={{
                __html: response ? response.replace(/\n/g, '<br/>') : '',
              }}
            ></div>
          </div>
          
        </Space>
      </Card>
      <Card>
        <Form initialValues={{ content: '' }} onFinish={handleSubmit}>
          
  
          <Form.Item label={t('legal.extra')}>
            <Checkbox.Group onChange={onChangePreferences}>
              <Row>
                <Checkbox value={t('legal.extraOptions.relevantCase')}>{t('legal.extraOptions.relevantCase')}</Checkbox>
                <Checkbox value={t('legal.extraOptions.method')}>{t('legal.extraOptions.method')}</Checkbox>
                <Checkbox value={t('legal.extraOptions.result')}>{t('legal.extraOptions.result')}</Checkbox>
                <Checkbox value={t('legal.extraOptions.custom')}>{t('legal.extraOptions.custom')}</Checkbox>
              </Row>
            </Checkbox.Group>
            {preferences.includes(t('legal.extraOptions.custom')) && (
              
              <Form.Item label={t('legal.country')} name="country">
                <Input
                  placeholder={t('legal.countryPlaceholder')}
                  
                  defaultValue={country}
                  onChange={handleCountryChange}
                  name="country"
                />
              </Form.Item>
              
            )}
          </Form.Item>
  
          <Form.Item label={t('legal.country')} name="country">
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
            <Button className="summary" size="large" type="primary" htmlType="submit">
              {t('legal.submitButton')}
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
} 

export default observer(Legal)