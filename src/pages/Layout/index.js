import { Layout, Menu, Popconfirm} from 'antd'
import {
  HomeOutlined,
  DiffOutlined,
  EditOutlined,
  LogoutOutlined
} from '@ant-design/icons'
import {observer } from 'mobx-react-lite'
import './index.scss'
import { Outlet, Link, useLocation, useNavigate} from 'react-router-dom'
import {useStore} from '@/store'
import { useEffect } from 'react'

const { Header, Sider } = Layout

const GeekLayout = () => {

  const {pathname} = useLocation()
  const {userStore,loginStore, channelStore} = useStore()
  //useStore.getUserInfo()
  useEffect(() => {
    userStore.getUserInfo()
    channelStore.loadChannelList()
  },[userStore,channelStore])
  const navigate = useNavigate()

  return (
    <Layout>
      <Header className="header">
        <div className="logo" />
        <div className = "company_name"/>
        <div className="user-info">
          <span className="user-name">{userStore.name}</span>
          <span className="user-logout">
            <Popconfirm title="是否确认退出？" okText="退出" cancelText="取消" onConfirm={()=>loginStore.logOut()}> 
              <LogoutOutlined /> 退出
            </Popconfirm>
          </span>
        </div>
      </Header>
      <Layout>
        <Sider width={200} className="site-layout-background">
          <Menu
            mode="inline"
            theme="dark"
            defaultSelectedKeys={[pathname]}
            style={{ height: '100%', borderRight: 0 }}
          >
            <Menu.Item icon={<HomeOutlined />} key="/">
                <Link to='/'> 项目说明</Link>
              
            </Menu.Item>
            <Menu.Item icon={<DiffOutlined />} key="/article">
                <Link to='/article'> 笔记助手</Link>
              
            </Menu.Item>
            <Menu.Item icon={<EditOutlined />} key="/publish">
                <Link to='/publish'> 法律咨询（开发中）</Link>   
              
            </Menu.Item>
          </Menu>
        </Sider>
        <Layout className="layout-content" style={{ padding: 20 }}>
            <Outlet />
        </Layout>
      </Layout>
    </Layout>
  )
}

export default observer(GeekLayout)