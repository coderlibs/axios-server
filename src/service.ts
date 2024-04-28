import axios from 'axios'
import type { AxiosError, AxiosInstance, AxiosResponse, InternalAxiosRequestConfig } from 'axios'
export default class Service {
    public axiosInstance: AxiosInstance;
    public request: any;
    public response: any;
    /**
     *
     * @param {*} [config={}]  配置参数
     * @param {*} [apis={}]  接口对象
     * @param {*} [prefixUrl='']  适用于后端微服务，单个服务模块前缀
     */
    constructor(config: any, apis: any, prefixUrl = '') {
        this.axiosInstance = axios.create(config)
        /* 请求拦截器 */
        this.axiosInstance.interceptors.request.use(this.request ? this.request : (config: InternalAxiosRequestConfig) => {
            return config
        }, (error: AxiosError) => {
            return Promise.reject(error)
        })
        /* 响应拦截器 */
        this.axiosInstance.interceptors.response.use(this.response ? this.response : (response: AxiosResponse) => {
            return response.data
        }, (error: AxiosError) => {
            // 处理 HTTP 网络错误
            return Promise.reject(error.response?.data)
        })
        const keys = Object.keys(apis);
        keys.forEach(key => {
            (this as any)[key] = (options: any = {}) => {
                options = this._getOptions(options, apis[key]);
                const { method, path = '', query, body } = options;
                return this.axiosInstance({
                    url: prefixUrl + path,
                    method,
                    params: query,
                    data: body,
                    headers: Object.assign({}, options.headers),
                })
            }
        })
    }
    /**
     *
     * @param {*} [options={}]
     * @param {*} [apiOptions={}]
     * @return
     * @memberof Service
     * @description path的替换也直接做了
     */
    private _getOptions(options: any = {}, apiOptions: any = {}) {
        // params表示path当中需要替换的字段汇聚成的对象，如果有部分参数没有被替换，直接被废除，不做他用
        const KEYWORDS = ['api', 'path', 'params', 'headers', 'query', 'body', 'method', 'dataType', 'noAlert', 'mock', 'preProcess', 'process', 'download'];
        const newOptions: any = Object.assign({ method: 'get' }, apiOptions, options);
        // 为body的情况可能有两种,put || post
        const subKey = newOptions.method === 'get' ? 'query' : 'body';
        !newOptions[subKey] && (newOptions[subKey] = {});
        if (options.query && apiOptions.query) {
            Object.assign(newOptions.query, apiOptions.query, options.query);
        }
        if (newOptions.action) {
            newOptions.api = newOptions.api || '';
            newOptions.api = newOptions.action;
            delete newOptions.action;
        }

        newOptions.path = this._replacePath(newOptions)
        // 将参数抽离到query或者body中
        for (const key in newOptions) {
            if (!KEYWORDS.includes(key)) {
                newOptions[subKey][key] = newOptions[key];
                delete newOptions[key];
            } else { newOptions[key] = newOptions[key]; }
        }

        // 没有query || body设置[为普通对象时，无属性]，直接删掉
        if (!Object.keys(newOptions[subKey]).length && !(newOptions[subKey] instanceof FormData)) { delete newOptions[subKey]; }

        return newOptions;
    }
    /**
     *
     * 合并处理请求api地址
     * @param {*} path 子路径
     * @param {*} api  接口名
     * @return
     * @memberof Service
     */
    private _replacePath(newOptions: any) {
        const { api, path = '' } = newOptions;
        const apiUrl = api.substr(0, 1) == "/" ? api : '/' + api
        return path + apiUrl
    }
}
export function handleService(apis: any, path: any) {
    Object.keys(apis).forEach(key => {
        if (!apis[key].method) { apis[key].method = 'get'; }
        if (!apis[key].path) {
            Object.assign(apis[key], {
                path,
            });
        }
    });
    return apis
}
export { AxiosError, AxiosResponse, InternalAxiosRequestConfig }