/**
 * Stats Counter Module
 * Animates numerical statistics when they come into view
 * 
 * @author Maxim VMSTR8 Vinokurov
 * @since 2025
 */

'use strict';

const StatsCounter = {
    /**
     * Configuration
     */
    config: {
        duration: 2000, // Animation duration in ms
        threshold: 0.5, // IntersectionObserver threshold
    },
    
    /**
     * Initialize stats counter
     */
    init: function() {
        this.setDynamicCounters();
        this.initObserver();
    },
    
    /**
     * Animate a single counter element
     * @param {HTMLElement} element - Counter element to animate
     */
    animateCounter: function(element) {
        const target = parseInt(element.getAttribute('data-target'));
        const suffix = element.getAttribute('data-suffix') || '';
        const increment = target / (this.config.duration / 16); // 60fps
        let current = 0;
        
        const updateCounter = function() {
            current += increment;
            if (current < target) {
                element.textContent = Math.floor(current) + suffix;
                requestAnimationFrame(updateCounter);
            } else {
                element.textContent = target + suffix;
            }
        };
        
        updateCounter();
    },
    
    /**
     * Initialize Intersection Observer for stats animation
     */
    initObserver: function() {
        const self = this;
        
        const observer = new IntersectionObserver(
            function(entries) {
                entries.forEach(function(entry) {
                    if (entry.isIntersecting) {
                        const counters = entry.target.querySelectorAll('.counter');
                        counters.forEach(function(counter) {
                            if (!counter.classList.contains('animated')) {
                                counter.classList.add('animated');
                                self.animateCounter(counter);
                            }
                        });
                    }
                });
            },
            {
                threshold: this.config.threshold,
                rootMargin: '0px'
            }
        );
        
        // Observe the about section
        const aboutSection = document.getElementById('about-section');
        if (aboutSection) {
            observer.observe(aboutSection);
        }
    },
    
    /**
     * Calculate years in airsoft from 01.07.2014
     * @returns {number} Years since founding
     */
    calculateYearsInAirsoft: function() {
        const startDate = new Date('2014-07-01');
        const currentDate = new Date();
        const diffTime = Math.abs(currentDate - startDate);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        const years = Math.floor(diffDays / 365.25); // Account for leap years
        return years;
    },
    
    /**
     * Set dynamic counter values (like years in airsoft)
     */
    setDynamicCounters: function() {
        const counters = document.querySelectorAll('.counter');
        if (counters.length > 0) {
            // First counter is years in airsoft
            counters[0].setAttribute('data-target', this.calculateYearsInAirsoft());
        }
    },
    
    /**
     * Load stats from API (for future use)
     * @returns {Promise<Object>} Stats data from API
     */
    loadStatsFromAPI: async function() {
        try {
            // Uncomment and replace URL when API is ready
            // const response = await fetch('https://your-api-url.com/stats');
            // const data = await response.json();
            
            // Example API response structure:
            // {
            //   "years_in_airsoft": 8,
            //   "team_members": 25,
            //   "games_played": 150,
            //   "win_rate": 95
            // }
            
            // Update counters with API data:
            // const counters = document.querySelectorAll('.counter');
            // counters[0].setAttribute('data-target', data.years_in_airsoft);
            // counters[1].setAttribute('data-target', data.team_members);
            // counters[2].setAttribute('data-target', data.games_played);
            // counters[3].setAttribute('data-target', data.win_rate);
            
        } catch (error) {
            console.error('[StatsCounter] Error loading stats from API:', error);
        }
    }
};
