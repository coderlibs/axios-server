(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('axios')) :
    typeof define === 'function' && define.amd ? define(['exports', 'axios'], factory) :
    (global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory(global["Axios-Server"] = {}, global.axios));
})(this, (function (exports, axios) { 'use strict';

    function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

    var axios__default = /*#__PURE__*/_interopDefaultLegacy(axios);

    class Service {
        /**
         *
         * @param {*} [config={}]  配置参数
         * @param {*} [apis={}]  接口对象
         * @param {*} [prefixUrl='']  适用于后端微服务，单个服务模块前缀
         */
        constructor(config, apis, prefixUrl = '') {
            this.axiosInstance = axios__default["default"].create(config);
            /* 请求拦截器 */
            this.axiosInstance.interceptors.request.use(this.request ? this.request : (config) => {
                return config;
            }, (error) => {
                return Promise.reject(error);
            });
            /* 响应拦截器 */
            this.axiosInstance.interceptors.response.use(this.response ? this.response : (response) => {
                return response.data;
            }, (error) => {
                var _a;
                // 处理 HTTP 网络错误
                return Promise.reject((_a = error.response) === null || _a === void 0 ? void 0 : _a.data);
            });
            const keys = Object.keys(apis);
            keys.forEach(key => {
                this[key] = (options = {}) => {
                    options = this._getOptions(options, apis[key]);
                    const { method, path = '', query, body } = options;
                    return this.axiosInstance({
                        url: prefixUrl + path,
                        method,
                        params: query,
                        data: body,
                        headers: Object.assign({}, options.headers),
                    });
                };
            });
        }
        /**
         *
         * @param {*} [options={}]
         * @param {*} [apiOptions={}]
         * @return
         * @memberof Service
         * @description path的替换也直接做了
         */
        _getOptions(options = {}, apiOptions = {}) {
            // params表示path当中需要替换的字段汇聚成的对象，如果有部分参数没有被替换，直接被废除，不做他用
            const KEYWORDS = ['api', 'path', 'params', 'headers', 'query', 'body', 'method', 'dataType', 'noAlert', 'mock', 'preProcess', 'process', 'download'];
            const newOptions = Object.assign({ method: 'get' }, apiOptions, options);
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
            newOptions.path = this._replacePath(newOptions);
            // 将参数抽离到query或者body中
            for (const key in newOptions) {
                if (!KEYWORDS.includes(key)) {
                    newOptions[subKey][key] = newOptions[key];
                    delete newOptions[key];
                }
                else {
                    newOptions[key] = newOptions[key];
                }
            }
            // 没有query || body设置[为普通对象时，无属性]，直接删掉
            if (!Object.keys(newOptions[subKey]).length && !(newOptions[subKey] instanceof FormData)) {
                delete newOptions[subKey];
            }
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
        _replacePath(newOptions) {
            const { api, path = '' } = newOptions;
            const apiUrl = api.substr(0, 1) == "/" ? api : '/' + api;
            return path + apiUrl;
        }
    }
    function handleService(apis, path) {
        Object.keys(apis).forEach(key => {
            if (!apis[key].method) {
                apis[key].method = 'get';
            }
            if (!apis[key].path) {
                Object.assign(apis[key], {
                    path,
                });
            }
        });
        return apis;
    }

    exports["default"] = Service;
    exports.handleService = handleService;

    Object.defineProperty(exports, '__esModule', { value: true });

}));
