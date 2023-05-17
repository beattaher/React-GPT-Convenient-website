import React from 'react';
import { Card, Tag, Typography, Input, Form } from 'antd';

const { Title } = Typography;
const FormItem = Form.Item;

const chatComponent = ({
  t,
  messages,
  response,
  progressPercent,
  setInputValue,
  inputValue,
  setMessages,
  setResponse,
  Progress,
  
}) => {
  return (
        
      <Form>
        <FormItem>
          <Progress className="progress_circle" type="circle" style={{ left: '50%' }} percent={progressPercent} />
        </FormItem>
        <Title level={3}>{t('resultTitle')}</Title>
        <FormItem>
          <div className="chat-wrapper">
            {messages.length < 1 ? (
              <div className="empty"></div>
            ) : (
            
              messages.map((msg, i) => (
                <Card
                  key={i}
                  className={`message-wrapper ${i === 0 && msg.role === 'user' ? 'first-user-message' : ''}`}
                  bordered={false}
                >
                  <div className="role">
                    <Tag color={msg.role === 'user' ? 'blue' : 'green'}>{t(msg.role)}</Tag>
                  </div>
                  <pre className="chat-message">{msg.content}</pre>
                </Card>
              ))
            )}
          </div>
        </FormItem>
        <FormItem>
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
        </FormItem>
        <FormItem>
          {/* 在此处添加输入框 */}
          <Input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder={t('continueChat')}
            onPressEnter={(e) => {
              e.preventDefault();

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
            }}
          />
        </FormItem>
      </Form>

  );
};

export {chatComponent};
