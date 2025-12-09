// main.js - 主入口文件，修复导入和构建问题

// 在导入前定义全局DOM节点对象
window.DOMNodes = {};

// 导入 NodeCrypt 模块（加密功能模块）
import './NodeCrypt.js';

// 从 util.file.js 中导入设置文件发送的函数
import {
  setupFileSend,
  handleFileMessage,
  downloadFile
} from './util.file.js';

// 从 util.image.js 中导入图片处理功能
import {
  setupImagePaste
} from './util.image.js';

// 从 util.emoji.js 中导入设置表情选择器的函数
import {
  setupEmojiPicker
} from './util.emoji.js';

// 从 util.settings.js 中导入设置面板的功能函数
import {
  openSettingsPanel,
  closeSettingsPanel,
  initSettings,
  notifyMessage
} from './util.settings.js';

// 从 util.i18n.js 中导入国际化函数
import { t, updateStaticTexts } from './util.i18n.js';

// 从 util.theme.js 中导入主题功能函数
import {
  initTheme
} from './util.theme.js';

// 从 util.dom.js 中导入常用 DOM 操作函数
import {
  $,
  $id,
  removeClass
} from './util.dom.js';

// 从 room.js 中导入房间管理相关变量和函数
import {
  roomsData,
  activeRoomIndex,
  joinRoom
} from './room.js';

// 从 chat.js 中导入聊天功能相关的函数
import {
  addMsg,
  addOtherMsg,
  addSystemMsg,
  setupImagePreview,
  setupInputPlaceholder,
  autoGrowInput,
  updateChatInputStyle
} from './chat.js';

// 从 ui.js 中导入 UI 界面相关的功能
import {
  renderUserList,
  renderMainHeader,
  setupMoreBtnMenu,
  preventSpaceInput,
  loginFormHandler,
  openLoginModal,
  setupTabs,
  autofillRoomPwd,
  generateLoginForm,
  initLoginForm,
  initFlipCard,
  setupMobileUIHandlers
} from './ui.js';

// 设置全局配置参数
window.config = {
  wsAddress: `${window.location.protocol === 'https:' ? 'wss:' : 'ws:'}//${window.location.host}`,
  debug: true
};

// 初始化DOM节点
function initializeDOMNodes() {
  // 检查是否已初始化
  if (!window.DOMNodes) {
    window.DOMNodes = {};
  }
  
  // 登录相关节点
  window.DOMNodes.loginContainer = document.getElementById('login-container');
  window.DOMNodes.loginForm = document.getElementById('login-form');
  window.DOMNodes.loginTitle = document.getElementById('login-title');
  window.DOMNodes.flipCard = document.getElementById('flip-card');
  
  // 聊天相关节点
  window.DOMNodes.chatContainer = document.getElementById('chat-container');
  window.DOMNodes.sidebar = document.getElementById('sidebar');
  window.DOMNodes.mainHeader = document.getElementById('main-header');
  window.DOMNodes.chatArea = document.getElementById('chat-area');
  window.DOMNodes.roomList = document.getElementById('room-list');
  
  // 右侧栏节点
  window.DOMNodes.rightbar = document.getElementById('rightbar');
  window.DOMNodes.membersTitle = document.getElementById('members-title');
  window.DOMNodes.memberList = document.getElementById('member-list');
  window.DOMNodes.memberTabs = document.getElementById('member-tabs');
  
  // 设置面板节点
  window.DOMNodes.settingsSidebar = document.getElementById('settings-sidebar');
  window.DOMNodes.settingsTitle = document.getElementById('settings-title');
  window.DOMNodes.settingsContent = document.getElementById('settings-content');
  window.DOMNodes.settingsBtn = document.getElementById('settings-btn');
  window.DOMNodes.settingsBackBtn = document.getElementById('settings-back-btn');
  
  // 用户相关节点
  window.DOMNodes.sidebarUsername = document.getElementById('sidebar-username');
  window.DOMNodes.sidebarUserAvatar = document.getElementById('sidebar-user-avatar');
  
  // 功能按钮节点
  window.DOMNodes.joinRoomText = document.getElementById('join-room-text');
  window.DOMNodes.rightbarGroupDesc = document.getElementById('rightbar-group-desc');
  
  // 检查必需节点
  const requiredNodes = ['loginContainer', 'chatContainer', 'chatArea'];
  const missingNodes = [];
  
  requiredNodes.forEach(nodeName => {
    if (!window.DOMNodes[nodeName]) {
      missingNodes.push(nodeName);
    }
  });
  
  if (missingNodes.length > 0 && window.config.debug) {
    console.warn('Missing required DOM nodes:', missingNodes);
  }
}

// 把一些函数挂载到 window 对象上供其他模块使用
window.addSystemMsg = addSystemMsg;
window.addOtherMsg = addOtherMsg;
window.joinRoom = joinRoom;
window.notifyMessage = notifyMessage;
window.setupEmojiPicker = setupEmojiPicker;
window.handleFileMessage = handleFileMessage;
window.downloadFile = downloadFile;

