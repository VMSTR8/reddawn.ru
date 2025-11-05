/**
 * Mobile Menu Module
 * Handles mobile navigation menu toggle
 * 
 * @author Maxim VMSTR8 Vinokurov
 * @since 2025
 */

'use strict';

const MobileMenu = {
    /**
     * DOM Elements
     */
    elements: {
        button: null,
        menu: null,
        menuIcon: null,
        closeIcon: null
    },
    
    /**
     * Initialize mobile menu
     */
    init: function() {
        this.cacheElements();
        this.bindEvents();
    },
    
    /**
     * Cache DOM elements
     */
    cacheElements: function() {
        this.elements.button = document.getElementById('mobile-menu-button');
        this.elements.menu = document.getElementById('mobile-menu');
        this.elements.menuIcon = document.getElementById('menu-icon');
        this.elements.closeIcon = document.getElementById('close-icon');
    },
    
    /**
     * Bind mobile menu events
     */
    bindEvents: function() {
        if (!this.elements.button) return;
        
        const self = this;
        this.elements.button.addEventListener('click', function() {
            self.toggle();
        });
    },
    
    /**
     * Toggle mobile menu visibility
     */
    toggle: function() {
        this.elements.menu.classList.toggle('hidden');
        this.elements.menuIcon.classList.toggle('hidden');
        this.elements.closeIcon.classList.toggle('hidden');
    }
};

// Initialize mobile menu when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    MobileMenu.init();
});
