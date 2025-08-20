// UI交互功能模块
class UIManager {
    constructor() {
        this.currentColor = '#ff6b6b';
        this.initEventListeners();
    }

    initEventListeners() {
        // 等待DOM加载完成后再绑定事件
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => {
                this.initOtherEventListeners();
                // 为颜色选项和图表类型绑定事件
                this.bindColorSelectionEvents();
                this.bindChartTypeSelectionEvents();
                // 为图表设置模块绑定事件
                this.bindChartSettingsEvents();
                // 为文件菜单绑定事件
                this.bindFileMenuEvents();
            });
        } else {
            this.initOtherEventListeners();
            // 为颜色选项和图表类型绑定事件
            this.bindColorSelectionEvents();
            this.bindChartTypeSelectionEvents();
            // 为图表设置模块绑定事件
            this.bindChartSettingsEvents();
            // 为文件菜单绑定事件
            this.bindFileMenuEvents();
        }
    }

    initOtherEventListeners() {
        // 透明度控制事件
        const transparencyControl = document.getElementById('transparency');
        if (transparencyControl) {
            transparencyControl.addEventListener('input', (e) => {
                console.log('透明度调整:', e.target.value);
                // 实时更新图表透明度
                if (window.chartManager) {
                    window.chartManager.setTransparency(e.target.value);
                }
            });
        }
        
        // 文件菜单事件
        this.bindFileMenuEvents();
        
        // 数据处理按钮事件
        const processDataBtn = document.getElementById('process-data');
        if (processDataBtn) {
            processDataBtn.addEventListener('click', () => {
                if (window.dataProcessor) {
                    const data = window.dataProcessor.processData();
                    if (data) {
                        // 数据处理完成后自动应用图表
                        if (window.chartManager) {
                            window.chartManager.applyChart();
                        }
                    }
                }
            });
        }
        
        // 应用图表按钮事件
        const applyChartBtn = document.getElementById('apply-chart');
        if (applyChartBtn) {
            applyChartBtn.addEventListener('click', () => {
                console.log('点击了应用图表按钮');
                if (window.chartManager) {
                    window.chartManager.applyChart();
                } else {
                    console.error('图表管理器未找到');
                }
            });
        }
        
        // 发送数据按钮事件
        const sendDataBtn = document.getElementById('send-data');
        if (sendDataBtn) {
            sendDataBtn.addEventListener('click', () => {
                console.log('点击了发送数据按钮');
                if (window.dataProcessor) {
                    const data = window.dataProcessor.processData();
                    console.log('处理后的数据:', data);
                    if (data) {
                        this.sendData(data);
                    }
                } else {
                    console.error('数据处理器未找到');
                }
            });
        }
    }

    // 绑定文件菜单事件
    bindFileMenuEvents() {
        console.log('尝试绑定文件菜单事件');
        
        // 定义菜单项配置
        const menuItems = [
            { id: 'new-file', handler: () => this.newFile(), log: '点击了新建文件' },
            { id: 'open-file', handler: () => this.openFile(), log: '点击了打开文件' },
            { id: 'save-file', handler: () => this.saveFile(), log: '点击了保存文件' },
            { id: 'save-as', handler: () => this.saveAs(), log: '点击了另存为' },
            { id: 'link-local', handler: () => this.linkLocal(), log: '点击了链接本地' }
        ];
        
        // 为每个菜单项绑定事件
        menuItems.forEach(item => {
            const element = document.getElementById(item.id);
            if (element) {
                // 添加防抖处理
                element.addEventListener('click', this.debounce((e) => {
                    e.preventDefault();
                    console.log(item.log);
                    item.handler();
                }));
            } else {
                console.warn(`未找到文件菜单项: ${item.id}`);
            }
        });
    }

    // 绑定地图菜单事件
    bindMapMenuEvents() {
        const mapMenu = document.getElementById('map-menu');
        if (!mapMenu) return;

        // 获取所有地图选项
        const mapOptions = mapMenu.querySelectorAll('.dropdown-content a');
        mapOptions.forEach(option => {
            option.addEventListener('click', (e) => {
                e.preventDefault();
                const mapType = e.target.getAttribute('data-map');
                this.showMap(mapType);
            });
        });
    }

    // 显示地图
    showMap(mapType) {
        const modal = document.getElementById('map-modal');
        const mapContainer = document.getElementById('map-container');
        const mapTitle = document.getElementById('map-title');
        const mapInfo = document.getElementById('map-info');

        // 设置地图标题
        switch(mapType) {
            case 'china':
                mapTitle.textContent = '中国地图';
                break;
            case 'provinces':
                mapTitle.textContent = '中国各省地图';
                break;
            case 'world':
                mapTitle.textContent = '世界地图';
                break;
        }

        // 清空容器
        mapContainer.innerHTML = '';

        // 创建地图元素
        const mapElement = document.createElement('div');
        mapElement.className = 'map-element';
        mapElement.style.width = '100%';
        mapElement.style.height = '500px';
        mapElement.style.background = '#000';
        mapElement.style.position = 'relative';

        // 根据地图类型添加相应的内容
        switch(mapType) {
            case 'china':
                mapElement.innerHTML = `
                    <svg width="100%" height="100%" viewBox="0 0 800 600" xmlns="http://www.w3.org/2000/svg">
                        <rect width="800" height="600" fill="#000"/>
                        <path d="M100,100 L200,150 L300,120 L400,180 L500,160 L600,200 L700,180 L750,250 L700,300 L600,320 L500,300 L400,350 L300,320 L200,300 L100,350 Z" fill="#fff" stroke="#ccc" stroke-width="1"/>
                        <text x="150" y="120" font-size="12" fill="#fff">北京</text>
                        <text x="250" y="170" font-size="12" fill="#fff">上海</text>
                        <text x="350" y="140" font-size="12" fill="#fff">广州</text>
                        <text x="450" y="190" font-size="12" fill="#fff">深圳</text>
                        <text x="550" y="170" font-size="12" fill="#fff">杭州</text>
                        <text x="650" y="220" font-size="12" fill="#fff">成都</text>
                        <text x="720" y="270" font-size="12" fill="#fff">重庆</text>
                        <text x="680" y="320" font-size="12" fill="#fff">武汉</text>
                        <text x="580" y="310" font-size="12" fill="#fff">长沙</text>
                        <text x="480" y="360" font-size="12" fill="#fff">西安</text>
                        <text x="380" y="330" font-size="12" fill="#fff">郑州</text>
                        <text x="280" y="310" font-size="12" fill="#fff">济南</text>
                        <text x="180" y="360" font-size="12" fill="#fff">青岛</text>
                    </svg>
                `;
                break;
            case 'provinces':
                mapElement.innerHTML = `
                    <svg width="100%" height="100%" viewBox="0 0 800 600" xmlns="http://www.w3.org/2000/svg">
                        <rect width="800" height="600" fill="#000"/>
                        <path d="M100,100 L150,120 L200,110 L250,130 L300,120 L350,140 L400,130 L450,150 L500,140 L550,160 L600,150 L650,170 L700,160 L750,180 L720,200 L680,220 L640,210 L600,230 L560,220 L520,240 L480,230 L440,250 L400,240 L360,260 L320,250 L280,270 L240,260 L200,280 L160,270 L120,290 L100,280 Z" fill="#fff" stroke="#ccc" stroke-width="1"/>
                        <text x="120" y="120" font-size="12" fill="#fff">北京市</text>
                        <text x="180" y="140" font-size="12" fill="#fff">天津市</text>
                        <text x="240" y="130" font-size="12" fill="#fff">河北省</text>
                        <text x="300" y="150" font-size="12" fill="#fff">山西省</text>
                        <text x="360" y="140" font-size="12" fill="#fff">内蒙古自治区</text>
                        <text x="420" y="160" font-size="12" fill="#fff">辽宁省</text>
                        <text x="480" y="150" font-size="12" fill="#fff">吉林省</text>
                        <text x="540" y="170" font-size="12" fill="#fff">黑龙江省</text>
                        <text x="600" y="160" font-size="12" fill="#fff">江苏省</text>
                        <text x="660" y="180" font-size="12" fill="#fff">浙江省</text>
                        <text x="720" y="170" font-size="12" fill="#fff">安徽省</text>
                        <text x="700" y="200" font-size="12" fill="#fff">福建省</text>
                        <text x="660" y="220" font-size="12" fill="#fff">江西省</text>
                        <text x="620" y="240" font-size="12" fill="#fff">山东省</text>
                        <text x="580" y="260" font-size="12" fill="#fff">河南省</text>
                        <text x="540" y="280" font-size="12" fill="#fff">湖北省</text>
                        <text x="500" y="300" font-size="12" fill="#fff">湖南省</text>
                        <text x="460" y="320" font-size="12" fill="#fff">广东省</text>
                        <text x="420" y="340" font-size="12" fill="#fff">广西壮族自治区</text>
                        <text x="380" y="360" font-size="12" fill="#fff">海南省</text>
                        <text x="340" y="380" font-size="12" fill="#fff">重庆市</text>
                        <text x="300" y="400" font-size="12" fill="#fff">四川省</text>
                        <text x="260" y="420" font-size="12" fill="#fff">贵州省</text>
                        <text x="220" y="440" font-size="12" fill="#fff">云南省</text>
                        <text x="180" y="460" font-size="12" fill="#fff">西藏自治区</text>
                        <text x="140" y="480" font-size="12" fill="#fff">陕西省</text>
                        <text x="100" y="500" font-size="12" fill="#fff">甘肃省</text>
                        <text x="60" y="520" font-size="12" fill="#fff">青海省</text>
                        <text x="20" y="540" font-size="12" fill="#fff">宁夏回族自治区</text>
                        <text x="40" y="560" font-size="12" fill="#fff">新疆维吾尔自治区</text>
                    </svg>
                `;
                break;
            case 'world':
                mapElement.innerHTML = `
                    <svg width="100%" height="100%" viewBox="0 0 800 600" xmlns="http://www.w3.org/2000/svg">
                        <rect width="800" height="600" fill="#000"/>
                        <path d="M100,100 L150,120 L200,110 L250,130 L300,120 L350,140 L400,130 L450,150 L500,140 L550,160 L600,150 L650,170 L700,160 L750,180 L720,200 L680,220 L640,210 L600,230 L560,220 L520,240 L480,230 L440,250 L400,240 L360,260 L320,250 L280,270 L240,260 L200,280 L160,270 L120,290 L100,280 Z" fill="#fff" stroke="#ccc" stroke-width="1"/>
                        <text x="120" y="120" font-size="12" fill="#fff">美国</text>
                        <text x="180" y="140" font-size="12" fill="#fff">加拿大</text>
                        <text x="240" y="130" font-size="12" fill="#fff">墨西哥</text>
                        <text x="300" y="150" font-size="12" fill="#fff">巴西</text>
                        <text x="360" y="140" font-size="12" fill="#fff">阿根廷</text>
                        <text x="420" y="160" font-size="12" fill="#fff">智利</text>
                        <text x="480" y="150" font-size="12" fill="#fff">澳大利亚</text>
                        <text x="540" y="170" font-size="12" fill="#fff">新西兰</text>
                        <text x="600" y="160" font-size="12" fill="#fff">日本</text>
                        <text x="660" y="180" font-size="12" fill="#fff">韩国</text>
                        <text x="720" y="170" font-size="12" fill="#fff">中国</text>
                        <text x="700" y="200" font-size="12" fill="#fff">印度</text>
                        <text x="660" y="220" font-size="12" fill="#fff">巴基斯坦</text>
                        <text x="620" y="240" font-size="12" fill="#fff">伊朗</text>
                        <text x="580" y="260" font-size="12" fill="#fff">沙特阿拉伯</text>
                        <text x="540" y="280" font-size="12" fill="#fff">埃及</text>
                        <text x="500" y="300" font-size="12" fill="#fff">南非</text>
                        <text x="460" y="320" font-size="12" fill="#fff">法国</text>
                        <text x="420" y="340" font-size="12" fill="#fff">德国</text>
                        <text x="380" y="360" font-size="12" fill="#fff">意大利</text>
                        <text x="340" y="380" font-size="12" fill="#fff">西班牙</text>
                        <text x="300" y="400" font-size="12" fill="#fff">英国</text>
                        <text x="260" y="420" font-size="12" fill="#fff">俄罗斯</text>
                        <text x="220" y="440" font-size="12" fill="#fff">土耳其</text>
                        <text x="180" y="460" font-size="12" fill="#fff">希腊</text>
                        <text x="140" y="480" font-size="12" fill="#fff">波兰</text>
                        <text x="100" y="500" font-size="12" fill="#fff">捷克</text>
                        <text x="60" y="520" font-size="12" fill="#fff">匈牙利</text>
                        <text x="20" y="540" font-size="12" fill="#fff">奥地利</text>
                        <text x="40" y="560" font-size="12" fill="#fff">瑞士</text>
                    </svg>
                `;
                break;
        }

        // 添加交互事件
        mapElement.addEventListener('mouseover', (e) => {
            const target = e.target;
            if (target.tagName === 'text') {
                const textContent = target.textContent;
                mapInfo.innerHTML = `<p><strong>${textContent}</strong></p>`;
            }
        });

        mapElement.addEventListener('mouseout', () => {
            mapInfo.innerHTML = '<p>鼠标悬停查看详细信息</p>';
        });

        mapContainer.appendChild(mapElement);

        // 显示模态框
        modal.style.display = 'block';
    }

    // 关闭地图弹窗
    closeMapModal() {
        const modal = document.getElementById('map-modal');
        if (modal) {
            modal.style.display = 'none';
        }
    }

    // 初始化地图菜单事件
    initMapMenuEvents() {
        // 绑定地图菜单事件
        this.bindMapMenuEvents();
        
        // 绑定关闭按钮事件
        const closeBtn = document.querySelector('.close');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                this.closeMapModal();
            });
        }
        
        // 点击其他地方关闭模态框
        window.addEventListener('click', (e) => {
            const modal = document.getElementById('map-modal');
            if (e.target === modal) {
                this.closeMapModal();
            }
        });
    }

    // 防抖函数，防止快速重复点击
    debounce(func, delay = 300) {
        let timeout;
        return (...args) => {
            clearTimeout(timeout);
            timeout = setTimeout(() => func.apply(this, args), delay);
        };
    }

    // 新建文件功能
    newFile() {
        console.log('执行新建文件操作');
        
        // 清空数据输入区域
        const dataInput = document.getElementById('data-input');
        if (dataInput) {
            dataInput.value = '';
        }
        
        // 重置图表类型为默认（条形图）
        if (window.chartManager) {
            window.chartManager.setChartType('bar');
            
            // 更新图表类型选择UI
            const chartTypeItems = document.querySelectorAll('.chart-type');
            chartTypeItems.forEach((item, index) => {
                if (index === 0) {
                    item.classList.add('active');
                } else {
                    item.classList.remove('active');
                }
            });
            
            // 应用默认图表
            window.chartManager.applyChart();
        }
        
        // 显示消息
        this.showMessage('已新建文件', 'info');
    }

    // 打开文件功能
    openFile() {
        console.log('执行打开文件操作');
        
        // 创建隐藏的文件输入元素
        const fileInput = document.getElementById('file-input');
        if (!fileInput) {
            this.showMessage('文件选择功能不可用', 'error');
            return;
        }
        
        // 清除之前选择的文件
        fileInput.value = '';
        
        // 监听文件选择事件
        fileInput.onchange = (event) => {
            const file = event.target.files[0];
            if (file) {
                this.readFile(file);
            }
        };
        
        // 触发文件选择对话框
        fileInput.click();
    }

    // 读取文件内容
    readFile(file) {
        console.log('读取文件:', file.name);
        
        // 检查文件类型
        const allowedTypes = ['application/json', 'text/csv', 'text/plain', 'application/vnd.ms-excel', 
                             'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'];
        const allowedExtensions = ['.json', '.csv', '.txt', '.xls', '.xlsx'];
        const fileExtension = '.' + file.name.split('.').pop().toLowerCase();
        
        if (!allowedTypes.includes(file.type) && !allowedExtensions.includes(fileExtension)) {
            this.showMessage('不支持的文件类型。请上传JSON、CSV、TXT或Excel文件。', 'error');
            return;
        }
        
        // 检查文件大小（限制为1MB）
        if (file.size > 1024 * 1024) {
            this.showMessage('文件过大。请选择小于1MB的文件。', 'error');
            return;
        }
        
        // 读取文件内容
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const content = e.target.result;
                this.loadFileContent(content, file.name, file.type, fileExtension);
            } catch (error) {
                console.error('读取文件时出错:', error);
                this.showMessage('读取文件时出错: ' + error.message, 'error');
            }
        };
        
        reader.onerror = (e) => {
            console.error('文件读取失败:', e);
            this.showMessage('文件读取失败', 'error');
        };
        
        // 根据文件类型选择读取方式
        if (fileExtension === '.xlsx' || fileExtension === '.xls' || 
            file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
            file.type === 'application/vnd.ms-excel') {
            // Excel文件需要作为二进制数据读取
            reader.readAsBinaryString(file);
        } else {
            reader.readAsText(file, 'UTF-8');
        }
    }

    // 加载文件内容到数据输入区域
    loadFileContent(content, filename, filetype, fileExtension) {
        console.log('加载文件内容:', filename);
        
        const dataInput = document.getElementById('data-input');
        if (!dataInput) {
            this.showMessage('无法找到数据输入区域', 'error');
            return;
        }
        
        // 处理Excel文件
        if (fileExtension === '.xlsx' || fileExtension === '.xls' || 
            filetype === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
            filetype === 'application/vnd.ms-excel') {
            try {
                this.loadExcelFile(content, filename);
                return;
            } catch (e) {
                console.error('解析Excel文件时出错:', e);
                this.showMessage('解析Excel文件时出错: ' + e.message, 'error');
                return;
            }
        }
        
        // 尝试解析JSON文件
        if (filename.endsWith('.json')) {
            try {
                const jsonData = JSON.parse(content);
                // 格式化JSON数据以便显示
                dataInput.value = JSON.stringify(jsonData, null, 2);
            } catch (e) {
                // 如果JSON解析失败，则按普通文本处理
                dataInput.value = content;
            }
        } else {
            // 对于CSV和TXT文件，直接显示内容
            dataInput.value = content;
        }
        
        this.showMessage(`文件 "${filename}" 已加载`, 'success');
        
        // 自动处理数据并显示图表
        if (window.dataProcessor) {
            const data = window.dataProcessor.processData();
            if (data) {
                if (window.chartManager) {
                    window.chartManager.applyChart();
                }
            }
        }
    }

    // 加载Excel文件
    loadExcelFile(content, filename) {
        console.log('加载Excel文件:', filename);
        
        try {
            // 解析Excel文件
            const workbook = XLSX.read(content, { type: 'binary' });
            
            // 获取第一个工作表
            const firstSheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[firstSheetName];
            
            // 将工作表转换为JSON格式
            const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
            
            // 将数据转换为CSV格式显示在输入框中
            const csvData = jsonData.map(row => row.join(',')).join('\n');
            
            const dataInput = document.getElementById('data-input');
            if (dataInput) {
                dataInput.value = csvData;
            }
            
            this.showMessage(`Excel文件 "${filename}" 已加载并转换为CSV格式`, 'success');
            
            // 自动处理数据并显示图表
            if (window.dataProcessor) {
                const data = window.dataProcessor.processData();
                if (data) {
                    if (window.chartManager) {
                        window.chartManager.applyChart();
                    }
                }
            }
        } catch (error) {
            console.error('解析Excel文件时出错:', error);
            this.showMessage('解析Excel文件时出错: ' + error.message, 'error');
        }
    }

    // 保存文件功能
    saveFile() {
        console.log('执行保存文件操作');
        this.saveChartAsImage('chart.png');
    }

    // 另存为功能
    saveAs() {
        console.log('执行另存为操作');
        // 生成带时间戳的文件名
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
        const filename = `chart-${timestamp}.png`;
        this.saveChartAsImage(filename);
    }

    // 保存图表为图像文件
    saveChartAsImage(filename) {
        console.log('保存图表为图像:', filename);
        
        // 检查是否有图表可以保存
        if (!window.chartManager || !window.chartManager.currentChart) {
            this.showMessage('当前没有可保存的图表', 'error');
            return;
        }
        
        try {
            // 获取图表Canvas元素
            const chartCanvas = document.getElementById('chartCanvas');
            if (!chartCanvas) {
                this.showMessage('无法找到图表画布', 'error');
                return;
            }
            
            // 将Canvas转换为数据URL
            const imageDataUrl = chartCanvas.toDataURL('image/png');
            
            // 创建下载链接
            const link = document.createElement('a');
            link.download = filename;
            link.href = imageDataUrl;
            
            // 触发下载
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            
            this.showMessage(`图表已保存为 ${filename}`, 'success');
        } catch (error) {
            console.error('保存图表时出错:', error);
            this.showMessage('保存图表失败: ' + error.message, 'error');
        }
    }

    // 链接本地功能
    linkLocal() {
        console.log('执行链接本地操作');
        this.showMessage('链接本地功能待实现', 'info');
    }

    // 绑定图表设置事件
    bindChartSettingsEvents() {
        // 应用图表设置按钮事件
        const applySettingsBtn = document.getElementById('apply-chart-settings');
        if (applySettingsBtn) {
            applySettingsBtn.addEventListener('click', () => {
                // 获取图表设置值
                const chartTitle = document.getElementById('chart-title').value;
                const xAxisLabel = document.getElementById('x-axis-label').value;
                const yAxisLabel = document.getElementById('y-axis-label').value;
                const xAxisMin = parseFloat(document.getElementById('x-axis-min').value) || 0;
                const yAxisMin = parseFloat(document.getElementById('y-axis-min').value) || 0;
                const xAxisStep = parseFloat(document.getElementById('x-axis-step').value) || 1;
                const yAxisStep = parseFloat(document.getElementById('y-axis-step').value) || 50;

                // 设置图表配置
                if (window.chartManager) {
                    window.chartManager.setChartSettings({
                        title: chartTitle,
                        xAxisLabel: xAxisLabel,
                        yAxisLabel: yAxisLabel,
                        xAxisMin: xAxisMin,
                        yAxisMin: yAxisMin,
                        xAxisStep: xAxisStep,
                        yAxisStep: yAxisStep
                    });

                    // 应用设置到当前图表
                    window.chartManager.applyChartSettings();
                }
            });
        }

        // 实时更新图表标题（可选功能）
        const chartTitleInput = document.getElementById('chart-title');
        if (chartTitleInput) {
            chartTitleInput.addEventListener('input', (e) => {
                if (window.chartManager && window.chartManager.currentChart) {
                    const title = e.target.value;
                    if (title) {
                        window.chartManager.currentChart.options.plugins.title = {
                            display: true,
                            text: title
                        };
                    } else {
                        window.chartManager.currentChart.options.plugins.title = {
                            display: false
                        };
                    }
                    window.chartManager.currentChart.update();
                }
            });
        }
    }

    // 初始化颜色选择
    bindColorSelectionEvents() {
        console.log('尝试绑定颜色选择事件');
        // 使用轮询方式确保DOM元素存在
        const checkAndBind = () => {
            const colorOptions = document.getElementById('color-options');
            if (colorOptions) {
                console.log('找到颜色选项容器');
                const colorItems = colorOptions.querySelectorAll('.color-item');
                if (colorItems.length > 0) {
                    console.log('找到颜色选项:', colorItems.length, '个');
                    colorItems.forEach((item, index) => {
                        console.log('为颜色选项', index, '绑定事件');
                        item.addEventListener('click', (e) => {
                            console.log('点击了颜色选项', index);
                            e.preventDefault();
                            e.stopPropagation();
                            
                            // 为所有颜色项移除active类
                            colorItems.forEach(i => {
                                i.classList.remove('active');
                            });
                            
                            // 为当前点击的项添加active类
                            e.target.classList.add('active');
                            
                            // 设置当前颜色
                            this.currentColor = e.target.getAttribute('data-color');
                            console.log('选择颜色:', this.currentColor);
                            
                            // 更新图表管理器中的颜色
                            if (window.chartManager) {
                                window.chartManager.setColor(this.currentColor);
                            }
                        });
                    });
                } else {
                    console.log('颜色选项尚未加载，100ms后重试');
                    setTimeout(checkAndBind, 100);
                }
            } else {
                console.log('颜色选项容器尚未加载，100ms后重试');
                setTimeout(checkAndBind, 100);
            }
        };
        
        checkAndBind();
    }

    // 初始化图表类型选择
    bindChartTypeSelectionEvents() {
        console.log('尝试绑定图表类型选择事件');
        // 使用轮询方式确保DOM元素存在
        const checkAndBind = () => {
            const chartTypes = document.getElementById('chart-types');
            if (chartTypes) {
                console.log('找到图表类型容器');
                const chartTypeItems = chartTypes.querySelectorAll('.chart-type');
                if (chartTypeItems.length > 0) {
                    console.log('找到图表类型选项:', chartTypeItems.length, '个');
                    
                    // 为每个图表类型项绑定事件
                    chartTypeItems.forEach((item, index) => {
                        console.log('为图表类型选项', index, '绑定事件');
                        
                        // 图表类型点击事件（只针对图表类型本身，不包括子元素）
                        item.addEventListener('click', (e) => {
                            // 只有点击图表类型本身或下拉箭头时才触发
                            if (e.target === item || e.target.classList.contains('dropdown-arrow')) {
                                console.log('点击了图表类型选项', index);
                                e.preventDefault();
                                e.stopPropagation();
                                
                                // 切换当前项的active状态
                                item.classList.toggle('active');
                            }
                        });
                        
                        // 子类型选项点击事件
                        const subtypeOptions = item.querySelectorAll('.subtype-option');
                        subtypeOptions.forEach(option => {
                            option.addEventListener('click', (e) => {
                                e.stopPropagation();
                                const subtype = option.getAttribute('data-subtype');
                                console.log('选择子类型:', subtype);
                                
                                // 为当前图表类型的所有子选项移除active类
                                subtypeOptions.forEach(opt => {
                                    opt.classList.remove('active');
                                });
                                
                                // 为当前点击的子选项添加active类
                                option.classList.add('active');
                                
                                // 设置子类型到图表管理器
                                if (window.chartManager) {
                                    // 确保图表类型也被正确设置
                                    const chartType = item.getAttribute('data-chart');
                                    window.chartManager.setChartType(chartType);
                                    window.chartManager.setChartSubtype(subtype);
                                    // 如果已有数据，则重新应用图表
                                    if (window.dataProcessor && window.dataProcessor.getData()) {
                                        window.chartManager.applyChart();
                                    }
                                }
                                
                                // 更新父级图表类型项的active状态
                                chartTypeItems.forEach(i => {
                                    i.classList.remove('active');
                                });
                                item.classList.add('active');
                            });
                        });
                    });
                    
                    // 点击页面其他地方隐藏下拉菜单
                    document.addEventListener('click', (e) => {
                        if (!chartTypes.contains(e.target)) {
                            chartTypeItems.forEach(item => {
                                item.classList.remove('active');
                            });
                        }
                    });
                } else {
                    console.log('图表类型选项尚未加载，100ms后重试');
                    setTimeout(checkAndBind, 100);
                }
            } else {
                console.log('图表类型容器尚未加载，100ms后重试');
                setTimeout(checkAndBind, 100);
            }
        };
        
        checkAndBind();
    }

    // 发送数据功能
    sendData(data) {
        console.log('发送数据:', data);
        
        // 显示发送中的消息
        this.showMessage('正在发送数据到服务器...', 'info');
        
        // 获取当前图表的Canvas元素
        const chartCanvas = document.getElementById('chartCanvas');
        let chartImage = null;
        
        if (chartCanvas) {
            try {
                // 将图表转换为base64图像数据
                chartImage = chartCanvas.toDataURL('image/png');
            } catch (e) {
                console.error('图表转换为图像时出错:', e);
            }
        }
        
        // 准备发送到服务器的数据
        const requestData = {
            chartData: data,
            chartType: window.chartManager ? window.chartManager.currentChartType : 'unknown',
            chartSubtype: window.chartManager ? window.chartManager.currentChartSubtype : 'default',
            chartSettings: window.chartManager ? window.chartManager.chartSettings : {},
            chartImage: chartImage, // 图表图像数据
            timestamp: new Date().toISOString(),
            userAgent: navigator.userAgent
        };
        
        // 使用fetch API发送数据到服务器
        fetch('http://localhost:3000/api/charts', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestData)
        })
        .then(response => {
            // 检查响应状态
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            console.log('服务器响应:', data);
            this.showMessage('数据已发送，老师将会查看并提供反馈建议。', 'success');
            
            // 如果服务器返回了消息，添加到消息系统中
            if (data.messages && Array.isArray(data.messages) && window.messageManager) {
                data.messages.forEach(message => {
                    window.messageManager.addMessage(message.content, message.timestamp);
                });
            }
            
            // 如果服务器返回了建议，也添加到消息系统中
            if (data.suggestions && Array.isArray(data.suggestions) && window.messageManager) {
                data.suggestions.forEach(suggestion => {
                    window.messageManager.addMessage(`老师建议: ${suggestion}`, new Date().toLocaleString());
                });
            }
        })
        .catch(error => {
            console.error('发送数据时出错:', error);
            // 提供更详细的错误信息
            if (error.name === 'TypeError' && error.message.includes('fetch')) {
                this.showMessage('发送数据失败，请检查服务器是否正在运行或网络连接是否正常。', 'error');
            } else {
                this.showMessage('发送数据失败，请稍后重试。错误: ' + error.message, 'error');
            }
        });
    }

    // 显示消息
    showMessage(message, type = 'info') {
        // 在实际应用中，可以在这里实现消息显示逻辑
        console.log(`[${type.toUpperCase()}] ${message}`);
    }
}

// 导出UI管理器
window.UIManager = UIManager;