// 雷达图功能模块
class RadarChart {
    constructor(chartManager) {
        this.chartManager = chartManager;
    }

    // 创建雷达图
    createChart(ctx, categoryData, labels) {
        // 准备图表数据
        const datasets = categoryData.map((data, index) => {
            const colors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#feca57', '#ff9ff3', '#54a0ff', '#5f27cd', '#00d2d3', '#ff9f43'];
            const colorIndex = index % colors.length;
            const color = colors[colorIndex];
            
            return {
                label: labels[index] || `数据集 ${index + 1}`,
                data: data,
                borderColor: this.chartManager.addAlphaToColor(color, this.chartManager.currentTransparency),
                backgroundColor: this.chartManager.addAlphaToColor(color, this.chartManager.currentTransparency * 0.2),
                pointBackgroundColor: this.chartManager.addAlphaToColor(color, this.chartManager.currentTransparency),
                pointBorderColor: '#fff',
                pointHoverBackgroundColor: '#fff',
                pointHoverBorderColor: this.chartManager.addAlphaToColor(color, this.chartManager.currentTransparency),
                pointRadius: 4,
                pointHoverRadius: 6,
                borderWidth: 2,
                fill: true
            };
        });

        // 创建雷达图
        const chart = new Chart(ctx, {
            type: 'radar',
            data: {
                labels: this.generateRadarLabels(categoryData),
                datasets: datasets
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    r: {
                        angleLines: {
                            color: 'rgba(0, 0, 0, 0.1)'
                        },
                        grid: {
                            color: 'rgba(0, 0, 0, 0.1)'
                        },
                        pointLabels: {
                            font: {
                                size: 12
                            }
                        },
                        ticks: {
                            backdropColor: 'transparent',
                            font: {
                                size: 10
                            },
                            stepSize: this.calculateStepSize(categoryData)
                        }
                    }
                },
                plugins: {
                    title: {
                        display: true,
                        text: this.chartManager.chartSettings.title || '雷达图',
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
    
    // 生成雷达图标签
    generateRadarLabels(categoryData) {
        if (categoryData.length > 0) {
            return categoryData[0].map((_, index) => `维度 ${index + 1}`);
        }
        return [];
    }
    
    // 计算步长
    calculateStepSize(categoryData) {
        if (categoryData.length === 0) return 10;
        
        let max = -Infinity;
        let min = Infinity;
        
        categoryData.forEach(data => {
            data.forEach(value => {
                if (value > max) max = value;
                if (value < min) min = value;
            });
        });
        
        const range = max - min;
        return Math.ceil(range / 5);
    }
}

// 导出雷达图类
window.RadarChart = RadarChart;