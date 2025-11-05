/**
 * Theme Toggle Module
 * Handles theme toggle functionality (mock - only dark theme available)
 * 
 * @author Maxim VMSTR8 Vinokurov
 * @since 2025
 */

'use strict';

const ThemeToggle = {
    /**
     * DOM Elements
     */
    elements: {
        desktopToggle: null,
        mobileToggle: null
    },
    
    /**
     * Initialize theme toggle
     */
    init: function() {
        this.cacheElements();
        this.bindEvents();
    },
    
    /**
     * Cache DOM elements
     */
    cacheElements: function() {
        this.elements.desktopToggle = document.getElementById('theme-toggle');
        this.elements.mobileToggle = document.getElementById('theme-toggle-mobile');
    },
    
    /**
     * Bind theme toggle events
     */
    bindEvents: function() {
        const self = this;
        
        if (this.elements.desktopToggle) {
            this.elements.desktopToggle.addEventListener('click', function() {
                self.handleToggle(this);
            });
        }
        
        if (this.elements.mobileToggle) {
            this.elements.mobileToggle.addEventListener('click', function() {
                self.handleToggle(this);
            });
        }
    },
    
    /**
     * Handle theme toggle click
     * @param {HTMLElement} button - Toggle button element
     */
    handleToggle: function(button) {
        // Get the toggle knob and background elements
        const isDesktop = button.id === 'theme-toggle';
        const knob = document.getElementById(isDesktop ? 'toggle-knob' : 'toggle-knob-mobile');
        const toggleBg = knob.parentElement;
        
        // Animate toggle attempt (knob tries to move to light theme position)
        knob.style.animation = 'toggleAttempt 0.6s ease-in-out';
        toggleBg.style.animation = 'bgColorFlash 0.6s ease-in-out';
        
        // Add shake animation to the entire button
        button.style.animation = 'shake 0.5s ease-in-out 0.3s';
        
        // Remove animations after they complete
        setTimeout(function() {
            knob.style.animation = '';
            toggleBg.style.animation = '';
            button.style.animation = '';
        }, 900);
        
        // Show custom alert
        this.showHaramAlert();
    },
    
    /**
     * Show "haram" alert modal - Mission Failed style
     */
    showHaramAlert: function() {
        // Create alert overlay
        const overlay = document.createElement('div');
        overlay.id = 'haram-alert';
        overlay.className = 'fixed inset-0 z-[100] flex items-center justify-center bg-black/95 backdrop-blur-md';
        overlay.style.animation = 'fadeIn 0.5s ease-out';
        
        // Create alert box
        const alertBox = document.createElement('div');
        alertBox.className = 'relative max-w-2xl w-full mx-4';
        alertBox.style.animation = 'missionFailedSlide 0.8s ease-out';
        
        // Alert content - Mission Failed style
        alertBox.innerHTML = `
            <!-- Top border accent -->
            <div class="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-red-dawn to-transparent"></div>
            
            <!-- Main content -->
            <div class="relative bg-gradient-to-br from-gunmetal-gray/90 to-black-base/90 backdrop-blur-sm border-2 border-red-dawn/50 p-8 sm:p-12 text-center overflow-hidden">
                <!-- Diagonal stripes background -->
                <div class="absolute inset-0 opacity-5 pointer-events-none" style="background: repeating-linear-gradient(45deg, transparent, transparent 10px, #B62828 10px, #B62828 20px);"></div>
                
                <!-- Corner accents -->
                <div class="absolute top-0 left-0 w-4 h-4 border-t-4 border-l-4 border-red-dawn"></div>
                <div class="absolute top-0 right-0 w-4 h-4 border-t-4 border-r-4 border-red-dawn"></div>
                <div class="absolute bottom-0 left-0 w-4 h-4 border-b-4 border-l-4 border-red-dawn"></div>
                <div class="absolute bottom-0 right-0 w-4 h-4 border-b-4 border-r-4 border-red-dawn"></div>
                
                <!-- Content -->
                <div class="relative z-10">
                    <!-- Mission Failed Icon -->
                    <div class="mb-6 flex justify-center">
                        <div class="relative">
                            <svg class="w-20 h-20 sm:w-24 sm:h-24 text-red-dawn mission-failed-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                            </svg>
                            <div class="absolute inset-0 bg-red-dawn/30 blur-2xl animate-pulse"></div>
                        </div>
                    </div>
                    
                    <!-- Status indicator -->
                    <div class="flex items-center justify-center gap-2 mb-4">
                        <div class="w-3 h-3 bg-red-dawn rounded-full animate-pulse"></div>
                        <span class="text-xs sm:text-sm font-mono text-red-dawn tracking-widest uppercase">// System Alert</span>
                    </div>
                    
                    <!-- Mission Failed title -->
                    <h3 class="text-4xl sm:text-5xl md:text-6xl font-russo text-red-dawn mb-6 tracking-wider mission-failed-text">
                        MISSION FAILED
                    </h3>
                    
                    <!-- Custom message -->
                    <div class="mb-8 px-4">
                        <p class="text-lg sm:text-xl md:text-2xl font-roboto-condensed text-text-primary leading-relaxed tracking-wide">
                            Брат, светлая тема это харам!
                        </p>
                    </div>
                    
                    <!-- Divider -->
                    <div class="flex items-center justify-center gap-4 mb-8">
                        <div class="h-px w-16 bg-gradient-to-r from-transparent to-red-dawn"></div>
                        <span class="text-xs font-mono text-text-secondary tracking-wider">ERROR CODE: 418</span>
                        <div class="h-px w-16 bg-gradient-to-l from-transparent to-red-dawn"></div>
                    </div>
                    
                    <!-- Action button -->
                    <button id="close-alert" class="relative group">
                        <div class="relative bg-red-dawn hover:bg-red-crimson border-2 border-red-dawn transition-all px-8 py-3 sm:px-10 sm:py-4">
                            <!-- Button corners -->
                            <div class="absolute top-0 left-0 w-3 h-3 bg-black-base"></div>
                            <div class="absolute top-0 right-0 w-3 h-3 bg-black-base"></div>
                            <div class="absolute bottom-0 left-0 w-3 h-3 bg-black-base"></div>
                            <div class="absolute bottom-0 right-0 w-3 h-3 bg-black-base"></div>
                            
                            <div class="flex items-center justify-center gap-3">
                                <span class="font-russo text-text-primary text-base sm:text-lg tracking-wider uppercase">Понял, принял</span>
                                <svg class="w-5 h-5 text-text-primary transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7l5 5m0 0l-5 5m5-5H6"></path>
                                </svg>
                            </div>
                        </div>
                    </button>
                </div>
            </div>
            
            <!-- Bottom border accent -->
            <div class="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-red-dawn to-transparent"></div>
        `;
        
        overlay.appendChild(alertBox);
        document.body.appendChild(overlay);
        
        // Close alert on button click
        document.getElementById('close-alert').addEventListener('click', function() {
            overlay.style.animation = 'fadeOut 0.4s ease-out';
            setTimeout(function() {
                overlay.remove();
            }, 400);
        });
        
        // Close alert on overlay click
        overlay.addEventListener('click', function(e) {
            if (e.target === overlay) {
                overlay.style.animation = 'fadeOut 0.4s ease-out';
                setTimeout(function() {
                    overlay.remove();
                }, 400);
            }
        });
        
        // Close on ESC key
        const handleEscape = function(e) {
            if (e.key === 'Escape') {
                overlay.style.animation = 'fadeOut 0.4s ease-out';
                setTimeout(function() {
                    overlay.remove();
                    document.removeEventListener('keydown', handleEscape);
                }, 400);
            }
        };
        document.addEventListener('keydown', handleEscape);
    }
};

// Initialize theme toggle when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    ThemeToggle.init();
});
