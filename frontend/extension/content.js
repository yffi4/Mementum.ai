// Content script для работы с выделенным текстом

// Слушаем сообщения от popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "getSelectedText") {
      const selectedText = window.getSelection().toString().trim()
  
      sendResponse({
        selectedText: selectedText,
        pageTitle: document.title,
        pageUrl: window.location.href,
      })
    }
  })
  
  // Сохраняем выделенный текст при выделении
  document.addEventListener("mouseup", () => {
    const selectedText = window.getSelection().toString().trim()
  
    if (selectedText.length > 0) {
      chrome.runtime.sendMessage({
        action: "saveSelectedText",
        selectedText: selectedText,
        pageTitle: document.title,
        pageUrl: window.location.href,
      })
    }
  })
  
  // Добавляем стили для уведомлений (если понадобятся)
  const style = document.createElement("style")
  style.textContent = `
    .mementum-notification {
      position: fixed;
      top: 20px;
      right: 20px;
      background: linear-gradient(135deg, #0b0c2a 0%, #1b1740 100%);
      color: white;
      padding: 1rem;
      border-radius: 0.5rem;
      border: 1px solid rgba(111, 234, 255, 0.4);
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
      z-index: 10000;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", sans-serif;
      font-size: 14px;
      max-width: 300px;
      animation: slideInRight 0.3s ease-out;
    }
    
    @keyframes slideInRight {
      from {
        transform: translateX(100%);
        opacity: 0;
      }
      to {
        transform: translateX(0);
        opacity: 1;
      }
    }
  `
  document.head.appendChild(style)
  