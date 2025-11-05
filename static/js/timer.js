/**
 * Mission Timer Module
 * Updates mission time display in real-time
 * 
 * @author Maxim VMSTR8 Vinokurov
 * @since 2025
 */

'use strict';

const MissionTimer = {
    /**
     * Configuration
     */
    config: {
        updateInterval: 60000 // Update every minute
    },
    
    /**
     * Timer interval ID
     */
    intervalId: null,
    
    /**
     * Initialize mission timer
     */
    init: function() {
        this.updateMissionTime();
        this.startTimer();
    },
    
    /**
     * Update mission time display
     */
    updateMissionTime: function() {
        const now = new Date();
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');
        const timeElement = document.querySelector('.mission-time');
        
        if (timeElement) {
            timeElement.textContent = `TIME: ${hours}:${minutes}`;
        }
    },
    
    /**
     * Start timer to update time periodically
     */
    startTimer: function() {
        const self = this;
        this.intervalId = setInterval(function() {
            self.updateMissionTime();
        }, this.config.updateInterval);
    },
    
    /**
     * Stop timer
     */
    stopTimer: function() {
        if (this.intervalId) {
            clearInterval(this.intervalId);
            this.intervalId = null;
        }
    }
};
