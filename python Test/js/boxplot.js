// 自定义箱线图插件
class BoxPlotChart {
    constructor(chartManager) {
        this.chartManager = chartManager;
    }

    // 创建箱线图
    createChart(ctx, categoryData, labels) {
        // 计算每个类别的统计信息（最小值、Q1、中位数、Q3、最大值）
        const calculateStats = (data) => {
            if (data.length === 0) return { min: 0, q1: 0, median: 0, q3: 0, max: 0, outliers: [] };
            
            const sorted = [...data].sort((a, b) => a - b);
            const n = sorted.length;
            
            // 计算百分位数的函数
            const percentile = (p) => {
                const index = (n - 1) * p;
                const lower = Math.floor(index);
                const upper = lower + 1;
                const weight = index % 1;
                
                if (upper >= n) return sorted[lower];
                return sorted[lower] * (1 - weight) + sorted[upper] * weight;
            };
            
            const min = sorted[0];
            const max = sorted[n - 1];
            const median = percentile(0.5);
            const q1 = percentile(0.25);
            const q3 = percentile(0.75);
            
            // 计算四分位距和异常值
            const iqr = q3 - q1;
            const lowerFence = q1 - 1.5 * iqr;
            const upperFence = q3 + 1.5 * iqr;
            
            // 过滤出异常值
            const outliers = sorted.filter(value => value < lowerFence || value > upperFence);
            
            return { min, q1, median, q3, max, outliers };
        };
        
        const stats = categoryData.map(data => calculateStats(data));
        
        // 构建箱型图数据集
        const boxplotData = stats.map((s, index) => {
            return {
                label: labels[index],
                min: s.min,
                max: s.max,
                q1: s.q1,
                q3: s.q3,
                median: s.median,
                outliers: s.outliers
            };
        });
        
        // 使用更接近seaborn的颜色方案
        const colors = [
            this.chartManager.addAlphaToColor('#a1c9f4', this.chartManager.currentTransparency),  // 蓝色
            this.chartManager.addAlphaToColor('#8de5a1', this.chartManager.currentTransparency),  // 绿色
            this.chartManager.addAlphaToColor('#ff9f9b', this.chartManager.currentTransparency),  // 红色
            this.chartManager.addAlphaToColor('#d0bbff', this.chartManager.currentTransparency),  // 紫色
            this.chartManager.addAlphaToColor('#fffea3', this.chartManager.currentTransparency)   // 黄色
        ];
        
        const borderColors = [
            this.chartManager.addAlphaToColor('#4c72b0', this.chartManager.currentTransparency),  // 深蓝
            this.chartManager.addAlphaToColor('#55a868', this.chartManager.currentTransparency),  // 深绿
            this.chartManager.addAlphaToColor('#c44e52', this.chartManager.currentTransparency),  // 深红
            this.chartManager.addAlphaToColor('#8172b2', this.chartManager.currentTransparency),  // 深紫
            this.chartManager.addAlphaToColor('#ccb974', this.chartManager.currentTransparency)   // 深黄
        ];

        // 创建真正的箱线图
        const chart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [
                    {
                        label: '最小值到下四分位数',
                        data: boxplotData.map(b => b.q1 - b.min),
                        backgroundColor: colors[0],
                        borderColor: borderColors[0],
                        borderWidth: 1,
                        categoryPercentage: 0.5,
                        barPercentage: 0.8,
                        order: 3
                    },
                    {
                        label: '下四分位数到中位数',
                        data: boxplotData.map(b => b.median - b.q1),
                        backgroundColor: colors[1],
                        borderColor: borderColors[1],
                        borderWidth: 1,
                        categoryPercentage: 0.5,
                        barPercentage: 0.8,
                        order: 2
                    },
                    {
                        label: '中位数到上四分位数',
                        data: boxplotData.map(b => b.q3 - b.median),
                        backgroundColor: colors[2],
                        borderColor: borderColors[2],
                        borderWidth: 1,
                        categoryPercentage: 0.5,
                        barPercentage: 0.8,
                        order: 1
                    },
                    {
                        label: '上四分位数到最大值',
                        data: boxplotData.map(b => b.max - b.q3),
                        backgroundColor: colors[3],
                        borderColor: borderColors[3],
                        borderWidth: 1,
                        categoryPercentage: 0.5,
                        barPercentage: 0.8,
                        order: 0
                    }
                ]
            },
            options: {
                indexAxis: 'y',
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    x: {
                        beginAtZero: false,
                        title: {
                            display: !!this.chartManager.chartSettings.xAxisLabel,
                            text: this.chartManager.chartSettings.xAxisLabel,
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
                            },
                            callback: function(value) {
                                return value;
                            }
                        }
                    },
                    y: {
                        title: {
                            display: !!this.chartManager.chartSettings.yAxisLabel,
                            text: this.chartManager.chartSettings.yAxisLabel,
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
                        text: this.chartManager.chartSettings.title || '箱线图',
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
                                const index = context.dataIndex;
                                const box = boxplotData[index];
                                switch(context.datasetIndex) {
                                    case 0: // 最小值到Q1
                                        return `最小值: ${box.min.toFixed(2)}, Q1: ${box.q1.toFixed(2)}`;
                                    case 1: // Q1到中位数
                                        return `Q1: ${box.q1.toFixed(2)}, 中位数: ${box.median.toFixed(2)}`;
                                    case 2: // 中位数到Q3
                                        return `中位数: ${box.median.toFixed(2)}, Q3: ${box.q3.toFixed(2)}`;
                                    case 3: // Q3到最大值
                                        return `Q3: ${box.q3.toFixed(2)}, 最大值: ${box.max.toFixed(2)}`;
                                    default:
                                        return '';
                                }
                            }
                        }
                    }
                }
            }
        });
        
        return chart;
    }
}

// 导出自定义箱线图类
window.BoxPlotChart = BoxPlotChart;