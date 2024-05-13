# axios-server
axios-server是基于axios封装的server服务类,可以通过配置对象的形式来简化api函数封装，用户只需要配置好接口对象即可，而不需要一个个导出接口函数

## 使用方法

### 一、常规原始用法(不推荐)  - 配置请求函数，单独导出

```ts

// utils/request.js
import Service from "axios-server"

const services = new Service({
    baseURL: "http://127.0.0.1:5050",
    timeout: 10,
    headers: {
        "Content-Type": "application/json"
    }
})

services.axiosInstance.interceptors.request.use((config) => {
    const token = "json-web-token"
    if (config.headers) {
        config.headers["x-token"] = token
    }
    return config
})
services.axiosInstance.interceptors.response.use((res) => {
    return res.data
}, err => {
    return Promise.reject(err.response?.data)
})
export default services;
```

```ts
// api/login.js
import services from '@utils/request.js'
// 提交请求事件
const login = (username, password): AxiosPromise<UserInfo> =>{
    services.commit({
        data: {username, password},
        url: "/users/login",
        method: "post"
    });
}
const userList = (pageSize, pageNum): AxiosPromise<UserInfo[]> =>{
    services.commit({
        params: {pageSize: 1, pageNum: 10},
        url: "/users/list",
        method: "get"
    });
}

// 直接调用get、post等方法请求
const search = (key): AxiosPromise<UserInfo[]> =>{
    services.post( "/users/search",{
      pageSize: 1,
      pageNum: 10
    });
}
const getUserInfo = (key): AxiosPromise<UserInfo[]> =>{
    services.get("/users/userInfo");
}
```

#### 二、创新用法(推荐) - 配置对象的形式

```js
// api/config.js
export default {
   baseURL: "http://124.221.204.219:8888",
    timeout: 10,
    headers: {
        "Content-Type": "application/json"
    }
}
```

```js
// api/login.js
import config from './config.js'
import Service,{ handleService } from 'axios-server'


// 定义用户相关模块的接口
const prefix = '/server/main';  // 用户模块接口前缀
const apis = {
    // 获取登录用户信息
    getUserInfo: {
        action: 'getUserInfo',
    },
    // 获取用户信息
    getCurrentUserInfo: {
        action: 'getCurrentUserInfo',
        method: 'post'
    },
    // 获取用户创作内容数据
    getCurrentUserData: {
        action: 'getCurrentUserData',
        method: 'post'
    },
    // 是否关注用户
    isFollowUser: {
        action: '/publicApi/isFollowUser',
        method: 'post'
    },
    // 关注或取消关注用户
    unOrFollowUser: {
        action: '/publicApi/unOrFollowUser',
        method: 'post'
    }
};

// 定义鱼塘模块接口
const fishpondPrefix = '/server/web'; // 鱼塘模块接口前缀
const fishpondPath = '/fishpond';  // 鱼塘模块接口path(适用于当前模块下，前缀相同，但是又根据功能划分了不同接口路径的情况)
const fishpond:any = {
    // 获取用户鱼塘信息
    getUserFishpond: {
        action: '/publicApi/getUserFishpond',
        method: 'post'
    },
  	getFishpondList: {
        action: '/publicApi/getUserFishpond',
      	path: '/fishpond'  // 也可以在这单独写path,不单独写就用统一的fishpondPath，使用handleService方法进行处理
    },
}

handleService(fishpond,fishpondPath)  // 使用内部提供的方法，可以将fishpondPath拼接到每个接口的path上，内部也会判断，如果没有提供method，默认按照get类型进行处理
const service = Object.assign(new Service(config,apis, prefix),new Service(config,fishpond, fishpondPrefix));
export default service;
```

使用请求方法，以vue为例：

```vue
<script setup>
  import server from '@/api/index';
// 获取用户信息
const getUserInfo = async () => {
  let { Relust } = await server.getCurrentUserInfo({  // 不管是get还是post,参数都可以在对象里直接传，不用单独写params或者data
    userId: route.params && route.params.id,
    headers:{  // 也可以单独配置headers
      'x-user-info':'coderlibs'
    }
  })
  userInfo.value = Relust;
}
```



