// 面积图功能模块
class AreaChart {
    constructor(chartManager) {
        this.chartManager = chartManager;
    }

    // 创建面积图
    createChart(ctx, categoryData, labels, xLabels = null) {
        // 准备图表数据
        const datasets = categoryData.map((data, index) => {
            const colors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#feca57', '#ff9ff3', '#54a0ff', '#5f27cd', '#00d2d3', '#ff9f43'];
            const colorIndex = index % colors.length;
            const color = colors[colorIndex];
            
            return {
                label: labels[index] || `数据集 ${index + 1}`,
                data: data,
                borderColor: this.chartManager.addAlphaToColor(color, this.chartManager.currentTransparency),
                backgroundColor: this.chartManager.addAlphaToColor(color, this.chartManager.currentTransparency * 0.3),
                pointBackgroundColor: this.chartManager.addAlphaToColor(color, this.chartManager.currentTransparency),
                pointBorderColor: '#fff',
                pointHoverBackgroundColor: '#fff',
                pointHoverBorderColor: this.chartManager.addAlphaToColor(color, this.chartManager.currentTransparency),
                pointRadius: 3,
                pointHoverRadius: 6,
                borderWidth: 2,
                fill: true,
                tension: 0.4
            };
        });

        // 创建面积图
        const chart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: xLabels || this.generateAreaLabels(categoryData),
                datasets: datasets
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
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
                        text: this.chartManager.chartSettings.title || '面积图',
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
    
    // 生成面积图标签
    generateAreaLabels(categoryData) {
        if (categoryData.length > 0) {
            return categoryData[0].map((_, index) => `点 ${index + 1}`);
        }
        return [];
    }
}

// 导出面积图类
window.AreaChart = AreaChart;