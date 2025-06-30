class MementumPopup {
  constructor() {
    this.apiUrl = "http://localhost:8000"; // Ваш API URL
    this.webAppUrl = "http://localhost:5173"; // Vite обычно использует порт 5173
    this.init();
  }

  init() {
    this.bindEvents();
    this.loadSelectedText();
    this.updateCharCount();
  }

  bindEvents() {
    const noteInput = document.getElementById("noteInput");
    const noteForm = document.getElementById("noteForm");
    const saveBtn = document.getElementById("saveBtn");
    const openAppBtn = document.getElementById("openAppBtn");
    const viewNoteBtn = document.getElementById("viewNoteBtn");
    const retryBtn = document.getElementById("retryBtn");
    const settingsBtn = document.getElementById("settingsBtn");

    // Обновление счетчика символов и состояния кнопки
    noteInput.addEventListener("input", () => {
      this.updateCharCount();
      this.updateSaveButton();
    });

    // Отправка формы
    noteForm.addEventListener("submit", (e) => {
      e.preventDefault();
      this.saveNote();
    });

    // Открытие веб-приложения
    openAppBtn.addEventListener("click", () => {
      this.openWebApp();
    });

    // Просмотр созданной заметки
    viewNoteBtn.addEventListener("click", () => {
      this.viewNote();
    });

    // Повторная попытка
    retryBtn.addEventListener("click", () => {
      this.hideAllStates();
      this.showForm();
    });

    // Настройки (пока просто открываем веб-приложение)
    settingsBtn.addEventListener("click", () => {
      this.openWebApp();
    });

    // Автофокус на поле ввода
    noteInput.focus();
  }

  async loadSelectedText() {
    try {
      // Получаем выделенный текст из content script
      const [tab] = await chrome.tabs.query({
        active: true,
        currentWindow: true,
      });

      chrome.tabs.sendMessage(
        tab.id,
        { action: "getSelectedText" },
        (response) => {
          if (response && response.selectedText) {
            const noteInput = document.getElementById("noteInput");
            noteInput.value = response.selectedText;
            this.updateCharCount();
            this.updateSaveButton();

            // Добавляем информацию об источнике
            if (response.pageTitle || response.pageUrl) {
              const sourceInfo = `\n\nSource: ${
                response.pageTitle || "Untitled"
              }\n${response.pageUrl || ""}`;
              noteInput.value += sourceInfo;
              this.updateCharCount();
            }
          }
        }
      );
    } catch (error) {
      console.log("No selected text available");
    }
  }

  updateCharCount() {
    const noteInput = document.getElementById("noteInput");
    const charCount = document.getElementById("charCount");
    const currentLength = noteInput.value.length;
    const maxLength = 1000;

    charCount.textContent = `${currentLength}/${maxLength}`;

    if (currentLength > maxLength * 0.9) {
      charCount.style.color = "#fca5a5";
    } else if (currentLength > maxLength * 0.7) {
      charCount.style.color = "#fbbf24";
    } else {
      charCount.style.color = "#9ca3af";
    }
  }

  updateSaveButton() {
    const noteInput = document.getElementById("noteInput");
    const saveBtn = document.getElementById("saveBtn");
    const hasContent = noteInput.value.trim().length > 0;

    saveBtn.disabled = !hasContent;
  }

  async saveNote() {
    const noteInput = document.getElementById("noteInput");
    const content = noteInput.value.trim();

    if (!content) return;

    this.showLoading();

    try {
      const response = await fetch(`${this.apiUrl}/ai-agent/process`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          message: content,
          enable_background_tasks: true,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      this.savedNoteId = result.note_id || result.id;
      this.showSuccess();

      // Очищаем форму
      noteInput.value = "";
      this.updateCharCount();
      this.updateSaveButton();
    } catch (error) {
      console.error("Error saving note:", error);
      this.showError();
    }
  }

  showLoading() {
    this.hideAllStates();
    document.getElementById("loadingState").classList.remove("hidden");
  }

  showSuccess() {
    this.hideAllStates();
    document.getElementById("successState").classList.remove("hidden");
  }

  showError() {
    this.hideAllStates();
    document.getElementById("errorState").classList.remove("hidden");
  }

  showForm() {
    document.getElementById("noteForm").style.display = "block";
  }

  hideAllStates() {
    document.getElementById("loadingState").classList.add("hidden");
    document.getElementById("successState").classList.add("hidden");
    document.getElementById("errorState").classList.add("hidden");
  }

  openWebApp() {
    // Открываем главную страницу приложения (страница заметок)
    chrome.tabs.create({ url: `${this.webAppUrl}/notes` });
    window.close();
  }

  viewNote() {
    // Открываем главную страницу заметок
    chrome.tabs.create({ url: `${this.webAppUrl}/notes` });
    window.close();
  }
}

// Инициализация при загрузке
document.addEventListener("DOMContentLoaded", () => {
  new MementumPopup();
});
