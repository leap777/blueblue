// 小提琴图功能模块
class ViolinChart {
    constructor(chartManager) {
        this.chartManager = chartManager;
    }

    // 创建真正的小提琴图（使用Chart.js的线图模拟小提琴形状）
    createChart(ctx, categoryData, labels) {
        // 计算每个类别的密度数据以绘制小提琴形状
        const violinData = this.calculateViolinData(categoryData, labels);
        
        // 准备图表数据
        const datasets = violinData.map((data, index) => {
            const colors = ['#a1c9f4', '#8de5a1', '#ff9f9b', '#d0bbff', '#fffea3'];
            const borderColors = ['#4c72b0', '#55a868', '#c44e52', '#8172b2', '#ccb974'];
            const colorIndex = index % colors.length;
            
            return {
                label: labels[index],
                data: data.points,
                borderColor: this.chartManager.addAlphaToColor(borderColors[colorIndex], this.chartManager.currentTransparency),
                backgroundColor: this.chartManager.addAlphaToColor(colors[colorIndex], this.chartManager.currentTransparency * 0.3),
                borderWidth: 2,
                pointRadius: 0,
                fill: true,
                tension: 0.4
            };
        });
        
        // 创建图表
        const chart = new Chart(ctx, {
            type: 'line',
            data: {
                datasets: datasets
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        type: 'linear',
                        beginAtZero: false,
                        title: {
                            display: !!this.chartManager.chartSettings.yAxisLabel,
                            text: this.chartManager.chartSettings.yAxisLabel,
                            font: {
                                size: 14,
                                weight: 'bold'
                            }
                        },
                        grid: {
                            color: 'rgba(0, 0, 0, 0.05)'
                        },
                        ticks: {
                            font: {
                                size: 11
                            }
                        }
                    },
                    x: {
                        type: 'category',
                        labels: labels,
                        title: {
                            display: !!this.chartManager.chartSettings.xAxisLabel,
                            text: this.chartManager.chartSettings.xAxisLabel,
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
                        text: this.chartManager.chartSettings.title || '小提琴图',
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
                }
            }
        });
        
        return chart;
    }
    
    // 计算小提琴图数据（密度估计）
    calculateViolinData(categoryData, labels) {
        return categoryData.map((data, index) => {
            if (data.length === 0) {
                return { points: [] };
            }
            
            // 对数据进行排序
            const sortedData = [...data].sort((a, b) => a - b);
            const min = sortedData[0];
            const max = sortedData[sortedData.length - 1];
            
            // 计算核密度估计
            const points = this.kernelDensityEstimation(sortedData, min, max);
            
            // 构造小提琴形状数据点
            const violinPoints = [];
            
            // 从顶部到底部绘制右侧边缘
            for (let i = 0; i < points.length; i++) {
                violinPoints.push({
                    x: labels[index],
                    y: points[i].value
                });
            }
            
            // 从底部到顶部绘制左侧边缘（镜像）
            for (let i = points.length - 1; i >= 0; i--) {
                violinPoints.push({
                    x: labels[index],
                    y: points[i].value
                });
            }
            
            // 闭合路径
            if (points.length > 0) {
                violinPoints.push({
                    x: labels[index],
                    y: points[0].value
                });
            }
            
            return { points: violinPoints };
        });
    }
    
    // 核密度估计算法
    kernelDensityEstimation(data, min, max, bandwidth = null) {
        if (data.length === 0) return [];
        
        // 如果未指定带宽，则使用默认值
        if (bandwidth === null) {
            // 使用Silverman规则计算带宽
            const n = data.length;
            const sigma = this.standardDeviation(data);
            bandwidth = Math.pow(4 * Math.pow(sigma, 5) / (3 * n), 0.2);
        }
        
        // 生成评估点
        const range = max - min;
        const extension = range * 0.1; // 扩展10%以显示尾部
        const start = min - extension;
        const end = max + extension;
        const steps = 50;
        const stepSize = (end - start) / steps;
        
        const densityPoints = [];
        for (let i = 0; i <= steps; i++) {
            const x = start + i * stepSize;
            const density = this.gaussianKernelDensity(data, x, bandwidth);
            densityPoints.push({
                value: x,
                density: density
            });
        }
        
        return densityPoints;
    }
    
    // 高斯核密度计算
    gaussianKernelDensity(data, x, bandwidth) {
        if (data.length === 0 || bandwidth <= 0) return 0;
        
        let sum = 0;
        for (const point of data) {
            const diff = (x - point) / bandwidth;
            sum += Math.exp(-0.5 * diff * diff) / (Math.sqrt(2 * Math.PI) * bandwidth);
        }
        
        return sum / data.length;
    }
    
    // 计算标准差
    standardDeviation(data) {
        const mean = data.reduce((sum, value) => sum + value, 0) / data.length;
        const squaredDiffs = data.map(value => Math.pow(value - mean, 2));
        const avgSquaredDiff = squaredDiffs.reduce((sum, value) => sum + value, 0) / data.length;
        return Math.sqrt(avgSquaredDiff);
    }
}

// 导出小提琴图类
window.ViolinChart = ViolinChart;