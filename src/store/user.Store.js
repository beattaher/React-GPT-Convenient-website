import {makeAutoObservable} from 'mobx'
import {http} from '@/utils'
class UserStore {
  useInfo = {}
  constructor() {
    makeAutoObservable(this)
  }
  getUserInfo = async() => {
    const res = await http.get('/user/profile')
    this.getUserInfo = res.data.data
  }
}  
export default UserStore