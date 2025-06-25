// Создание контекстного меню при установке расширения
chrome.runtime.onInstalled.addListener(() => {
    chrome.contextMenus.create({
      id: "saveToMementum",
      title: "Save to Mementum.ai",
      contexts: ["selection"],
    })
  
    chrome.contextMenus.create({
      id: "quickNote",
      title: "Quick Note",
      contexts: ["page"],
    })
  })
  
  // Обработка кликов по контекстному меню
  chrome.contextMenus.onClicked.addListener((info, tab) => {
    if (info.menuItemId === "saveToMementum") {
      // Сохраняем выделенный текст
      chrome.storage.local.set({
        selectedText: info.selectionText,
        pageTitle: tab.title,
        pageUrl: tab.url,
      })
  
      // Открываем popup
      chrome.action.openPopup()
    } else if (info.menuItemId === "quickNote") {
      // Открываем popup для быстрой заметки
      chrome.action.openPopup()
    }
  })
  
  // Обработка сообщений от content script
  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "saveSelectedText") {
      chrome.storage.local.set({
        selectedText: request.selectedText,
        pageTitle: request.pageTitle,
        pageUrl: request.pageUrl,
      })
      sendResponse({ success: true })
    }
  })
  