// 主应用入口文件
class DataVisualizationApp {
    constructor() {
        // 初始化各个功能模块
        this.initModules();
        
        // 初始化应用
        this.initApp();
    }

    // 初始化各个功能模块
    initModules() {
        // 初始化菜单管理器
        this.menuManager = new window.MenuManager();
        
        // 初始化图表管理器
        window.chartManager = new window.ChartManager();
        
        // 初始化数据处理器
        window.dataProcessor = new window.DataProcessor();
        
        // 初始化UI管理器
        this.uiManager = new window.UIManager();
        
        // 初始化消息管理器
        window.messageManager = new window.MessageManager();
    }

    // 初始化应用
    initApp() {
        console.log('blueblue应用已启动');
    }
}

// 当页面加载完成后启动应用
if (typeof window !== 'undefined') {
    // 浏览器环境
    window.addEventListener('DOMContentLoaded', () => {
        window.app = new DataVisualizationApp();
    });
} else {
    // Node.js环境 - 仅用于导出模块
    module.exports = {
        DataVisualizationApp
    };
}