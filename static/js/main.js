/**
 * Main JavaScript Module
 * Core functionality for Red Dawn website
 * 
 * This module initializes all other modules and provides global utilities
 * 
 * @author Maxim VMSTR8 Vinokurov
 * @since 2025
 */

'use strict';

/**
 * Main App Object
 * Namespace for all website functionality
 */
const RedDawnApp = {
    /**
     * Initialize all modules with optimized batching to prevent forced reflow
     */
    init: function() {
        const self = this;
        
        // Critical modules first (in one batch)
        requestAnimationFrame(function() {
            // Read phase: Check which modules exist
            const hasScrollManager = typeof ScrollManager !== 'undefined';
            const hasSnapScrollManager = typeof SnapScrollManager !== 'undefined';
            
            // Write phase: Initialize critical modules
            if (hasScrollManager) {
                ScrollManager.init();
            }
            if (hasSnapScrollManager) {
                SnapScrollManager.init();
            }
            
            // Schedule non-critical modules after paint
            requestIdleCallback ? 
                requestIdleCallback(function() { self.initSecondaryModules(); }) :
                setTimeout(function() { self.initSecondaryModules(); }, 100);
        });
    },
    
    /**
     * Initialize non-critical modules (stats, animations, forms)
     */
    initSecondaryModules: function() {
        // Batch all secondary module checks and inits
        requestAnimationFrame(function() {
            if (typeof StatsCounter !== 'undefined') {
                StatsCounter.init();
            }
            
            if (typeof EquipmentAnimator !== 'undefined') {
                EquipmentAnimator.init();
            }
            
            if (typeof FormHandler !== 'undefined') {
                FormHandler.init();
            }
            
            if (typeof MissionTimer !== 'undefined') {
                MissionTimer.init();
            }
        });
    }
};

/**
 * Global viewport cache (shared across all modules)
 * Prevents multiple window.innerWidth/innerHeight reads
 */
window.RedDawnViewport = {
    width: 0,
    height: 0,
    update: function() {
        this.width = window.innerWidth;
        this.height = window.innerHeight;
    }
};

/**
 * Initialize app when DOM is fully loaded
 * Use requestAnimationFrame to avoid forced reflow during initialization
 */
document.addEventListener('DOMContentLoaded', function() {
    // Cache viewport dimensions once at start
    window.RedDawnViewport.update();
    
    // Initialize app in next frame to avoid blocking initial paint
    requestAnimationFrame(function() {
        RedDawnApp.init();
    });
    
    // Update viewport cache on resize (throttled)
    let resizeTimeout;
    window.addEventListener('resize', function() {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(function() {
            window.RedDawnViewport.update();
        }, 150);
    }, { passive: true });
});
