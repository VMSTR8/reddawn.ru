/**
 * Equipment Animator Module
 * Handles scroll-triggered animations for equipment/loadout cards
 * 
 * @author Maxim VMSTR8 Vinokurov
 * @since 2025
 */

'use strict';

const EquipmentAnimator = {
    /**
     * Configuration
     */
    config: {
        threshold: 0.2,
        rootMargin: '0px'
    },
    
    /**
     * Initialize equipment card animations
     */
    init: function() {
        this.initObserver();
    },
    
    /**
     * Initialize Intersection Observer for equipment cards
     */
    initObserver: function() {
        const observer = new IntersectionObserver(
            function(entries) {
                entries.forEach(function(entry) {
                    if (entry.isIntersecting) {
                        entry.target.classList.remove('opacity-0', 'translate-y-10');
                        entry.target.classList.add('opacity-100', 'translate-y-0');
                    }
                });
            },
            {
                threshold: this.config.threshold,
                rootMargin: this.config.rootMargin
            }
        );
        
        // Observe all equipment cards
        const equipmentCards = document.querySelectorAll('.equipment-card');
        equipmentCards.forEach(function(card) {
            observer.observe(card);
        });
    }
};
