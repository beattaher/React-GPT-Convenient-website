
import logo from '@/assets/logo.png'
import './index.scss'
import { Card,Button, Checkbox, Form, Input, message   } from 'antd';
import {useStore} from '@/store'
import { useNavigate } from 'react-router-dom';
function Login() {
  const {loginStore} = useStore()
  const navigate = useNavigate()
  
  async function onFinish (values) {
    try {
      await loginStore.getToken({
        mobile: values.username,
        code: values.password
      })
      navigate('/')
      message.success('登录成功')
    }catch (err) {
      console.log(err)
      message.error('登录失败')
    }
  }
  async function onLogOut () {
    try {
      await loginStore.logOut()
      navigate('/login')
      message.success('退出成功')
    }catch (err) {
      console.log(err)
      message.error('退出失败')
    }  
  };
  const onFinishFailed = (errorInfo) => {
    console.log('Failed:', errorInfo);
  };
  return (
    <div className="login">
      <Card className="login-container">
        <img className="login-logo" src={logo} alt="" />
        <div className="App">
        <Form
          name="basic"
          onFinish={onFinish}
          onFinishFailed={onFinishFailed}
          labelCol={{
            span: 2,
          }}
          
          style={{
            maxWidth: 600,
          }}
          initialValues={{
            remember: true,
          }}
          
          autoComplete="off"
        >
          <Form.Item
          initialValue="18883716551"
          name="username"
          rules ={[{
              
            required: true,
            message: 'Please input your username!',
          
        }]}>
            <Input size="large" placeholder= 'Please input your username!' />
          </Form.Item>

          <Form.Item
            name="password"
            initialValue="246810"
            rules ={[{
              
                required: true,
                message: 'Please input your password!',
              
            }]}
          >
            <Input size="large" placeholder= 'Please input your password!'  />
          </Form.Item>

          <Form.Item
            name="remember"
            valuePropName="checked"
            wrapperCol={{
              style: { display: 'flex', justifyContent: 'center' } // 新增样式
            }}
          >
            <Checkbox>Remember me</Checkbox>
          </Form.Item>

          <Form.Item
            wrapperCol={{
              
              style: { display: 'flex', justifyContent: 'center' } // 新增样式
            }}
          >
            <Button type="primary" htmlType="submit">
              Submit
            </Button>
          </Form.Item>
        </Form>
      
        
      </div>
      </Card>
    </div>
  )
}

export default Login