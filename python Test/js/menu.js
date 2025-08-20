// 菜单功能和分隔条拖动功能模块
class MenuManager {
    constructor() {
        this.initDraggableBars();
        this.initFileOperations();
    }

    // 初始化可拖动分隔条
    initDraggableBars() {
        // 等待DOM加载完成
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => {
                this.setupDraggableBars();
            });
        } else {
            this.setupDraggableBars();
        }
    }

    // 初始化文件操作功能
    initFileOperations() {
        // 等待DOM加载完成
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => {
                this.setupFileOperations();
            });
        } else {
            this.setupFileOperations();
        }
    }

    // 设置可拖动分隔条
    setupDraggableBars() {
        // 创建左侧分隔条的拖动功能
        const leftSidebar = document.querySelector('.left-sidebar');
        if (leftSidebar) {
            // 创建一个真正的可拖动元素而不是伪元素
            const leftDragBar = document.createElement('div');
            leftDragBar.className = 'drag-bar left-drag-bar';
            leftDragBar.style.cssText = `
                position: absolute;
                top: 0;
                right: -2px;
                width: 5px;
                height: 100%;
                background-color: #999;
                cursor: col-resize;
                z-index: 10;
                transition: background-color 0.3s;
            `;
            
            leftDragBar.addEventListener('mouseenter', () => {
                leftDragBar.style.backgroundColor = '#333';
            });
            
            leftDragBar.addEventListener('mouseleave', () => {
                leftDragBar.style.backgroundColor = '#999';
            });
            
            leftSidebar.appendChild(leftDragBar);
            this.makeDraggable(leftDragBar, leftSidebar, 'right');
        }

        // 创建右侧分隔条的拖动功能
        const rightSidebar = document.querySelector('.right-sidebar');
        if (rightSidebar) {
            // 创建一个真正的可拖动元素而不是伪元素
            const rightDragBar = document.createElement('div');
            rightDragBar.className = 'drag-bar right-drag-bar';
            rightDragBar.style.cssText = `
                position: absolute;
                top: 0;
                left: -2px;
                width: 5px;
                height: 100%;
                background-color: #999;
                cursor: col-resize;
                z-index: 10;
                transition: background-color 0.3s;
            `;
            
            rightDragBar.addEventListener('mouseenter', () => {
                rightDragBar.style.backgroundColor = '#333';
            });
            
            rightDragBar.addEventListener('mouseleave', () => {
                rightDragBar.style.backgroundColor = '#999';
            });
            
            rightSidebar.appendChild(rightDragBar);
            this.makeDraggable(rightDragBar, rightSidebar, 'left');
        }
    }

    // 设置文件操作功能
    setupFileOperations() {
        // 获取文件输入元素
        const fileInput = document.getElementById('file-input');
        if (!fileInput) return;

        // 打开文件菜单项
        const openFileLink = document.getElementById('open-file');
        if (openFileLink) {
            openFileLink.addEventListener('click', (e) => {
                e.preventDefault();
                fileInput.click(); // 触发文件选择对话框
            });
        }

        // 文件选择后的处理
        fileInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (!file) return;

            // 验证文件类型
            const validTypes = ['application/json', 'text/csv', 'text/plain'];
            const validExtensions = ['.json', '.csv', '.txt'];
            const fileExtension = '.' + file.name.split('.').pop().toLowerCase();

            if (!validTypes.includes(file.type) && !validExtensions.includes(fileExtension)) {
                alert('不支持的文件类型。请上传 JSON、CSV 或 TXT 文件。');
                return;
            }

            // 验证文件大小（最大5MB）
            if (file.size > 5 * 1024 * 1024) {
                alert('文件太大。请选择小于5MB的文件。');
                return;
            }

            // 读取文件内容
            const reader = new FileReader();
            reader.onload = (event) => {
                try {
                    const content = event.target.result;
                    const dataInput = document.getElementById('data-input');
                    
                    if (dataInput) {
                        // 如果是JSON文件，格式化显示
                        if (file.type === 'application/json' || fileExtension === '.json') {
                            try {
                                const jsonData = JSON.parse(content);
                                dataInput.value = JSON.stringify(jsonData, null, 2);
                            } catch (jsonError) {
                                dataInput.value = content;
                            }
                        } else {
                            dataInput.value = content;
                        }
                        
                        // 自动处理数据并显示图表
                        if (window.dataProcessor) {
                            const processedData = window.dataProcessor.processData();
                            if (processedData && window.chartManager) {
                                window.chartManager.applyChart();
                            }
                        }
                        
                        alert('文件加载成功！');
                    }
                } catch (error) {
                    console.error('文件读取出错:', error);
                    alert('文件读取出错: ' + error.message);
                }
            };
            
            reader.onerror = () => {
                alert('文件读取出错。');
            };
            
            reader.readAsText(file);
        });
    }

    // 使分隔条可拖动
    makeDraggable(dragBar, sidebar, direction) {
        let isDragging = false;
        let startX;
        let startWidth;

        dragBar.addEventListener('mousedown', (e) => {
            isDragging = true;
            startX = e.clientX;
            startWidth = parseInt(document.defaultView.getComputedStyle(sidebar).width, 10);
            document.body.style.cursor = 'col-resize';
            e.preventDefault();
        });

        document.addEventListener('mousemove', (e) => {
            if (!isDragging) return;
            
            const diff = direction === 'right' ? e.clientX - startX : startX - e.clientX;
            const newWidth = startWidth + diff;
            
            // 限制最小宽度和最大宽度
            if (newWidth > 50 && newWidth < 500) {
                sidebar.style.width = newWidth + 'px';
            }
        });

        document.addEventListener('mouseup', () => {
            isDragging = false;
            document.body.style.cursor = '';
        });
    }
}

// 导出菜单管理器
window.MenuManager = MenuManager;