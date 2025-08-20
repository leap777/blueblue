// 图表功能模块
class ChartManager {
    constructor() {
        this.currentChart = null;
        this.currentChartType = 'bar';
        this.currentChartSubtype = 'group-by-column'; // 默认子类型
        this.currentColor = '#4ecdc4';
        this.currentTransparency = 1; // 透明度，默认为1（不透明）
        this.originalColors = {}; // 存储原始颜色，避免重复转换导致变黑
        this.chartSettings = {
            title: '',
            xAxisLabel: '',
            yAxisLabel: '',
            xAxisMin: 0,
            yAxisMin: 0,
            xAxisStep: 1,
            yAxisStep: 50
        };
    }

    // 设置当前图表类型
    setChartType(type) {
        console.log('设置图表类型:', type);
        this.currentChartType = type;
    }

    // 设置当前图表子类型
    setChartSubtype(subtype) {
        console.log('设置图表子类型:', subtype);
        this.currentChartSubtype = subtype;
    }

    // 设置当前颜色
    setColor(color) {
        this.currentColor = color;
        // 如果已有图表，更新颜色
        if (this.currentChart) {
            this.updateChartColor();
        }
    }

    // 设置透明度
    setTransparency(transparency) {
        this.currentTransparency = transparency / 100; // 转换为0-1之间的值
        // 如果已有图表，更新透明度
        if (this.currentChart) {
            this.updateChartColor();
        }
    }

    // 设置图表配置
    setChartSettings(settings) {
        this.chartSettings = { ...this.chartSettings, ...settings };
    }

    // 应用图表设置
    applyChartSettings() {
        if (this.currentChart) {
            // 更新图表标题
            if (this.chartSettings.title) {
                this.currentChart.options.plugins.title = {
                    display: true,
                    text: this.chartSettings.title
                };
            } else {
                this.currentChart.options.plugins.title = {
                    display: false
                };
            }

            // 更新坐标轴标签
            if (this.currentChart.options.scales) {
                if (this.chartSettings.xAxisLabel) {
                    if (this.currentChart.options.scales.x) {
                        this.currentChart.options.scales.x.title = {
                            display: true,
                            text: this.chartSettings.xAxisLabel
                        };
                    }
                }

                if (this.chartSettings.yAxisLabel) {
                    if (this.currentChart.options.scales.y) {
                        this.currentChart.options.scales.y.title = {
                            display: true,
                            text: this.chartSettings.yAxisLabel
                        };
                    }
                }

                // 更新坐标轴起始值和间隔
                if (this.chartSettings.xAxisMin !== undefined && this.currentChart.options.scales.x) {
                    this.currentChart.options.scales.x.min = this.chartSettings.xAxisMin;
                }

                if (this.chartSettings.yAxisMin !== undefined && this.currentChart.options.scales.y) {
                    this.currentChart.options.scales.y.min = this.chartSettings.yAxisMin;
                }

                if (this.chartSettings.xAxisStep && this.currentChart.options.scales.x) {
                    this.currentChart.options.scales.x.ticks = {
                        stepSize: this.chartSettings.xAxisStep
                    };
                }

                if (this.chartSettings.yAxisStep && this.currentChart.options.scales.y) {
                    this.currentChart.options.scales.y.ticks = {
                        stepSize: this.chartSettings.yAxisStep
                    };
                }
            }

            this.currentChart.update();
        }
    }

    // 更新图表颜色（包括透明度）
    updateChartColor() {
        if (!this.currentChart) return;

        // 更新图表数据集的颜色
        if (this.currentChart.data && this.currentChart.data.datasets) {
            this.currentChart.data.datasets.forEach((dataset, index) => {
                // 为每个数据集存储原始颜色
                if (!this.originalColors[index]) {
                    this.originalColors[index] = {
                        backgroundColor: dataset.backgroundColor,
                        borderColor: dataset.borderColor
                    };
                }

                // 使用原始颜色来应用透明度，避免重复转换
                const originalBgColor = this.originalColors[index].backgroundColor;
                const originalBorderColor = this.originalColors[index].borderColor;

                // 饼图有多个颜色，需要特殊处理
                if (originalBgColor && Array.isArray(originalBgColor)) {
                    // 对于饼图，我们保持原有的多色方案，只更新透明度
                    dataset.backgroundColor = originalBgColor.map(color => 
                        this.addAlphaToColor(this.extractColorValue(color), this.currentTransparency));
                } else if (originalBgColor) {
                    dataset.backgroundColor = this.addAlphaToColor(
                        this.extractColorValue(originalBgColor), 
                        this.currentTransparency
                    );
                }

                // 处理边框颜色
                if (originalBorderColor && Array.isArray(originalBorderColor)) {
                    dataset.borderColor = originalBorderColor.map(color => 
                        this.addAlphaToColor(this.extractColorValue(color), this.currentTransparency));
                } else if (originalBorderColor) {
                    dataset.borderColor = this.addAlphaToColor(
                        this.extractColorValue(originalBorderColor), 
                        this.currentTransparency
                    );
                }
            });
            this.currentChart.update();
        }
    }

    // 提取颜色值，去除透明度信息
    extractColorValue(color) {
        if (!color) return color;

        // 如果颜色是rgba格式，提取rgb部分
        if (color.startsWith('rgba')) {
            const match = color.match(/rgba\(([^)]+)\)/);
            if (match) {
                const values = match[1].split(',');
                if (values.length >= 3) {
                    // 返回rgb格式的颜色值
                    return `rgb(${values[0].trim()}, ${values[1].trim()}, ${values[2].trim()})`;
                }
            }
        }
        
        // 如果颜色是rgb格式，直接返回
        if (color.startsWith('rgb')) {
            return color;
        }
        
        // 如果颜色是十六进制格式，直接返回
        if (color.startsWith('#')) {
            return color;
        }
        
