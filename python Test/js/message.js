// 消息模块
class MessageManager {
    constructor() {
        this.messages = [];
        this.init();
    }

    init() {
        console.log('初始化消息管理器');
        this.bindEvents();
        // 从服务器加载消息
        this.loadMessagesFromServer();
        // 定期检查新消息
        setInterval(() => {
            this.loadMessagesFromServer();
        }, 30000); // 每30秒检查一次新消息
    }

    // 绑定事件
    bindEvents() {
        const messageMenu = document.getElementById('message-menu');
        if (!messageMenu) return;

        // 悬浮或点击显示消息
        messageMenu.addEventListener('mouseenter', () => {
            this.showMessages();
        });

        messageMenu.addEventListener('click', (e) => {
            // 阻止链接默认行为
            if (e.target.tagName === 'A') return;
            this.showMessages();
        });

        // 鼠标离开时隐藏消息
        messageMenu.addEventListener('mouseleave', (e) => {
            // 检查鼠标是否移向消息窗口
            const dropdown = document.getElementById('message-dropdown');
            if (dropdown && !dropdown.contains(e.relatedTarget)) {
                this.hideMessages();
            }
        });

        // 关闭按钮事件
        const closeBtn = document.getElementById('close-messages');
        if (closeBtn) {
            closeBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.hideMessages();
            });
        }

        // 点击其他地方隐藏消息
        document.addEventListener('click', (e) => {
            if (!messageMenu.contains(e.target)) {
                this.hideMessages();
            }
        });
    }

    // 显示消息窗口
    showMessages() {
        const dropdown = document.getElementById('message-dropdown');
        if (dropdown) {
            dropdown.style.display = 'block';
        }
    }

    // 隐藏消息窗口
    hideMessages() {
        const dropdown = document.getElementById('message-dropdown');
        if (dropdown) {
            dropdown.style.display = 'none';
        }
    }

    // 从服务器加载消息
    loadMessagesFromServer() {
        fetch('http://localhost:3000/api/messages')
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                return response.json();
            })
            .then(data => {
                if (Array.isArray(data)) {
                    // 合并服务器消息和本地消息
                    data.forEach(serverMessage => {
                        // 检查是否已存在该消息
                        const exists = this.messages.some(msg => msg.id === serverMessage.id);
                        if (!exists) {
                            this.messages.push({
                                id: serverMessage.id || Date.now() + Math.random(),
                                content: serverMessage.content || serverMessage.message || '无内容',
                                timestamp: serverMessage.createdAt || serverMessage.timestamp || new Date().toLocaleString(),
                                read: false
                            });
                        }
                    });
                    
                    this.updateMessageCount();
                    this.displayMessages();
                }
            })
            .catch(error => {
                console.error('从服务器加载消息时出错:', error);
                // 如果无法连接到服务器且没有消息，则使用模拟数据
                if (this.messages.length === 0) {
                    this.loadMessages();
                }
            });
    }

    // 模拟从服务器加载消息（备用方案）
    loadMessages() {
        // 模拟网络请求
        setTimeout(() => {
            // 模拟从服务器获取的消息
            const simulatedMessages = [
                {
                    id: 1,
                    content: "柱状图的颜色搭配可以更加鲜明一些，建议使用对比度更高的配色方案。",
                    timestamp: "2023-05-15 10:30",
                    read: false
                },
                {
                    id: 2,
                    content: "折线图的线条可以加粗一些，这样在投影时会更清晰。",
                    timestamp: "2023-05-14 14:20",
                    read: true
                },
                {
                    id: 3,
                    content: "箱线图的异常值标识不够明显，建议使用特殊符号或颜色突出显示。",
                    timestamp: "2023-05-12 09:15",
                    read: false
                }
            ];
            
            // 只在没有消息时添加模拟消息
            this.messages = simulatedMessages;
            this.updateMessageCount();
            this.displayMessages();
        }, 1000);
    }

    // 更新消息数量显示
    updateMessageCount() {
        const unreadCount = this.messages.filter(msg => !msg.read).length;
        const countElement = document.getElementById('message-count');
        if (countElement) {
            countElement.textContent = unreadCount;
            countElement.style.display = unreadCount > 0 ? 'inline' : 'none';
        }
    }

    // 显示消息内容
    displayMessages() {
        const contentElement = document.getElementById('message-content');
        if (!contentElement) return;

        if (this.messages.length === 0) {
            contentElement.innerHTML = '<p class="no-messages">暂无消息</p>';
            return;
        }

        // 按时间倒序排列消息
        const sortedMessages = [...this.messages].sort((a, b) => 
            new Date(b.timestamp) - new Date(a.timestamp)
        );

        // 构造消息列表
        let messagesHTML = '';
        sortedMessages.forEach(msg => {
            const readClass = msg.read ? 'read' : 'unread';
            messagesHTML += `
                <div class="message-item ${readClass}" data-id="${msg.id}">
                    <div class="message-text">${msg.content}</div>
                    <div class="message-time">${msg.timestamp}</div>
                </div>
            `;
        });

        contentElement.innerHTML = messagesHTML;

        // 标记所有消息为已读
        this.markAllAsRead();
    }

    // 标记所有消息为已读
    markAllAsRead() {
        this.messages.forEach(msg => {
            msg.read = true;
        });
        this.updateMessageCount();
    }

    // 添加新消息
    addMessage(content, timestamp = new Date().toLocaleString()) {
        const newMessage = {
            id: Date.now() + Math.random(), // 使用时间戳+随机数作为唯一ID
            content: content,
            timestamp: timestamp,
            read: false
        };
        
        this.messages.push(newMessage);
        this.updateMessageCount();
        this.displayMessages();
    }

    // 清空所有消息
    clearMessages() {
        this.messages = [];
        this.updateMessageCount();
        this.displayMessages();
    }
}

// 导出消息管理器
window.MessageManager = MessageManager;