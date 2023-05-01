import {
  Card,
  Breadcrumb,
  Form,
  Button,
  Radio,
  Input,
  Upload,
  Space,
  Select,
  message
} from 'antd'
import { PlusOutlined } from '@ant-design/icons'
import { Link, Navigate, useSearchParams } from 'react-router-dom'
import './index.scss'
import ReactQuill from 'react-quill'
import 'react-quill/dist/quill.snow.css'
import { useStore } from '@/store'
import { observer } from 'mobx-react-lite'
import { useState,useRef, useEffect } from 'react'
import {http} from '@/utils'

const { Option } = Select

const Publish = () => {
  const { channelStore } = useStore()
  //获得文章id
  const [params] = useSearchParams()
  const articleId = params.get('articleId')
  //图片上传列表
  const cachefileList = useRef([])
  const [fileList, setFileList] = useState([])

  //图片上传
  const onUploadChange = ({newfileList}) => {
    const formatFileList = newfileList.map(file => {
      
        return{
          url:file.response.data.url
        }
      
    })  
    setFileList(formatFileList)
    cachefileList.current = formatFileList
    
    //console.log(cachefileList)
  }
  
  //切换图片
  const [imageCount, setImageCount] = useState(1)
  const radioChange = (e) => {
    setImageCount(e.target.value)
    
    if(imageCount=== 1){

      setFileList(cachefileList.current? cachefileList.current[0] : [])
    }else if (imageCount === 3){
      setFileList (cachefileList.current)
    }else if(imageCount === 0){
      return false
    }
    console.log(fileList)
    console.log(cachefileList)
  }
  const onFinish = async(values) => {
    const {channel_id, content, tiltle, type} = values
    const params = {
      channel_id, content, tiltle, type,
      cover: {
        type:type,
        images: fileList.map(item => item.response.data.url)
      }
    }
    console.log(values)
    if(articleId){
      await http.put(`/mp/articles/${articleId}`, params)
    }else{
      await http.post('/mp/articles?draft=false', params)
    }
    Navigate('/article')
    message.success(articleId ? '编辑成功' : '发布成功')
  }
  
  const form = useRef(null)
  useEffect(() => {
    async function getArticle () {
      const res = await http.get(`/mp/articles/${articleId}`)
      form.current.setFieldsValue({
        ...res.data, type : res.data.cover.type
      })
      setFileList(res.data.cover.images.map(url => {
        return {
          url
        }
      }))
      cachefileList.current= fileList
    }
    if (articleId) {
      // 拉取数据回显
      getArticle()
    }
}, [articleId])
  return (
    <div className="publish">
      <Card
        title={
          <Breadcrumb separator=">">
            <Breadcrumb.Item>
              <Link to="/home">首页</Link>
            </Breadcrumb.Item>
            <Breadcrumb.Item>{
              articleId ? '编辑文章' : '新增文章'
            }
            </Breadcrumb.Item>
          </Breadcrumb>
        }
      >
        <Form
          labelCol={{ span: 4 }}
          wrapperCol={{ span: 16 }}
          initialValues={{ type: 1, content: 'this is content' }}
          onFinish={onFinish}
          ref = {form}
        >
          <Form.Item
            label="标题"
            name="title"
            rules={[{ required: true, message: '请输入文章标题' }]}
          >
            <Input placeholder="请输入文章标题" style={{ width: 400 }} />
          </Form.Item>
          <Form.Item
            label="频道"
            name="channel_id"
            rules={[{ required: true, message: '请选择文章频道' }]}
          >
            <Select placeholder="请选择文章频道" style={{ width: 400 }}>
              {channelStore.channelList.map(item => (
                <Option key = {item.id} value={item.id}>item.name</Option>
              ))}
              
            </Select>
          </Form.Item>

          <Form.Item label="封面">
            <Form.Item name="type">
              <Radio.Group
                onChange={ radioChange}
              >
                <Radio value={1}>单图</Radio>
                <Radio value={3}>三图</Radio>
                <Radio value={0}>无图</Radio>
              </Radio.Group>
            </Form.Item>
            {imageCount >0 &&(
              <Upload
              name="image"
              listType="picture-card"
              className="avatar-uploader"
              showUploadList
              action="https://www.mocky.io/v2/5cc8019d300000980a055e76"
              fileList={fileList}
              onChange={onUploadChange}
              multiple= {imageCount > 1}
              maxCount={imageCount}
            >
              <div style={{ marginTop: 8 }}>
                <PlusOutlined />
              </div>
            </Upload>
            )}
            
          </Form.Item>
          <Form.Item
            label="内容"
            name="content"
            rules={[{ required: true, message: '请输入文章内容' }]}
          ></Form.Item>
          <ReactQuill them = 'snow' />
          <Form.Item wrapperCol={{ offset: 4 }}>
            <Space>
              <Button size="large" type="primary" htmlType="submit">
                {
                  articleId ? '保存' : '发布'
                }
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Card>
    </div>
  )
}

export default observer(Publish)