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
    }

    // 初始化应用
    initApp() {
        console.log('数据可视化应用已启动');
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
}// 数据处理功能模块
class DataProcessor {
    constructor() {
        this.processedData = null;
    }

    // 处理输入的数据
    processData() {
        const dataInput = document.getElementById('data-input');
        if (!dataInput) {
            console.error('数据输入元素未找到');
            return null;
        }

        const data = dataInput.value.trim();

        if (!data) {
            alert('请输入数据');
            return null;
        }

        // 解析数据
        this.processedData = this.parseData(data);
        
        // 显示处理结果
        this.displayResult();
        
        console.log('处理后的数据:', this.processedData);
        return this.processedData;
    }

    // 解析不同格式的数据
    parseData(dataString) {
        // 如果是JSON格式
        if (dataString.startsWith('{') || dataString.startsWith('[')) {
            try {
                return JSON.parse(dataString);
            } catch (e) {
                // 如果JSON解析失败，继续尝试其他格式
            }
        }

        // 检查是否为行列转置格式（第一行包含多个列标题）
        const lines = dataString.split('\n').filter(line => line.trim() !== '');
        if (lines.length > 1) {
            // 检查是否为表格格式（第一行包含多个列标题）
            const firstLineItems = lines[0].split(',').map(item => item.trim());
            if (firstLineItems.length > 2) { // 至少有两列数据（第一列是行标签，其他列是列标签）
                return this.parseMatrixData(lines);
            }
        }

        // 如果是CSV格式（逗号分隔）
        if (dataString.includes(',') && !dataString.includes('\n')) {
            // 处理单行逗号分隔格式，如"英语 34,43,435,424,53,5"
            const parts = dataString.split(' ');
            if (parts.length >= 2) {
                const label = parts[0]; // 如"英语"
                const valuesStr = parts.slice(1).join(' '); // 如"34,43,435,424,53,5"
                // 使用正则表达式提取所有数值，包括中文逗号和英文逗号
                const values = valuesStr.match(/[\d.]+/g);
                
                if (values && values.length > 0) {
                    // 创建多个数据项，如英语第1次, 英语第2次, ...
                    const result = values.map((value, index) => ({
                        label: `${label}第${index + 1}次`,
                        value: parseFloat(value) || 0
                    }));
                    return result;
                }
            }
        }

        // 处理多行CSV格式
        if (dataString.includes(',')) {
            const lines = dataString.split('\n');
            const result = [];
            
            for (const line of lines) {
                const parts = line.split(',');
                if (parts.length >= 2) {
                    result.push({
                        label: parts[0].trim(),
                        value: parseFloat(parts[1].trim()) || 0
                    });
                }
            }
            
            return result;
        }
        
        // 如果是空格分隔的格式（如"语文 1\n数学 2\n英语 3"）
        if (dataString.includes(' ')) {
            const lines = dataString.split('\n');
            const result = [];
            
            for (const line of lines) {
                // 支持多个空格分隔
                const parts = line.trim().split(/\s+/);
                if (parts.length >= 2) {
                    // 尝试将最后一部分解析为数值
                    const value = parseFloat(parts[parts.length - 1]);
                    if (!isNaN(value)) {
                        // 其余部分作为标签
                        const label = parts.slice(0, parts.length - 1).join(' ');
                        result.push({
                            label: label,
                            value: value
                        });
                    }
                }
            }
            
            if (result.length > 0) {
                return result;
            }
        }
        
        // 处理连续的无分隔符数据格式，如"英语3数学4"
        // 或混合格式，如"英语3 79"
        const continuousPattern = /([^\d\s]+)(\d+(?:\.\d+)?)/g;
        const continuousMatches = [...dataString.matchAll(continuousPattern)];
        
        if (continuousMatches.length > 0) {
            const result = [];
            for (const match of continuousMatches) {
                const label = match[1].trim();
                const value = parseFloat(match[2]);
                if (label && !isNaN(value)) {
                    result.push({
                        label: label,
                        value: value
                    });
                }
            }
            
            if (result.length > 0) {
                return result;
            }
        }
        
        // 处理特殊混合格式，如"英语3 79"（表示英语3科目得了79分）
        // 这种格式是：文本+数字 空格 数字
        const specialMixedPattern = /([^\d\s]+\d+)\s+(\d+(?:\.\d+)?)/g;
        const specialMixedMatches = [...dataString.matchAll(specialMixedPattern)];
        
        if (specialMixedMatches.length > 0) {
            const result = [];
            for (const match of specialMixedMatches) {
                const label = match[1].trim(); // 如"英语3"
                const value = parseFloat(match[2]); // 如79
                if (label && !isNaN(value)) {
                    result.push({
                        label: label,
                        value: value
                    });
                }
            }
            
            if (result.length > 0) {
                return result;
            }
        }

        // 如果是简单数组格式
        if (dataString.includes('[') && dataString.includes(']')) {
            try {
                const arrayStr = dataString.match(/\[(.*?)\]/)[1];
                return arrayStr.split(',').map(item => parseFloat(item.trim()) || 0);
            } catch (e) {
                // 解析失败
            }
        }

        // 默认返回原始字符串
        return dataString;
    }

    // 解析行列转置格式（通用矩阵格式）
    parseMatrixData(lines) {
        // 解析表头（列标签）
        const headers = lines[0].split(',').map(header => header.trim());
        const columnLabels = headers.slice(1); // 第一列是行标签，其余是列标签
        
        // 解析数据行
        const rowLabels = [];
        const values = [];
        
        for (let i = 1; i < lines.length; i++) {
            const items = lines[i].split(',').map(item => item.trim());
            const rowLabel = items[0]; // 行标签
            rowLabels.push(rowLabel);
            
            // 列值
            const rowValues = items.slice(1).map(value => parseFloat(value) || 0);
            values.push(rowValues);
        }
        
        // 返回处理后的矩阵数据结构
        return {
            type: 'matrix',
            columnLabels: columnLabels,  // 列标签
            rowLabels: rowLabels,        // 行标签
            values: values               // 值矩阵
        };
    }

    // 显示处理结果
    displayResult() {
        let resultText = '';
        
        if (Array.isArray(this.processedData)) {
            if (this.processedData.length > 0 && typeof this.processedData[0] === 'object') {
                // 对象数组
                resultText = '已处理数据 (对象数组):\n';
                this.processedData.slice(0, 5).forEach((item, index) => {
                    resultText += `${index + 1}. ${item.label}: ${item.value}\n`;
                });
            } else {
                // 简单数组
                resultText = '已处理数据 (数值数组):\n';
                resultText += this.processedData.slice(0, 10).join(', ');
                if (this.processedData.length > 10) {
                    resultText += '...';
                }
            }
        } else if (typeof this.processedData === 'object') {
            resultText = '已处理数据 (对象):\n';
            Object.keys(this.processedData).slice(0, 5).forEach(key => {
                resultText += `${key}: ${this.processedData[key]}\n`;
            });
        } else {
            resultText = `已处理数据:\n${this.processedData.substring(0, 100)}`;
            if (this.processedData.length > 100) {
                resultText += '...';
            }
        }

        alert('数据处理完成!\n\n' + resultText);
    }

    // 获取处理后的数据
    getData() {
        return this.processedData;
    }
}

// 导出数据处理器
window.DataProcessor = DataProcessor;