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
     * Initialize all modules
     */
    init: function() {
        console.log('[Red Dawn] Initializing application...');
        
        // Initialize modules if their functions exist
        if (typeof ScrollManager !== 'undefined') {
            ScrollManager.init();
        }
        
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
        
        console.log('[Red Dawn] Application initialized successfully');
    }
};

/**
 * Initialize app when DOM is fully loaded
 */
document.addEventListener('DOMContentLoaded', function() {
    RedDawnApp.init();
});