// 初始化应用
function initApp() {
  // 移除预加载样式类，允许过渡效果
  setTimeout(() => {
    document.body.classList.remove('preload');
  }, 300);
  
  // 初始化DOM节点
  initializeDOMNodes();
  
  // 初始化登录表单
  initLoginForm();

  const loginForm = window.DOMNodes.loginForm;
  if (loginForm) {
    loginForm.addEventListener('submit', loginFormHandler(null));
  }

  const joinBtn = $('.join-room');
  if (joinBtn) {
    joinBtn.onclick = openLoginModal;
  }
  
  // 阻止用户输入用户名、房间名和密码时输入空格
  preventSpaceInput($id('userName'));
  preventSpaceInput($id('roomName'));
  preventSpaceInput($id('password'));
  
  // 初始化翻转卡片功能
  initFlipCard();
  
  // 初始化辅助功能和界面设置
  autofillRoomPwd();
  setupInputPlaceholder();
  setupMoreBtnMenu();
  setupImagePreview();
  setupEmojiPicker();
  
  // 初始化主题
  initTheme();
  
  // 设置按钮事件
  const settingsBtn = window.DOMNodes.settingsBtn;
  if (settingsBtn) {
    settingsBtn.onclick = (e) => {
      e.stopPropagation();
      openSettingsPanel();
    };
  }

  // 设置返回按钮事件处理
  const settingsBackBtn = window.DOMNodes.settingsBackBtn;
  if (settingsBackBtn) {
    settingsBackBtn.onclick = (e) => {
      e.stopPropagation();
      closeSettingsPanel();
    };
  }
  
  // 消息输入框处理
  const input = document.querySelector('.input-message-input');
  
  // 设置图片粘贴功能
  const imagePasteHandler = setupImagePaste('.input-message-input');
  
  if (input) {
    input.focus();
    input.addEventListener('keydown', (e) => {
      // 按下 Enter 键并且不按 Shift，表示发送消息
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
      }
    });
  }
  
  // 发送消息的统一函数
  function sendMessage() {
    const text = input.innerText.trim();
    const images = imagePasteHandler ? imagePasteHandler.getCurrentImages() : [];

    if (!text && images.length === 0) return;
    
    const rd = roomsData[activeRoomIndex];
    
    if (rd && rd.chat) {
      if (images.length > 0) {
        // 发送包含图片的消息
        const messageContent = {
          text: text || '',
          images: images
        };

        if (rd.privateChatTargetId) {
          // 私聊图片消息加密并发送
          const targetClient = rd.chat.channel[rd.privateChatTargetId];
          if (targetClient && targetClient.shared) {
            const clientMessagePayload = {
              a: 'm',
              t: 'image_private',
              d: messageContent
            };
            const encryptedClientMessage = rd.chat.encryptClientMessage(clientMessagePayload, targetClient.shared);
            const serverRelayPayload = {
              a: 'c',
              p: encryptedClientMessage,
              c: rd.privateChatTargetId
            };
            const encryptedMessageForServer = rd.chat.encryptServerMessage(serverRelayPayload, rd.chat.serverShared);
            rd.chat.sendMessage(encryptedMessageForServer);
            addMsg(messageContent, false, 'image_private');
          } else {
            addSystemMsg(`${t('system.private_message_failed', 'Cannot send private message to')} ${rd.privateChatTargetName}. ${t('system.user_not_connected', 'User might not be fully connected.')}`);
          }
        } else {
          // 公共频道图片消息发送
          rd.chat.sendChannelMessage('image', messageContent);
          addMsg(messageContent, false, 'image');
        }
        
        imagePasteHandler.clearImages();
      } else if (text) {
        // 发送纯文本消息
        if (rd.privateChatTargetId) {
          // 私聊消息加密并发送
          const targetClient = rd.chat.channel[rd.privateChatTargetId];
          if (targetClient && targetClient.shared) {
            const clientMessagePayload = {
              a: 'm',
              t: 'text_private',
              d: text
            };
            const encryptedClientMessage = rd.chat.encryptClientMessage(clientMessagePayload, targetClient.shared);
            const serverRelayPayload = {
              a: 'c',
              p: encryptedClientMessage,
              c: rd.privateChatTargetId
            };
            const encryptedMessageForServer = rd.chat.encryptServerMessage(serverRelayPayload, rd.chat.serverShared);
            rd.chat.sendMessage(encryptedMessageForServer);
            addMsg(text, false, 'text_private');
          } else {
            addSystemMsg(`${t('system.private_message_failed', 'Cannot send private message to')} ${rd.privateChatTargetName}. ${t('system.user_not_connected', 'User might not be fully connected.')}`);
          }
        } else {
          // 公共频道消息发送
          rd.chat.sendChannelMessage('text', text);
          addMsg(text);
        }
      }
      
      // 清空输入框并触发 input 事件
      input.innerHTML = '';
      if (imagePasteHandler && typeof imagePasteHandler.refreshPlaceholder === 'function') {
        imagePasteHandler.refreshPlaceholder();
      }
      autoGrowInput();
    }
  }
  
  // 为发送按钮添加点击事件
  const sendButton = document.querySelector('.send-message-btn');
  if (sendButton) {
    sendButton.addEventListener('click', sendMessage);
  }
  
  // 设置发送文件功能
  setupFileSend({
    inputSelector: '.input-message-input',
    attachBtnSelector: '.chat-attach-btn',
    fileInputSelector: '.new-message-wrapper input[type="file"]',
    onSend: (message) => {
      const rd = roomsData[activeRoomIndex];
      if (rd && rd.chat) {
        const userName = rd.myUserName || '';
        const msgWithUser = { ...message, userName };
        if (rd.privateChatTargetId) {
          // 私聊文件加密并发送
          const targetClient = rd.chat.channel[rd.privateChatTargetId];
          if (targetClient && targetClient.shared) {
            const clientMessagePayload = {
              a: 'm',
              t: msgWithUser.type + '_private',
              d: msgWithUser
            };
            const encryptedClientMessage = rd.chat.encryptClientMessage(clientMessagePayload, targetClient.shared);
            const serverRelayPayload = {
              a: 'c',
              p: encryptedClientMessage,
              c: rd.privateChatTargetId
            };
            const encryptedMessageForServer = rd.chat.encryptServerMessage(serverRelayPayload, rd.chat.serverShared);
            rd.chat.sendMessage(encryptedMessageForServer);
            
            // 添加到自己的聊天记录
            if (msgWithUser.type === 'file_start') {
              addMsg(msgWithUser, false, 'file_private');
            }
          } else {
            addSystemMsg(`${t('system.private_file_failed', 'Cannot send private file to')} ${rd.privateChatTargetName}. ${t('system.user_not_connected', 'User might not be fully connected.')}`);
          }
        } else {
          // 公共频道文件发送
          rd.chat.sendChannelMessage(msgWithUser.type, msgWithUser);
          
          // 添加到自己的聊天记录
          if (msgWithUser.type === 'file_start') {
            addMsg(msgWithUser, false, 'file');
          }
        }
      }
    }
  });

  // 判断是否为移动端
  const isMobile = () => window.innerWidth <= 768;

  // 渲染主界面元素
  renderMainHeader();
  renderUserList();
  setupTabs();

  const roomList = window.DOMNodes.roomList;
  const sidebar = window.DOMNodes.sidebar;
  const rightbar = window.DOMNodes.rightbar;
  const sidebarMask = $id('mobile-sidebar-mask');
  const rightbarMask = $id('mobile-rightbar-mask');

  // 在移动端点击房间列表后关闭侧边栏
  if (roomList) {
    roomList.addEventListener('click', () => {
      if (isMobile()) {
        sidebar?.classList.remove('mobile-open');
        sidebarMask?.classList.remove('active');
      }
    });
  }

  // 在移动端点击成员标签后关闭右侧面板
  const memberTabs = window.DOMNodes.memberTabs;
  if (memberTabs) {
    memberTabs.addEventListener('click', () => {
      if (isMobile()) {
        removeClass(rightbar, 'mobile-open');
        removeClass(rightbarMask, 'active');
      }
    });
  }
  
  // 更新聊天输入样式
  updateChatInputStyle();
}

