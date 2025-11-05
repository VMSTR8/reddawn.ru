/**
 * Homepage Module
 * Homepage-specific functionality including stats, equipment cards, and form handling
 * 
 * @author Maxim VMSTR8 Vinokurov
 * @since 2025
 */

'use strict';

/**
 * Homepage Module
 * Initializes all homepage-specific features
 */
const Homepage = {
    /**
     * Initialize homepage functionality
     */
    init: function() {
        // Initialize all modules
        if (typeof MissionTimer !== 'undefined') {
            MissionTimer.init();
        }
        
        if (typeof StatsCounter !== 'undefined') {
            StatsCounter.init();
        }
        
        if (typeof EquipmentAnimator !== 'undefined') {
            EquipmentAnimator.init();
        }
        
        // FormHandler инициализируется в main.js, не дублируем
        // if (typeof FormHandler !== 'undefined') {
        //     FormHandler.init();
        // }
    }
};

// Initialize homepage when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    Homepage.init();
});
