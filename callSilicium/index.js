const cloud = require('wx-server-sdk')
cloud.init()

// 引入 axios 用于发送 HTTP 请求
const axios = require('axios')

// API 配置
const API_URL = 'https://api.siliconflow.com/v1/chat/completions'  // 修正回正确的 API 路径

/**
 * 云函数入口函数
 * @param {Object} event 
 * @param {string} event.message 用户消息
 * @param {Object} event.options 可选配置
 */
exports.main = async (event, context) => {
  const { message, options = {} } = event
  const API_KEY = process.env.SILICIUM_KEY

  // 打印输入参数（隐藏敏感信息）
  console.log('输入参数:', {
    message,
    options,
    hasApiKey: !!API_KEY
  })

  try {
    // 构建消息历史
    const messages = [{
      role: "user",
      content: message
    }]

    // 准备请求头
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${API_KEY}`,
      'Accept': 'application/json'
    }

    // 准备请求数据
    const requestData = {
      model: "deepseek-ai/deepseek-vl2",  // 使用正确的模型名称
      messages: [{
        role: "system",
        content: "你是一个专业的时间管理助手，需要帮助用户分析时间使用情况并提供建议。请仔细阅读用户提供的时间记录数据（Markdown表格格式），从作息规律、时间分配、专注度等方面进行分析。回复要具体、专业、有见地，并给出可行的改进建议。如果没有数据，请友好提示用户先记录一些数据。"
      }, {
        role: "user",
        content: message
      }],
      temperature: 0.7,
      max_tokens: 1500,  // 根据成功日志修改
      stream: false
    }

    // 详细的请求日志
    console.log('完整请求信息:', {
      url: API_URL,
      method: 'POST',
      headers: {
        'Content-Type': headers['Content-Type'],
        'Authorization': 'Bearer ****',  // 隐藏 API Key
        'Accept': headers['Accept']
      },
      requestData: JSON.stringify(requestData, null, 2)
    })

    // 发送请求前检查
    if (!API_KEY) {
      throw new Error('未设置 API Key')
    }

    const response = await axios({
      method: 'POST',
      url: API_URL,
      timeout: 30000,
      headers: headers,
      data: requestData
    })

    // 打印响应信息
    console.log('API 响应状态:', response.status)
    console.log('API 响应头:', JSON.stringify(response.headers, null, 2))
    console.log('API 响应体:', JSON.stringify(response.data, null, 2))

    // 处理响应
    if (response.data && response.data.choices && response.data.choices.length > 0) {
      const result = response.data.choices[0]
      return {
        success: true,
        data: result.message?.content || result.text,
        usage: response.data.usage,
        finish_reason: result.finish_reason
      }
    }

    return {
      success: false,
      error: '没有收到有效回复'
    }

  } catch (error) {
    // 详细的错误日志
    console.error('API 调用详细错误信息:', {
      name: error.name,
      message: error.message,
      stack: error.stack,
      status: error.response?.status,
      statusText: error.response?.statusText,
      responseHeaders: error.response?.headers,
      responseData: error.response?.data,
      requestConfig: {
        url: error.config?.url,
        method: error.config?.method,
        headers: {
          'Content-Type': error.config?.headers['Content-Type'],
          'Authorization': 'Bearer ****',
          'Accept': error.config?.headers['Accept']
        },
        data: error.config?.data
      }
    })
    
    let errorMessage = '请求失败'
    if (error.response?.data?.error?.message) {
      errorMessage = error.response.data.error.message
    } else if (error.response?.data?.message) {
      errorMessage = error.response.data.message
    } else if (error.message) {
      errorMessage = error.message
    }

    return {
      success: false,
      error: `调用失败: ${errorMessage}`,
      code: error.response?.status || 500,
      details: error.response?.data || {}
    }
  }
}
