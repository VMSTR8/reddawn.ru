/**
 * Form Handler Module
 * Handles contact form validation and submission
 * 
 * @author Maxim VMSTR8 Vinokurov
 * @since 2025
 */

'use strict';

const FormHandler = {
    /**
     * Configuration
     */
    config: {
        minAge: 21,
        maxAge: 70,
        minNameLength: 2,
        maxNameLength: 100,
        minTelegramLength: 5,
        maxTelegramLength: 32,
        successDisplayTime: 5000,
        errorDisplayTime: 5000,
        // reCAPTCHA v3 Site Key (тестовый ключ для localhost)
        recaptchaSiteKey: '6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI',
        // Минимальный score для прохождения (0.0 - 1.0, где 1.0 = точно человек)
        recaptchaMinScore: 0.5,
        // API endpoint твоего FastAPI бота
        // Замени на свой URL после деплоя
        apiEndpoint: 'http://localhost:8000/api/submit-application',  // Для локальной разработки
        // apiEndpoint: 'https://your-bot-domain.com/api/submit-application',  // Для продакшена
        // Для теста без реального backend
        useMockApi: true  // Поставь false когда backend будет готов
    },
    
    /**
     * DOM Elements
     */
    elements: {
        form: null,
        nameInput: null,
        ageInput: null,
        telegramInput: null,
        submitButton: null,
        successMessage: null,
        errorMessage: null
    },
    
    /**
     * Initialize form handler
     */
    init: function() {
        this.cacheElements();
        this.bindEvents();
    },
    
    /**
     * Cache DOM elements
     */
    cacheElements: function() {
        this.elements.form = document.getElementById('join-form');
        if (!this.elements.form) return;
        
        this.elements.nameInput = this.elements.form.querySelector('input[name="name"]');
        this.elements.ageInput = this.elements.form.querySelector('input[name="age"]');
        this.elements.telegramInput = this.elements.form.querySelector('input[name="telegram"]');
        this.elements.submitButton = this.elements.form.querySelector('button[type="submit"]');
        this.elements.successMessage = document.getElementById('form-success');
        this.elements.errorMessage = document.getElementById('form-error');
    },
    
    /**
     * Bind form events
     */
    bindEvents: function() {
        if (!this.elements.form) return;
        
        const self = this;
        this.elements.form.addEventListener('submit', function(e) {
            e.preventDefault();
            self.handleSubmit();
        });
    },
    
    /**
     * Validate name field
     * @param {string} name - Name to validate
     * @returns {string|null} Error message or null if valid
     */
    validateName: function(name) {
        const regex = /^[a-zA-Zа-яА-ЯёЁ\s]+$/;
        
        if (!regex.test(name)) {
            return 'Имя может содержать только буквы (кириллица или латиница) и пробелы.';
        }
        
        if (name.length > this.config.maxNameLength) {
            return `Имя не может быть длиннее ${this.config.maxNameLength} символов.`;
        }
        
        if (name.length < this.config.minNameLength) {
            return `Имя должно быть не короче ${this.config.minNameLength} символов.`;
        }
        
        return null;
    },
    
    /**
     * Validate age field
     * @param {string|number} age - Age to validate
     * @returns {string|null} Error message or null if valid
     */
    validateAge: function(age) {
        const numAge = parseInt(age);
        
        if (isNaN(numAge) || numAge < 0) {
            return 'Возраст должен быть положительным числом.';
        }
        
        if (numAge < this.config.minAge) {
            return `Набор в команду строго от ${this.config.minAge} года.`;
        }
        
        if (numAge > this.config.maxAge) {
            return 'Вряд ли вы потянете физически всю эту нагрузку...';
        }
        
        return null;
    },
    
    /**
     * Validate telegram field
     * @param {string} telegram - Telegram username to validate
     * @returns {string|null} Error message or null if valid
     */
    validateTelegram: function(telegram) {
        const username = telegram.replace('@', '');
        const regex = /^[a-zA-Z0-9_]+$/;
        
        if (!regex.test(username)) {
            return 'Telegram username может содержать только буквы, цифры и подчеркивания.';
        }
        
        if (username.length < this.config.minTelegramLength || username.length > this.config.maxTelegramLength) {
            return `Telegram username должен быть от ${this.config.minTelegramLength} до ${this.config.maxTelegramLength} символов.`;
        }
        
        return null;
    },
    
    /**
     * Show error message for a field
     * @param {HTMLElement} input - Input element
     * @param {string} message - Error message
     */
    showError: function(input, message) {
        const container = input.closest('.relative').parentElement;
        const errorDiv = container.querySelector('.error-message');
        
        if (errorDiv) {
            errorDiv.textContent = `⚠ ${message}`;
            errorDiv.classList.remove('hidden');
        }
        
        input.classList.remove('border-red-dawn/30');
        input.classList.add('border-red-dawn');
    },
    
    /**
     * Hide error message for a field
     * @param {HTMLElement} input - Input element
     */
    hideError: function(input) {
        const container = input.closest('.relative').parentElement;
        const errorDiv = container.querySelector('.error-message');
        
        if (errorDiv) {
            errorDiv.classList.add('hidden');
        }
        
        input.classList.remove('border-red-dawn');
        input.classList.add('border-red-dawn/30');
    },
    
    /**
     * Handle form submission
     */
    handleSubmit: function() {
        const self = this;
        
        // Hide previous errors
        this.hideError(this.elements.nameInput);
        this.hideError(this.elements.ageInput);
        this.hideError(this.elements.telegramInput);
        
        // Validate all fields
        let hasErrors = false;
        
        const nameError = this.validateName(this.elements.nameInput.value.trim());
        if (nameError) {
            this.showError(this.elements.nameInput, nameError);
            hasErrors = true;
        }
        
        const ageError = this.validateAge(this.elements.ageInput.value);
        if (ageError) {
            this.showError(this.elements.ageInput, ageError);
            hasErrors = true;
        }
        
        const telegramError = this.validateTelegram(this.elements.telegramInput.value.trim());
        if (telegramError) {
            this.showError(this.elements.telegramInput, telegramError);
            hasErrors = true;
        }
        
        // Prevent submission if age > maxAge
        const age = parseInt(this.elements.ageInput.value);
        if (!isNaN(age) && age > this.config.maxAge) {
            hasErrors = true;
        }
        
        if (hasErrors) {
            this.elements.form.classList.add('animate-shake');
            setTimeout(function() {
                self.elements.form.classList.remove('animate-shake');
            }, 500);
            return;
        }
        
        // Disable submit button and show loading state
        this.elements.submitButton.disabled = true;
        this.elements.submitButton.innerHTML = `
            <div class="relative bg-red-dawn border-2 border-red-dawn transition-all px-6 py-3 sm:px-8 sm:py-4">
                <!-- Button Corners -->
                <div class="absolute top-0 left-0 w-3 h-3 bg-black-base"></div>
                <div class="absolute top-0 right-0 w-3 h-3 bg-black-base"></div>
                <div class="absolute bottom-0 left-0 w-3 h-3 bg-black-base"></div>
                <div class="absolute bottom-0 right-0 w-3 h-3 bg-black-base"></div>
                
                <div class="flex items-center justify-center gap-3">
                    <svg class="animate-spin h-5 w-5 text-text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span class="font-russo text-text-primary text-base sm:text-lg tracking-wider uppercase">ПРОВЕРКА КАПЧИ...</span>
                </div>
            </div>
        `;
        
        // Execute reCAPTCHA v3
        if (typeof grecaptcha !== 'undefined') {
            grecaptcha.ready(function() {
                grecaptcha.execute(self.config.recaptchaSiteKey, {action: 'submit'})
                    .then(function(token) {
                        console.log('✅ reCAPTCHA token получен:', token.substring(0, 20) + '...');
                        
                        // Отправляем форму с токеном
                        self.submitForm(token);
                    })
                    .catch(function(error) {
                        console.error('❌ Ошибка reCAPTCHA:', error);
                        self.showFormError('Ошибка проверки капчи. Попробуй обновить страницу.');
                        self.resetSubmitButton();
                    });
            });
        } else {
            console.warn('⚠️ reCAPTCHA не загружена, отправка без проверки');
            self.submitForm(null);
        }
    },
    
    /**
     * Submit form with reCAPTCHA token
     * @param {string|null} recaptchaToken - reCAPTCHA token
     */
    submitForm: function(recaptchaToken) {
        const self = this;
        
        // Собираем данные формы
        const formData = {
            name: this.elements.nameInput.value.trim(),
            age: parseInt(this.elements.ageInput.value),
            telegram: this.elements.telegramInput.value.trim(),
            experience: this.elements.form.querySelector('input[name="experience"]:checked').value,
            recaptchaToken: recaptchaToken,
            timestamp: new Date().toISOString()
        };
        
        console.log('📤 Отправка формы:', formData);
        
        // Если используем mock API (для разработки)
        if (this.config.useMockApi) {
            console.log('⚠️ Mock API режим (для разработки)');
            setTimeout(function() {
                // Имитируем 90% успешных отправок
                const isSuccess = Math.random() > 0.1;
                
                if (isSuccess) {
                    console.log('✅ Форма успешно отправлена (mock)');
                    self.showSuccess();
                } else {
                    console.log('❌ Ошибка отправки формы (mock)');
                    self.showFormError('Проблема с соединением. Попробуй позже.');
                }
            }, 1500);
            return;
        }
        
        // Реальная отправка на backend
        fetch(this.config.apiEndpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(formData)
        })
        .then(function(response) {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(function(data) {
            console.log('✅ Ответ сервера:', data);
            self.showSuccess();
        })
        .catch(function(error) {
            console.error('❌ Ошибка отправки:', error);
            self.showFormError('Ошибка отправки. Проверь подключение.');
        });
    },
    
    /**
     * Show success message
     */
    showSuccess: function() {
        const self = this;
        
        // Сначала скрываем форму и показываем success
        this.elements.form.classList.add('hidden');
        this.elements.successMessage.classList.remove('hidden');
        
        // Через время возвращаем форму в исходное состояние
        setTimeout(function() {
            // Скрываем success сообщение
            self.elements.successMessage.classList.add('hidden');
            
            // Сбрасываем форму и кнопку ДО показа
            self.elements.form.reset();
            self.resetSubmitButton();
            self.hideError(self.elements.nameInput);
            self.hideError(self.elements.ageInput);
            self.hideError(self.elements.telegramInput);
            
            // Показываем форму обратно с уже сброшенным состоянием
            self.elements.form.classList.remove('hidden');
        }, this.config.successDisplayTime);
    },
    
    /**
     * Show error message
     * @param {string} message - Error message to display
     */
    showFormError: function(message) {
        const self = this;
        
        if (this.elements.errorMessage) {
            const errorMessageElement = this.elements.errorMessage.querySelector('#error-message');
            if (errorMessageElement) {
                errorMessageElement.textContent = message;
            }
        }
        
        // Скрываем форму и показываем ошибку
        this.elements.form.classList.add('hidden');
        this.elements.errorMessage.classList.remove('hidden');
        
        // Через время возвращаем форму
        setTimeout(function() {
            // Скрываем сообщение об ошибке
            self.elements.errorMessage.classList.add('hidden');
            
            // Сбрасываем кнопку ДО показа формы
            self.resetSubmitButton();
            
            // Показываем форму обратно
            self.elements.form.classList.remove('hidden');
        }, this.config.errorDisplayTime);
    },
    
    /**
     * Reset submit button to original state
     */
    resetSubmitButton: function() {
        this.elements.submitButton.disabled = false;
        this.elements.submitButton.innerHTML = `
            <div class="relative bg-red-dawn hover:bg-red-crimson border-2 border-red-dawn transition-all px-6 py-3 sm:px-8 sm:py-4">
                <!-- Button Corners -->
                <div class="absolute top-0 left-0 w-3 h-3 bg-black-base"></div>
                <div class="absolute top-0 right-0 w-3 h-3 bg-black-base"></div>
                <div class="absolute bottom-0 left-0 w-3 h-3 bg-black-base"></div>
                <div class="absolute bottom-0 right-0 w-3 h-3 bg-black-base"></div>
                
                <div class="flex items-center justify-center gap-3">
                    <span class="font-russo text-text-primary text-base sm:text-lg tracking-wider uppercase">ОТПРАВИТЬ ЗАЯВКУ</span>
                    <svg class="w-5 h-5 text-text-primary transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7l5 5m0 0l-5 5m5-5H6"></path>
                    </svg>
                </div>
            </div>
        `;
    }
};
