/**
 * 硅基流动 API 服务
 * ===============
 * 
 * 简介
 * ----
 * 本服务提供了与硅基流动 API 的交互功能，使用 deepseek 模型进行对话。
 * 主要用于分析用户的时间记录数据，提供智能建议和洞察。
 * 
 * 调用示例
 * --------
 * ```javascript
 * const silicium = require('./services/silicium')
 * 
 * // 发送消息
 * const result = await silicium.sendMessage('帮我分析这段时间记录')
 * console.log(result.data) // AI 的回复内容
 * ```
 * 
 * 错误处理
 * --------
 * 所有方法都会返回统一的响应格式：
 * ```javascript
 * {
 *   success: boolean,  // 是否成功
 *   data?: string,    // 成功时的数据
 *   error?: string    // 失败时的错误信息
 * }
 * ```
 */

// 定义服务类
class SiliciumService {
  constructor() {
    // 初始化云函数环境
    if (!wx.cloud) {
      console.error('请使用 2.2.3 或以上的基础库以使用云能力')
      return
    }
    wx.cloud.init({
      env: 'yongshi-8gr2j4wf0508bf4d',
      traceUser: true,
    })
  }

  /**
   * 发送消息到硅基流动 API
   * ====================
   * 
   * @param {string} message - 用户输入的消息
   * @param {Object} [options] - 可选参数
   * @param {number} [options.temperature=0.7] - 温度参数，控制响应的随机性
   * @param {number} [options.max_tokens=1500] - 最大 token 数
   * @returns {Promise<Object>} 返回格式化的响应结果
   */
  async sendMessage(message, options = {}) {
    console.log('=== 调用硅基流动 API ===');
    console.log('输入消息:', message);
    console.log('选项参数:', options);

    try {
      console.log('准备调用云函数 callSilicium...');
      const response = await wx.cloud.callFunction({
        name: 'callSilicium',
        data: {
          message,
          options: {
            temperature: options.temperature || 0.7,
            max_tokens: options.max_tokens || 1500,
            model: 'deepseek-ai/deepseek-vl2'  // 使用正确的模型名称
          }
        }
      });
      console.log('云函数调用成功，响应:', response);

      return response.result;
    } catch (error) {
      console.error('硅基流动 API 调用失败:', error);
      console.error('错误详情:', {
        name: error.name,
        message: error.message,
        stack: error.stack
      });
      return {
        success: false,
        error: error.message || '请求失败'
      };
    }
  }
}

// 创建并导出服务实例
module.exports = new SiliciumService()
