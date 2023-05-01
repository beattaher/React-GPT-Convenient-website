import { makeAutoObservable } from 'mobx'
import {history, http,setToken,getToken,removeToken} from '@/utils'

class LoginStore {
    token = getToken() || ''
    
    constructor() {
        makeAutoObservable(this)
    }
    getToken = async({mobile, code}) => {
        //调用登录接口
        const res = await http.post('http://geek.itheima.net/v1_0/authorizations', {
            mobile, code
        })
        this.token = res.data
        setToken(this.token)
    }
    logOut = () => {
        //调用退出接口
        removeToken()
        history.push('/login')
    }
}
export default LoginStore