// 在文档开始加载前就初始化语言设置，防止闪烁
initSettings();
updateStaticTexts();

// 当 DOM 内容加载完成后执行初始化逻辑
window.addEventListener('DOMContentLoaded', initApp);

// 监听语言切换事件
window.addEventListener('languageChange', (event) => {
  updateStaticTexts();
});

// 全局拖拽文件自动打开附件功能
let dragCounter = 0;
let hasTriggeredAttach = false;

// 监听文件上传模态框关闭事件，重置拖拽标志位
window.addEventListener('fileUploadModalClosed', () => {
  hasTriggeredAttach = false;
});

document.addEventListener('dragenter', (e) => {
  dragCounter++;
  if (!hasTriggeredAttach && e.dataTransfer.items.length > 0) {
    // 检查是否有文件
    for (let item of e.dataTransfer.items) {
      if (item.kind === 'file') {
        // 自动点击附件按钮
        const attachBtn = document.querySelector('.chat-attach-btn');
        if (attachBtn) {
          attachBtn.click();
          hasTriggeredAttach = true;
        }
        break;
      }
    }
  }
});

document.addEventListener('dragleave', (e) => {
  dragCounter--;
  if (dragCounter === 0) {
    hasTriggeredAttach = false;
  }
});

document.addEventListener('dragover', (e) => {
  e.preventDefault();
});

document.addEventListener('drop', (e) => {
  e.preventDefault();
  dragCounter = 0;
  hasTriggeredAttach = false;
});