        // 默认返回原颜色
        return color;
    }

    // 为颜色添加透明度
    addAlphaToColor(color, alpha) {
        if (!color) return color;

        // 如果颜色已经是rgba格式，更新透明度
        if (color.startsWith('rgba')) {
            const match = color.match(/rgba\(([^)]+)\)/);
            if (match) {
                const values = match[1].split(',');
                if (values.length >= 3) {
                    return `rgba(${values[0].trim()}, ${values[1].trim()}, ${values[2].trim()}, ${alpha})`;
                }
            }
        }
        
        // 如果颜色是rgb格式，添加透明度
        if (color.startsWith('rgb')) {
            const match = color.match(/rgb\(([^)]+)\)/);
            if (match) {
                return `rgba(${match[1]}, ${alpha})`;
            }
        }
        
        // 如果颜色是十六进制格式，转换为rgba
        if (color.startsWith('#')) {
            // 将十六进制颜色转换为rgba
            const r = parseInt(color.slice(1, 3), 16);
            const g = parseInt(color.slice(3, 5), 16);
            const b = parseInt(color.slice(5, 7), 16);
            return `rgba(${r}, ${g}, ${b}, ${alpha})`;
        }
        
        // 默认返回原颜色加上透明度
        return color;
    }

    // 应用并绘制图表
    applyChart() {
        const chartCanvas = document.getElementById('chartCanvas');
        const placeholderText = document.getElementById('placeholder-text');

        if (!chartCanvas) return;

        // 确保canvas元素支持toDataURL方法
        if (typeof chartCanvas.toDataURL !== 'function') {
            console.error('Canvas元素不支持toDataURL方法');
            return;
        }

        // 隐藏占位文本
        if (placeholderText) {
            placeholderText.style.display = 'none';
        }

        // 如果已有图表，先销毁
        if (this.currentChart) {
            this.currentChart.destroy();
        }

        // 清空原始颜色存储
        this.originalColors = {};

        // 获取上下文
        const ctx = chartCanvas.getContext('2d');

        // 根据选择的图表类型创建图表
        try {
            switch(this.currentChartType) {
                case 'bar':
                    this.createBarChart(ctx);
                    break;
                case 'line':
                    this.createLineChart(ctx);
                    break;
                case 'horizontalBar':
                    this.createHorizontalBarChart(ctx);
                    break;
                case 'pie':
                    this.createPieChart(ctx);
                    break;
                case 'scatter':
                    this.createScatterChart(ctx);
                    break;
                case 'boxplot':
                    this.createBoxPlot(ctx);
                    break;
                case 'heatmap':
                    this.createHeatMap(ctx);
                    break;
                case 'radar':
                    this.createRadarChart(ctx);
                    break;
                case 'area':
                    this.createAreaChart(ctx);
                    break;
                default:
                    this.createBarChart(ctx);
            }

            // 应用图表设置
            this.applyChartSettings();
        } catch (error) {
            console.error('图表创建失败:', error);
            // 如果当前图表类型创建失败，则回退到默认的条形图
            this.currentChartType = 'bar';
            this.createBarChart(ctx);
            // 应用图表设置
            this.applyChartSettings();
        }
    }

    // 创建折线图
    createLineChart(ctx) {
        // 获取用户数据
        let labels = ['北京', '上海', '广州', '深圳', '杭州'];
        let data = [120, 190, 130, 160, 110];
        let datasets = null;
        
        // 如果有处理后的用户数据，则使用用户数据
        if (window.dataProcessor && window.dataProcessor.getData()) {
            const userData = window.dataProcessor.getData();
            if (Array.isArray(userData)) {
                if (userData.length > 0 && typeof userData[0] === 'object' && userData[0].label !== undefined && userData[0].value !== undefined) {
                    // 对象数组格式 [{label: 'A', value: 10}, ...]
                    labels = userData.map(item => item.label);
                    data = userData.map(item => item.value);
                } else if (userData.length > 0 && typeof userData[0] === 'number') {
                    // 数值数组格式 [10, 20, 30, ...]
                    labels = userData.map((_, index) => `数据${index + 1}`);
                    data = userData;
                }
            } else if (userData && userData.type === 'matrix') {
                // 矩阵数据格式 - 创建多条线，每条线代表一个学生
                return this.createLineChartFromMatrix(ctx, userData);
            }
        }
        
        const colorWithAlpha = this.addAlphaToColor(this.currentColor, this.currentTransparency);
        const fillColorWithAlpha = this.addAlphaToColor(this.currentColor, this.currentTransparency * 0.2); // 填充区域使用更低的透明度
        this.currentChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: '数据可视化',
                    data: data,
                    borderColor: colorWithAlpha,
                    backgroundColor: fillColorWithAlpha, // 填充区域使用更低的透明度
                    borderWidth: 2,
                    pointBackgroundColor: colorWithAlpha,
                    pointBorderColor: '#fff',
                    pointBorderWidth: 1,
                    pointRadius: 4,
                    fill: true,
                    tension: 0.4 // 添加曲线效果
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: this.chartSettings.yAxisMin === 0,
                        min: this.chartSettings.yAxisMin,
                        title: {
                            display: !!this.chartSettings.yAxisLabel,
                            text: this.chartSettings.yAxisLabel
                        },
                        ticks: {
                            stepSize: this.chartSettings.yAxisStep
                        }
                    },
                    x: {
                        min: this.chartSettings.xAxisMin,
                        title: {
                            display: !!this.chartSettings.xAxisLabel,
                            text: this.chartSettings.xAxisLabel
                        }
                    }
                },
                plugins: {
                    title: {
                        display: !!this.chartSettings.title,
                        text: this.chartSettings.title
                    }
                }
            }
        });
        
        // 存储原始颜色
        this.originalColors[0] = {
            backgroundColor: this.currentColor,
            borderColor: this.currentColor
        };
        
        window.currentChart = this.currentChart;
    }

    // 从矩阵数据创建折线图
    createLineChartFromMatrix(ctx, matrixData) {
        const { columnLabels, rowLabels, values } = matrixData;
        
        // 为每个列创建一条线
        const datasets = columnLabels.map((columnLabel, columnIndex) => {
            // 为每个列选择一个颜色
            const colors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#feca57', '#ff9ff3', '#54a0ff', '#5f27cd', '#00d2d3', '#ff9f43'];
            const colorIndex = columnIndex % colors.length;
            const color = colors[colorIndex];
            
            return {
                label: columnLabel,
                data: values.map(rowValues => rowValues[columnIndex]),
                borderColor: this.addAlphaToColor(color, this.currentTransparency),
                backgroundColor: this.addAlphaToColor(color, this.currentTransparency * 0.2),
                borderWidth: 2,
                pointBackgroundColor: this.addAlphaToColor(color, this.currentTransparency),
                pointBorderColor: '#fff',
                pointBorderWidth: 1,
                pointRadius: 4,
                fill: false,
                tension: 0.4
            };
        });
        
        this.currentChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: rowLabels, // 行标签作为x轴标签
                datasets: datasets
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: this.chartSettings.yAxisMin === 0,
                        min: this.chartSettings.yAxisMin,
                        title: {
                            display: !!this.chartSettings.yAxisLabel,
                            text: this.chartSettings.yAxisLabel
                        },
                        ticks: {
                            stepSize: this.chartSettings.yAxisStep
                        }
                    },
                    x: {
                        min: this.chartSettings.xAxisMin,
                        title: {
                            display: !!this.chartSettings.xAxisLabel,
                            text: this.chartSettings.xAxisLabel
                        }
                    }
                },
                plugins: {
                    title: {
                        display: !!this.chartSettings.title,
                        text: this.chartSettings.title || '数据趋势图'
                    },
                    legend: {
                        position: 'top',
                        labels: {
                            padding: 15,
                            usePointStyle: true
                        }
                    }
                }
            }
        });
        
        // 存储原始颜色
        datasets.forEach((dataset, index) => {
            this.originalColors[index] = {
                backgroundColor: dataset.backgroundColor,
                borderColor: dataset.borderColor
            };
        });
        
        window.currentChart = this.currentChart;
    }

    // 创建柱状图
    createBarChart(ctx) {
        // 获取用户数据
        let labels = ['北京', '上海', '广州', '深圳', '杭州'];
        let data = [120, 190, 130, 160, 110];
        let datasets = null;
        
        // 如果有处理后的用户数据，则使用用户数据
        if (window.dataProcessor && window.dataProcessor.getData()) {
            const userData = window.dataProcessor.getData();
            if (Array.isArray(userData)) {
                if (userData.length > 0 && typeof userData[0] === 'object' && userData[0].label !== undefined && userData[0].value !== undefined) {
                    // 对象数组格式 [{label: 'A', value: 10}, ...]
                    labels = userData.map(item => item.label);
                    data = userData.map(item => item.value);
                } else if (userData.length > 0 && typeof userData[0] === 'number') {
                    // 数值数组格式 [10, 20, 30, ...]
                    labels = userData.map((_, index) => `数据${index + 1}`);
                    data = userData;
                }
            } else if (userData && userData.type === 'matrix') {
                // 矩阵数据格式 - 创建分组柱状图
                // 根据子类型选择展示方式
                if (this.currentChartSubtype === 'group-by-row') {
                    return this.createSubjectBarChartFromMatrix(ctx, userData);
                } else {
                    return this.createBarChartFromMatrix(ctx, userData);
                }
            }
        }
        
        const colorWithAlpha = this.addAlphaToColor(this.currentColor, this.currentTransparency);
        const borderColorWithAlpha = this.addAlphaToColor(this.currentColor, Math.min(1, this.currentTransparency + 0.2)); // 边框稍微不透明一些
        this.currentChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    label: '数据可视化',
                    data: data,
                    backgroundColor: colorWithAlpha,
                    borderColor: borderColorWithAlpha,
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: this.chartSettings.yAxisMin === 0,
                        min: this.chartSettings.yAxisMin,
                        title: {
                            display: !!this.chartSettings.yAxisLabel,
                            text: this.chartSettings.yAxisLabel
                        },
                        ticks: {
                            stepSize: this.chartSettings.yAxisStep
                        }
                    },
                    x: {
                        min: this.chartSettings.xAxisMin,
                        title: {
                            display: !!this.chartSettings.xAxisLabel,
                            text: this.chartSettings.xAxisLabel
                        }
                    }
                },
                plugins: {
                    title: {
                        display: !!this.chartSettings.title,
                        text: this.chartSettings.title
                    }
                }
            }
        });
        
        // 存储原始颜色
        this.originalColors[0] = {
            backgroundColor: this.currentColor,
            borderColor: this.currentColor
        };
        
        window.currentChart = this.currentChart;
    }

    // 从矩阵数据创建柱状图（列标签为x轴，行标签为分组）
    createBarChartFromMatrix(ctx, matrixData) {
        const { columnLabels, rowLabels, values } = matrixData;
        
        // 为每个行标签创建一个数据集
        const datasets = rowLabels.map((rowLabel, rowIndex) => {
            // 为每个行标签选择一个颜色
            const colors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#feca57', '#ff9ff3', '#54a0ff', '#5f27cd', '#00d2d3', '#ff9f43'];
            const colorIndex = rowIndex % colors.length;
            const color = colors[colorIndex];
            
            return {
                label: rowLabel,
                data: values[rowIndex],
                backgroundColor: this.addAlphaToColor(color, this.currentTransparency),
                borderColor: this.addAlphaToColor(color, Math.min(1, this.currentTransparency + 0.2)),
                borderWidth: 1
            };
        });
        
        this.currentChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: columnLabels, // 列标签作为x轴标签
                datasets: datasets
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: this.chartSettings.yAxisMin === 0,
                        min: this.chartSettings.yAxisMin,
                        title: {
                            display: !!this.chartSettings.yAxisLabel,
                            text: this.chartSettings.yAxisLabel,
                            font: {
                                size: 14,
                                weight: 'bold'
                            }
                        },
                        grid: {
                            color: 'rgba(0, 0, 0, 0.05)'
                        },
                        ticks: {
                            stepSize: this.chartSettings.yAxisStep,
                            font: {
                                size: 11
                            }
                        }
                    },
                    x: {
                        min: this.chartSettings.xAxisMin,
                        title: {
                            display: !!this.chartSettings.xAxisLabel,
                            text: this.chartSettings.xAxisLabel,
                            font: {
                                size: 14,
                                weight: 'bold'
                            }
                        },
                        grid: {
                            display: false
                        },
                        ticks: {
                            font: {
                                size: 11
                            }
                        }
                    }
                },
                plugins: {
                    title: {
                        display: true,
                        text: this.chartSettings.title || '数据柱状图',
                        font: {
                            size: 16,
                            weight: 'bold'
                        }
                    },
                    legend: {
                        position: 'top',
                        labels: {
                            padding: 15,
                            usePointStyle: true,
                            font: {
                                size: 12
                            }
                        }
                    },
                    tooltip: {
                        backgroundColor: 'rgba(0, 0, 0, 0.8)',
                        titleFont: {
                            size: 14
                        },
                        bodyFont: {
                            size: 12
                        },
                        callbacks: {
                            label: function(context) {
                                return `${context.dataset.label}: ${context.parsed.y.toFixed(2)}`;
                            }
                        }
                    }
                },
                barPercentage: 0.8,
                categoryPercentage: 0.9
            }
        });
        
        // 存储原始颜色
        datasets.forEach((dataset, index) => {
            this.originalColors[index] = {
                backgroundColor: dataset.backgroundColor,
                borderColor: dataset.borderColor
            };
        });
        
        window.currentChart = this.currentChart;
    }

    // 从矩阵数据创建柱状图（行标签为x轴，列标签为分组）
    createSubjectBarChartFromMatrix(ctx, matrixData) {
        const { columnLabels, rowLabels, values } = matrixData;
        
        // 转置数据，使列标签为x轴，行标签为分组
        const transposedValues = columnLabels.map((_, columnIndex) => 
            values.map(rowValues => rowValues[columnIndex])
        );
        
        // 为每个列标签创建一个数据集
        const datasets = columnLabels.map((columnLabel, columnIndex) => {
            // 为每个列标签选择一个颜色
            const colors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#feca57', '#ff9ff3', '#54a0ff', '#5f27cd', '#00d2d3', '#ff9f43'];
            const colorIndex = columnIndex % colors.length;
            const color = colors[colorIndex];
            
            return {
                label: columnLabel,
                data: transposedValues[columnIndex],
                backgroundColor: this.addAlphaToColor(color, this.currentTransparency),
                borderColor: this.addAlphaToColor(color, Math.min(1, this.currentTransparency + 0.2)),
                borderWidth: 1
            };
        });
        
        this.currentChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: rowLabels, // 行标签作为x轴标签
                datasets: datasets
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: this.chartSettings.yAxisMin === 0,
                        min: this.chartSettings.yAxisMin,
                        title: {
                            display: !!this.chartSettings.yAxisLabel,
                            text: this.chartSettings.yAxisLabel,
                            font: {
                                size: 14,
                                weight: 'bold'
                            }
                        },
                        grid: {
                            color: 'rgba(0, 0, 0, 0.05)'
                        },
                        ticks: {
                            stepSize: this.chartSettings.yAxisStep,
                            font: {
                                size: 11
                            }
                        }
                    },
                    x: {
                        min: this.chartSettings.xAxisMin,
                        title: {
                            display: !!this.chartSettings.xAxisLabel,
                            text: this.chartSettings.xAxisLabel,
                            font: {
                                size: 14,
                                weight: 'bold'
                            }
                        },
                        grid: {
                            display: false
                        },
                        ticks: {
                            font: {
                                size: 11
                            }
                        }
                    }
                },
                plugins: {
                    title: {
                        display: true,
                        text: this.chartSettings.title || '数据柱状图',
                        font: {
                            size: 16,
                            weight: 'bold'
                        }
                    },
                    legend: {
                        position: 'top',
                        labels: {
                            padding: 15,
                            usePointStyle: true,
                            font: {
                                size: 12
                            }
                        }
                    },
                    tooltip: {
                        backgroundColor: 'rgba(0, 0, 0, 0.8)',
                        titleFont: {
                            size: 14
                        },
                        bodyFont: {
                            size: 12
                        },
                        callbacks: {
                            label: function(context) {
                                return `${context.dataset.label}: ${context.parsed.y.toFixed(2)}`;
                            }
                        }
                    }
                },
                barPercentage: 0.8,
                categoryPercentage: 0.9
            }
        });
        
        // 存储原始颜色
        datasets.forEach((dataset, index) => {
            this.originalColors[index] = {
                backgroundColor: dataset.backgroundColor,
                borderColor: dataset.borderColor
            };
        });
        
        window.currentChart = this.currentChart;
    }

    // 创建水平柱状图
    createHorizontalBarChart(ctx) {
        // 获取用户数据
        let labels = ['北京', '上海', '广州', '深圳', '杭州'];
        let data = [120, 190, 130, 160, 110];
        
        // 如果有处理后的用户数据，则使用用户数据
        if (window.dataProcessor && window.dataProcessor.getData()) {
            const userData = window.dataProcessor.getData();
            if (Array.isArray(userData)) {
                if (userData.length > 0 && typeof userData[0] === 'object' && userData[0].label !== undefined && userData[0].value !== undefined) {
                    // 对象数组格式 [{label: 'A', value: 10}, ...]
                    labels = userData.map(item => item.label);
                    data = userData.map(item => item.value);
                } else if (userData.length > 0 && typeof userData[0] === 'number') {
                    // 数值数组格式 [10, 20, 30, ...]
                    labels = userData.map((_, index) => `数据${index + 1}`);
                    data = userData;
                }
            }
        }
        
        const colorWithAlpha = this.addAlphaToColor(this.currentColor, this.currentTransparency);
        const borderColorWithAlpha = this.addAlphaToColor(this.currentColor, Math.min(1, this.currentTransparency + 0.2)); // 边框稍微不透明一些
        this.currentChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    label: '数据可视化',
                    data: data,
                    backgroundColor: colorWithAlpha,
                    borderColor: borderColorWithAlpha,
                    borderWidth: 1
                }]
            },
            options: {
                indexAxis: 'y',
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    x: {
                        beginAtZero: this.chartSettings.xAxisMin === 0,
                        min: this.chartSettings.xAxisMin,
                        title: {
                            display: !!this.chartSettings.xAxisLabel,
                            text: this.chartSettings.xAxisLabel
                        },
                        ticks: {
                            stepSize: this.chartSettings.xAxisStep
                        }
                    },
                    y: {
                        min: this.chartSettings.yAxisMin,
                        title: {
                            display: !!this.chartSettings.yAxisLabel,
                            text: this.chartSettings.yAxisLabel
                        }
                    }
                },
                plugins: {
                    title: {
                        display: !!this.chartSettings.title,
                        text: this.chartSettings.title
                    }
                }
            }
        });
        
        // 存储原始颜色
        this.originalColors[0] = {
            backgroundColor: this.currentColor,
            borderColor: this.currentColor
        };
        
        window.currentChart = this.currentChart;
    }

    // 创建饼状图
    createPieChart(ctx) {
        // 获取用户数据
        let labels = ['北京', '上海', '广州', '深圳', '杭州'];
        let data = [120, 190, 130, 160, 110];
        
        // 如果有处理后的用户数据，则使用用户数据
        if (window.dataProcessor && window.dataProcessor.getData()) {
            const userData = window.dataProcessor.getData();
            if (Array.isArray(userData)) {
                if (userData.length > 0 && typeof userData[0] === 'object' && userData[0].label !== undefined && userData[0].value !== undefined) {
                    // 对象数组格式 [{label: 'A', value: 10}, ...]
                    labels = userData.map(item => item.label);
                    data = userData.map(item => item.value);
                } else if (userData.length > 0 && typeof userData[0] === 'number') {
                    // 数值数组格式 [10, 20, 30, ...]
                    labels = userData.map((_, index) => `数据${index + 1}`);
                    data = userData;
                }
            }
        }
        
        // 为每个数据点选择一个颜色
        const colors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#feca57', '#ff9ff3', '#54a0ff', '#5f27cd', '#00d2d3', '#ff9f43'];
        const backgroundColors = data.map((_, index) => {
            const colorIndex = index % colors.length;
            return this.addAlphaToColor(colors[colorIndex], this.currentTransparency);
        });
        
        const borderColors = data.map((_, index) => {
            const colorIndex = index % colors.length;
            return this.addAlphaToColor(colors[colorIndex], Math.min(1, this.currentTransparency + 0.2));
        });
        
        this.currentChart = new Chart(ctx, {
            type: 'pie',
            data: {
                labels: labels,
                datasets: [{
                    data: data,
                    backgroundColor: backgroundColors,
                    borderColor: borderColors,
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    title: {
                        display: !!this.chartSettings.title,
                        text: this.chartSettings.title
                    },
                    legend: {
                        position: 'right'
                    }
                }
            }
        });
        
        // 存储原始颜色
        this.originalColors[0] = {
            backgroundColor: backgroundColors,
            borderColor: borderColors
        };
        
        window.currentChart = this.currentChart;
    }

    // 创建散点图
    createScatterChart(ctx) {
        // 获取用户数据
        let data = [
            { x: 10, y: 20 },
            { x: 30, y: 40 },
            { x: 50, y: 60 }
        ];
        
        // 如果有处理后的用户数据，则使用用户数据
        if (window.dataProcessor && window.dataProcessor.getData()) {
            const userData = window.dataProcessor.getData();
            if (Array.isArray(userData)) {
                if (userData.length > 0 && typeof userData[0] === 'object' && userData[0].label !== undefined && userData[0].value !== undefined) {
                    // 对象数组格式 [{label: 'A', value: 10}, ...]
                    // 将标签索引作为x坐标，值作为y坐标
                    data = userData.map((item, index) => ({
                        x: index,
                        y: item.value
                    }));
                } else if (userData.length > 0 && typeof userData[0] === 'number') {
                    // 数值数组格式 [10, 20, 30, ...]
                    // 将索引作为x坐标，值作为y坐标
                    data = userData.map((value, index) => ({
                        x: index,
                        y: value
                    }));
                }
            }
        }
        
        const colorWithAlpha = this.addAlphaToColor(this.currentColor, this.currentTransparency);
        this.currentChart = new Chart(ctx, {
            type: 'scatter',
            data: {
                datasets: [{
                    label: '数据可视化',
                    data: data,
                    backgroundColor: colorWithAlpha,
                    borderColor: '#fff',
                    borderWidth: 2,
                    pointRadius: 8,
                    pointHoverRadius: 12
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: this.chartSettings.yAxisMin === 0,
                        min: this.chartSettings.yAxisMin,
                        title: {
                            display: !!this.chartSettings.yAxisLabel,
                            text: this.chartSettings.yAxisLabel
                        },
                        ticks: {
                            stepSize: this.chartSettings.yAxisStep
                        }
                    },
                    x: {
                        min: this.chartSettings.xAxisMin,
                        title: {
                            display: !!this.chartSettings.xAxisLabel,
                            text: this.chartSettings.xAxisLabel
                        },
                        ticks: {
                            stepSize: this.chartSettings.xAxisStep
                        }
                    }
                },
                plugins: {
                    title: {
                        display: !!this.chartSettings.title,
                        text: this.chartSettings.title
                    },
                    legend: {
                        display: data.length > 0 // 只有在有数据时才显示图例
                    }
                }
            }
        });
        
        // 存储原始颜色
        this.originalColors[0] = {
            backgroundColor: this.currentColor,
            borderColor: '#fff'
        };
        
        window.currentChart = this.currentChart;
    }

    // 创建箱型图
    createBoxPlot(ctx) {
        // 检查子类型，决定创建哪种类型的图表
        if (this.currentChartSubtype === 'violin') {
            return this.createViolinPlot(ctx);
        }
        
        // 获取用户数据
        let labels = ['类别A', '类别B', '类别C'];
        let categoryData = [];
        
        // 如果有处理后的用户数据，则使用用户数据
        if (window.dataProcessor && window.dataProcessor.getData()) {
            const userData = window.dataProcessor.getData();
            if (Array.isArray(userData)) {
                if (userData.length > 0 && Array.isArray(userData[0])) {
                    // 二维数组格式 [[1,2,3], [4,5,6], [7,8,9]]
                    categoryData = userData;
                    labels = userData.map((_, index) => `类别${String.fromCharCode(65 + index)}`);
                } else if (userData.length > 0 && typeof userData[0] === 'object' && userData[0].label !== undefined && Array.isArray(userData[0].values)) {
                    // 对象数组格式 [{label: 'A', values: [1,2,3]}, ...]
                    categoryData = userData.map(item => item.values);
                    labels = userData.map(item => item.label);
                } else if (userData.length > 0 && typeof userData[0] === 'object' && userData[0].label !== undefined && userData[0].value !== undefined) {
                    // 对象数组格式 [{label: 'A', value: 10}, ...]，将数据分为3组
                    const values = userData.map(item => item.value);
                    const chunkSize = Math.ceil(values.length / 3);
                    for (let i = 0; i < 3; i++) {
                        const start = i * chunkSize;
                        const end = Math.min(start + chunkSize, values.length);
                        if (start < values.length) {
                            categoryData.push(values.slice(start, end));
                        }
                    }
                    labels = userData.map(item => item.label).slice(0, categoryData.length);
                } else if (userData.length > 0 && typeof userData[0] === 'number') {
                    // 一维数值数组，平均分配到3个类别中
                    const chunkSize = Math.ceil(userData.length / 3);
                    for (let i = 0; i < 3; i++) {
                        const start = i * chunkSize;
                        const end = Math.min(start + chunkSize, userData.length);
                        categoryData.push(userData.slice(start, end));
                    }
                    labels = ['数据组1', '数据组2', '数据组3'];
                }
            }
        }
        
        // 如果没有用户数据或用户数据无效，则使用默认数据
        if (categoryData.length === 0) {
            // 创建更真实的箱型图数据，模拟Python seaborn风格
            const categoryA = [75, 80, 85, 90, 95, 100, 105, 110, 115, 120, 125, 130];
            const categoryB = [60, 65, 70, 75, 80, 85, 90, 95, 100, 105, 110, 115];
            const categoryC = [50, 55, 60, 65, 70, 75, 80, 85, 90, 95, 100, 105];
            categoryData = [categoryA, categoryB, categoryC];
        }
        
        // 使用专门的箱线图类创建图表
        const boxPlotChart = new window.BoxPlotChart(this);
        this.currentChart = boxPlotChart.createChart(ctx, categoryData, labels);
        window.currentChart = this.currentChart;
    }

    // 创建小提琴图
    createViolinPlot(ctx) {
        // 获取用户数据
        let labels = ['类别A', '类别B', '类别C'];
        let categoryData = [];
        
        // 如果有处理后的用户数据，则使用用户数据
        if (window.dataProcessor && window.dataProcessor.getData()) {
            const userData = window.dataProcessor.getData();
            if (Array.isArray(userData)) {
                if (userData.length > 0 && Array.isArray(userData[0])) {
                    // 二维数组格式 [[1,2,3], [4,5,6], [7,8,9]]
                    categoryData = userData;
                    labels = userData.map((_, index) => `类别${String.fromCharCode(65 + index)}`);
                } else if (userData.length > 0 && typeof userData[0] === 'object' && userData[0].label !== undefined && Array.isArray(userData[0].values)) {
                    // 对象数组格式 [{label: 'A', values: [1,2,3]}, ...]
                    categoryData = userData.map(item => item.values);
                    labels = userData.map(item => item.label);
                } else if (userData.length > 0 && typeof userData[0] === 'object' && userData[0].label !== undefined && userData[0].value !== undefined) {
                    // 对象数组格式 [{label: 'A', value: 10}, ...]，将数据分为3组
                    const values = userData.map(item => item.value);
                    const chunkSize = Math.ceil(values.length / 3);
                    for (let i = 0; i < 3; i++) {
                        const start = i * chunkSize;
                        const end = Math.min(start + chunkSize, values.length);
                        if (start < values.length) {
                            categoryData.push(values.slice(start, end));
                        }
                    }
                    labels = userData.map(item => item.label).slice(0, categoryData.length);
                } else if (userData.length > 0 && typeof userData[0] === 'number') {
                    // 一维数值数组，平均分配到3个类别中
                    const chunkSize = Math.ceil(userData.length / 3);
                    for (let i = 0; i < 3; i++) {
                        const start = i * chunkSize;
                        const end = Math.min(start + chunkSize, userData.length);
                        categoryData.push(userData.slice(start, end));
                    }
                    labels = ['数据组1', '数据组2', '数据组3'];
                }
            }
        }
        
        // 如果没有用户数据或用户数据无效，则使用默认数据
        if (categoryData.length === 0) {
            // 创建更真实的箱型图数据，模拟Python seaborn风格
            const categoryA = [75, 80, 85, 90, 95, 100, 105, 110, 115, 120, 125, 130];
            const categoryB = [60, 65, 70, 75, 80, 85, 90, 95, 100, 105, 110, 115];
            const categoryC = [50, 55, 60, 65, 70, 75, 80, 85, 90, 95, 100, 105];
            categoryData = [categoryA, categoryB, categoryC];
        }
        
        // 使用专门的小提琴图类创建图表
        const violinChart = new window.ViolinChart(this);
        this.currentChart = violinChart.createChart(ctx, categoryData, labels);
        window.currentChart = this.currentChart;
    }

    // 创建热力图
    createHeatMap(ctx) {
        // 获取用户数据
        let heatmapData = [];
        let labelsX = [];
        let labelsY = [];
        let size = 10;
        
        // 如果有处理后的用户数据，则使用用户数据
        if (window.dataProcessor && window.dataProcessor.getData()) {
            const userData = window.dataProcessor.getData();
            if (Array.isArray(userData)) {
                if (userData.length > 0 && Array.isArray(userData[0])) {
                    // 二维数组格式 [[1,2,3], [4,5,6], [7,8,9]]
                    heatmapData = userData;
                    size = Math.max(userData.length, Math.max(...userData.map(row => row.length)));
                } else if (userData.length > 0 && typeof userData[0] === 'object' && userData[0].x !== undefined && userData[0].y !== undefined && userData[0].v !== undefined) {
                    // 对象数组格式 [{x: 0, y: 0, v: 0.5}, ...]
                    const maxX = Math.max(...userData.map(p => p.x)) + 1;
                    const maxY = Math.max(...userData.map(p => p.y)) + 1;
                    size = Math.max(maxX, maxY);
                    
                    // 初始化热力图数据
                    heatmapData = Array(size).fill().map(() => Array(size).fill(0));
                    
                    // 填充数据
                    userData.forEach(point => {
                        if (point.x < size && point.y < size) {
                            heatmapData[point.x][point.y] = point.v;
                        }
                    });
                }
            } else if (userData && typeof userData === 'object') {
                // 如果是矩阵对象
                const keys = Object.keys(userData);
                if (keys.length > 0 && Array.isArray(userData[keys[0]])) {
                    heatmapData = Object.values(userData);
                    size = Math.max(heatmapData.length, Math.max(...heatmapData.map(row => row.length)));
                }
            }
        }
        
        // 如果没有用户数据或用户数据无效，则使用默认数据
        if (heatmapData.length === 0) {
            // 创建更真实的热力图数据，模拟Python seaborn风格
            // 生成坐标标签
            for (let i = 0; i < size; i++) {
                labelsX.push(`列${i+1}`);
                labelsY.push(`行${i+1}`);
            }
            
            // 生成热力图数据
            heatmapData = Array(size).fill().map(() => Array(size).fill(0));
            for (let i = 0; i < size; i++) {
                for (let j = 0; j < size; j++) {
                    heatmapData[i][j] = Math.random() * 100;
                }
            }
        } else {
            // 生成坐标标签
            const rows = heatmapData.length;
            const cols = Math.max(...heatmapData.map(row => row.length));
            for (let i = 0; i < rows; i++) {
                labelsY.push(`行${i+1}`);
            }
            for (let j = 0; j < cols; j++) {
                labelsX.push(`列${j+1}`);
            }
        }
        
        // 准备热力图数据
        const chartData = [];
        for (let i = 0; i < heatmapData.length; i++) {
            for (let j = 0; j < heatmapData[i].length; j++) {
                chartData.push({
                    x: labelsX[j],
                    y: labelsY[i],
                    v: heatmapData[i][j]
                });
            }
        }
        
        // 获取颜色函数
        const getColorForValue = (value) => {
            // 创建一个简单的颜色映射（从蓝到红）
            const min = Math.min(...chartData.map(d => d.v));
            const max = Math.max(...chartData.map(d => d.v));
            const ratio = (value - min) / (max - min);
            
            // 从蓝到红的渐变
            const r = Math.floor(255 * ratio);
            const g = Math.floor(100 * (1 - Math.abs(ratio - 0.5) * 2));
            const b = Math.floor(255 * (1 - ratio));
            
            return `rgba(${r}, ${g}, ${b}, ${this.currentTransparency})`;
        };
        
        this.currentChart = new Chart(ctx, {
            type: 'matrix',
            data: {
                datasets: [{
                    label: '热力图数据',
                    data: chartData,
                    backgroundColor: chartData.map(point => getColorForValue(point.v)),
                    borderColor: 'rgba(255, 255, 255, 0.1)',
                    borderWidth: 1,
                    borderRadius: 2,
                    hoverBackgroundColor: chartData.map(point => getColorForValue(point.v)),
                    hoverBorderColor: 'rgba(0, 0, 0, 0.5)',
                    hoverBorderWidth: 2
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    x: {
                        type: 'category',
                        labels: labelsX,
                        title: {
                            display: !!this.chartSettings.xAxisLabel,
                            text: this.chartSettings.xAxisLabel,
                            font: {
                                size: 14,
                                weight: 'bold'
                            }
                        },
                        grid: {
                            display: false
                        },
                        ticks: {
                            font: {
                                size: 11
                            }
                        }
                    },
                    y: {
                        type: 'category',
                        labels: labelsY,
                        title: {
                            display: !!this.chartSettings.yAxisLabel,
                            text: this.chartSettings.yAxisLabel,
                            font: {
                                size: 14,
                                weight: 'bold'
                            }
                        },
                        grid: {
                            display: false
                        },
                        ticks: {
                            font: {
                                size: 11
                            }
                        }
                    }
                },
                plugins: {
                    title: {
                        display: true,
                        text: this.chartSettings.title || '热力图',
                        font: {
                            size: 16,
                            weight: 'bold'
                        }
                    },
                    legend: {
                        display: false
                    },
                    tooltip: {
                        backgroundColor: 'rgba(0, 0, 0, 0.8)',
                        titleFont: {
                            size: 14
                        },
                        bodyFont: {
                            size: 12
                        },
                        callbacks: {
                            title: function(context) {
                                return `坐标: (${context[0].label}, ${context[0].dataset.data[context[0].dataIndex].y})`;
                            },
                            label: function(context) {
                                return `值: ${context.dataset.data[context.dataIndex].v.toFixed(2)}`;
                            }
                        }
                    }
                }
            }
        });
        
        // 存储原始颜色
        this.originalColors[0] = {
            backgroundColor: chartData.map(point => getColorForValue(point.v))
        };
        
        window.currentChart = this.currentChart;
    }

    // 创建雷达图
    createRadarChart(ctx) {
        // 获取用户数据
        let labels = ['维度A', '维度B', '维度C', '维度D', '维度E'];
        let categoryData = [];
        
        // 如果有处理后的用户数据，则使用用户数据
        if (window.dataProcessor && window.dataProcessor.getData()) {
            const userData = window.dataProcessor.getData();
            if (Array.isArray(userData)) {
                if (userData.length > 0 && Array.isArray(userData[0])) {
                    // 二维数组格式 [[1,2,3], [4,5,6], [7,8,9]]
                    categoryData = userData;
                    labels = userData.map((_, index) => `类别${String.fromCharCode(65 + index)}`);
                } else if (userData.length > 0 && typeof userData[0] === 'object' && userData[0].label !== undefined && Array.isArray(userData[0].values)) {
                    // 对象数组格式 [{label: 'A', values: [1,2,3]}, ...]
                    categoryData = userData.map(item => item.values);
                    labels = userData.map(item => item.label);
                } else if (userData.length > 0 && typeof userData[0] === 'object' && userData[0].label !== undefined && userData[0].value !== undefined) {
                    // 对象数组格式 [{label: 'A', value: 10}, ...]，将数据分为几组
                    const values = userData.map(item => item.value);
                    const chunkSize = Math.min(5, Math.ceil(values.length / 3));
                    for (let i = 0; i < 3; i++) {
                        const start = i * chunkSize;
                        const end = Math.min(start + chunkSize, values.length);
                        if (start < values.length) {
                            categoryData.push(values.slice(start, end));
                        }
                    }
                    labels = userData.map(item => item.label).slice(0, categoryData.length);
                } else if (userData.length > 0 && typeof userData[0] === 'number') {
                    // 一维数值数组，分为几组
                    const chunkSize = Math.min(5, Math.ceil(userData.length / 3));
                    for (let i = 0; i < 3; i++) {
                        const start = i * chunkSize;
                        const end = Math.min(start + chunkSize, userData.length);
                        categoryData.push(userData.slice(start, end));
                    }
                    labels = ['数据组1', '数据组2', '数据组3'];
                }
            }
        }
        
        // 如果没有用户数据或用户数据无效，则使用默认数据
        if (categoryData.length === 0) {
            // 创建默认雷达图数据
            const dataA = [65, 59, 90, 81, 56];
            const dataB = [28, 48, 40, 19, 96];
            const dataC = [52, 35, 70, 65, 45];
            categoryData = [dataA, dataB, dataC];
        }
        
        // 使用专门的雷达图类创建图表
        const radarChart = new window.RadarChart(this);
        this.currentChart = radarChart.createChart(ctx, categoryData, labels);
        window.currentChart = this.currentChart;
    }

    // 创建面积图
    createAreaChart(ctx) {
        // 获取用户数据
        let labels = ['点A', '点B', '点C', '点D', '点E', '点F'];
        let categoryData = [];
        let xLabels = null;
        
        // 如果有处理后的用户数据，则使用用户数据
        if (window.dataProcessor && window.dataProcessor.getData()) {
            const userData = window.dataProcessor.getData();
            if (Array.isArray(userData)) {
                if (userData.length > 0 && Array.isArray(userData[0])) {
                    // 二维数组格式 [[1,2,3], [4,5,6], [7,8,9]]
                    categoryData = userData;
                    labels = userData.map((_, index) => `系列${index + 1}`);
                    xLabels = userData[0].map((_, index) => `点${index + 1}`);
                } else if (userData.length > 0 && typeof userData[0] === 'object' && userData[0].label !== undefined && Array.isArray(userData[0].values)) {
                    // 对象数组格式 [{label: 'A', values: [1,2,3]}, ...]
                    categoryData = userData.map(item => item.values);
                    labels = userData.map(item => item.label);
                    if (userData[0].values.length > 0) {
                        xLabels = userData[0].values.map((_, index) => `点${index + 1}`);
                    }
                } else if (userData.length > 0 && typeof userData[0] === 'object' && userData[0].label !== undefined && userData[0].value !== undefined) {
                    // 对象数组格式 [{label: 'A', value: 10}, ...]，将数据分为几组
                    const values = userData.map(item => item.value);
                    const chunkSize = Math.min(6, Math.ceil(values.length / 3));
                    for (let i = 0; i < 3; i++) {
                        const start = i * chunkSize;
                        const end = Math.min(start + chunkSize, values.length);
                        if (start < values.length) {
                            categoryData.push(values.slice(start, end));
                        }
                    }
                    labels = userData.map(item => item.label).slice(0, categoryData.length);
                    xLabels = categoryData[0] ? categoryData[0].map((_, index) => `点${index + 1}`) : null;
                } else if (userData.length > 0 && typeof userData[0] === 'number') {
                    // 一维数值数组，分为几组
                    const chunkSize = Math.min(6, Math.ceil(userData.length / 3));
                    for (let i = 0; i < 3; i++) {
                        const start = i * chunkSize;
                        const end = Math.min(start + chunkSize, userData.length);
                        categoryData.push(userData.slice(start, end));
                    }
                    labels = ['数据组1', '数据组2', '数据组3'];
                    xLabels = categoryData[0] ? categoryData[0].map((_, index) => `点${index + 1}`) : null;
                }
            }
        }
        
        // 如果没有用户数据或用户数据无效，则使用默认数据
        if (categoryData.length === 0) {
            // 创建默认面积图数据
            const dataA = [12, 19, 3, 5, 2, 3];
            const dataB = [2, 3, 20, 12, 13, 10];
            const dataC = [5, 15, 10, 8, 14, 12];
            categoryData = [dataA, dataB, dataC];
        }
        
        // 使用专门的面积图类创建图表
        const areaChart = new window.AreaChart(this);
        this.currentChart = areaChart.createChart(ctx, categoryData, labels, xLabels);
        window.currentChart = this.currentChart;
    }
}

// 导出图表管理器
window.ChartManager = ChartManager;