/**
 * 基于 axios 封装的请求模块
 */

export const login = (params) => $axios.$post('/api/admin/login', params)

export const signup = (params) => $axios.$post('/api/admin/signup', params)

const get = async () => await this.$axios.$get('/api/user/getAll')
const register = async (params) => await this.$axios.$post('/api/user/register', { params })
const deleteUser = async (params) => await this.$axios.$post('/api/user/delete', { params })
const upload = async (upload) => await this.$axios.$post('/api/user/upload', { upload })
const uploadBase64 = async (upload) => await this.$axios.$post('/api/user/uploadBase64', { upload })
const deletePhoto = async (upload) => await this.$axios.$post('/api/user/deletePhoto', { upload })
// 请求拦截器

// 响应拦截器
