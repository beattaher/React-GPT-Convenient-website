import { Layout, Menu, Popconfirm, Button } from 'antd';
import {
  HomeOutlined,
  DiffOutlined,
  EditOutlined,
  LogoutOutlined,
  AppstoreOutlined,
  ContainerOutlined,
  MenuFoldOutlined,
  PieChartOutlined,
  MenuUnfoldOutlined,
} from '@ant-design/icons';
import { useTranslation } from 'react-i18next';

import { observer } from 'mobx-react-lite';
import './index.scss';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useStore } from '@/store';
import { useEffect, useState } from 'react';

const { Header, Sider } = Layout;

const GeekLayout = () => {
  const { t } = useTranslation();
  const [collapsed, setCollapsed] = useState(false);
  const toggleCollapsed = () => {
    setCollapsed(!collapsed);
  };
  const { pathname } = useLocation();
  const { userStore, loginStore, channelStore } = useStore();
  //useStore.getUserInfo()
  useEffect(() => {
    userStore.getUserInfo();
    channelStore.loadChannelList();
  }, [userStore, channelStore]);
  const navigate = useNavigate();

  return (
    <Layout>
      <Header className="header">
        <div className="logo" />
        <div className="company_name"/>
        <div className="user-info">
          <span className="user-name">{t('layout.userInfo.userName')}</span>
          <span className="user-logout">
            <Popconfirm
              title={t('layout.userInfo.logoutConfirmation')}
              okText={t('layout.userInfo.logout')}
              cancelText={t('layout.userInfo.cancel')}
              onConfirm={() => loginStore.logOut()}
            >
              <LogoutOutlined /> {t('layout.userInfo.logout')}
            </Popconfirm>
          </span>
        </div>
      </Header>
      <Layout>
        <Sider
          width={200}
          className="site-layout-background"
          collapsible
          collapsed={collapsed}
          onCollapse={toggleCollapsed}
        >
          <Menu
            mode="inline"
            theme="dark"
            defaultSelectedKeys={[pathname]}
            style={{ height: '100%', borderRight: 0 }}
          >
            <Menu.Item icon={<HomeOutlined />} key="/">
              <Link to="/">{t('layout.menu.projectDescription')}</Link>
            </Menu.Item>
            <Menu.Item icon={<DiffOutlined />} key="/noteHelper">
              <Link to="/noteHelper">{t('layout.menu.noteAssistant')}</Link>
            </Menu.Item>
            <Menu.Item icon={<EditOutlined />} key="/publish">
              <Link to="/publish">{t('layout.menu.legalConsultation')}</Link>
            </Menu.Item>
          </Menu>
        </Sider>
        <Layout className="layout-content" style={{ padding: 20 }}>
          <Outlet />
        </Layout>
      </Layout>
    </Layout>
  );
};

export default observer(GeekLayout);
