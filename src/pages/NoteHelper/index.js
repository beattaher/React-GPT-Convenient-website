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
} from 'antd';
import { PlusOutlined, InboxOutlined } from '@ant-design/icons';
import { v4 as uuidv4 } from 'uuid';
import { useStore } from '@/store';
import FormData from 'form-data';
import './index.scss';
import { useTranslation } from 'react-i18next';
import { tokenCounter } from '@/utils'


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
    const preferredOutput = preferences.includes(t('noteHelper.preferencesOptions.custom'))
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
      message.error('请至少输入文本内容或上传音频文件！');
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
      prompt += `${t('noteHelper.prompt.remarks')}: ${remarksContent.trim()}\n`;
    }
    
    
    prompt += `${t('noteHelper.prompt.sayLng')}`
    console.log(prompt);
    const promptTokenCount = tokenCounter(prompt);
    const maxTokens = 3700 - promptTokenCount;
    console.log(maxTokens);
    /*
    //for text-davinci-003
    const getResponse = await openai.createCompletion({
      model: 'text-davinci-003',
      prompt,
      temperature: 0.5,
      max_tokens: maxTokens,
      top_p: 1.0,
      frequency_penalty: 0.0,
      presence_penalty: 0.0,
    });
    */
    const response = await apiStore.callModel(prompt, apiStore.selectedModel)
    
    setResponse(response);
    //setResponse(getResponse.data.choices[0].text); //for text-davinci-003
    setProgressPercent(100);
  };

  const handleSubmit = (values) => {
    const { title, formType, content, remarks } = values;

    callOpenAICompletionAPI({ title, formType, content, remarks});
  };

  const handleUpload = async (file) => {
    const isAudio = file.type.startsWith('audio');
    
    if (isAudio && audioList.length < 1) {
      //console.log(true);
      return true;
    }
  
    // 如果文件不是音频格式
    else if (!isAudio) {
      message.error('请上传音频文件！');
      return false;
    }
    
    // 如果已经上传了一个文件
    else if (audioList.length > 0) {
      message.warning('仅支持单个音频文件上传。');
      return false;
    }
    
    
  };
  
  

  const onChangePreferences = (checkedValues) => {
    setPreferences(checkedValues);
  };
  const onCustomContentChange = (e) => {
    setCustomContent(e.target.value);
  };
  // "是否除去废话"状态改变函数


  const toggleRemoveClutter = () => {
    setRemoveClutter(!removeClutter);
  };
  
  return (
    <div>
      <Card
        title={
          <Breadcrumb separator=">">
            <Breadcrumb.Item>
              <a href="#">{t('noteHelper.breadcrumb.home')}</a>
            </Breadcrumb.Item>
            <Breadcrumb.Item>{t('noteHelper.breadcrumb.noteAssistant')}</Breadcrumb.Item>
          </Breadcrumb>
        }
      >
        <Space>
          <Progress className="progress_circle" type="circle" percent={progressPercent} />
          <div>
            <Title level={3}>{t('noteHelper.resultTitle')}</Title>
            <div
              dangerouslySetInnerHTML={{
                __html: response ? response.replace(/\n/g, '<br/>') : '',
              }}
            ></div>
          </div>
          
        </Space>
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

          <Form.Item label={t('noteHelper.formLabel.uploadAudio')}>
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
          

          <Form.Item label={t('noteHelper.formLabel.outputPreferences')}>
            <Checkbox.Group onChange={onChangePreferences}>
              <Row>
                <Checkbox value={t('noteHelper.preferencesOptions.summary')}>{t('noteHelper.preferencesOptions.summary')}</Checkbox>
                <Checkbox value={t('noteHelper.preferencesOptions.outline')}>{t('noteHelper.preferencesOptions.outline')}</Checkbox>
                <Checkbox value={t('noteHelper.preferencesOptions.custom')}>{t('noteHelper.preferencesOptions.custom')}</Checkbox>
              </Row>
            </Checkbox.Group>
            {preferences.includes(t('noteHelper.preferencesOptions.custom')) && (
              <Input
                placeholder="请输入自定义内容"
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
            label={t('noteHelper.formLabel.remarks')}
            name="remarks"
            rules={[{ required: false, message: t('noteHelper.remarksPlaceholder') }]}
          >
            <Input placeholder={t('noteHelper.remarksPlaceholder')} style={{ width: '100%' }} />
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
            <Button className="summary" size="large" type="primary" htmlType="submit">
              {t('noteHelper.summarizeButton')}
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default NoteHelper;



