// Railway Connection Monitor
// Automatically switches from offline mode to Railway database when available

const { Pool } = require('pg');

class RailwayMonitor {
  constructor(connectionConfig, onConnectionRestored) {
    this.connectionConfig = connectionConfig;
    this.onConnectionRestored = onConnectionRestored;
    this.isConnected = false;
    this.checkInterval = null;
    this.retryCount = 0;
    this.maxRetries = 5; // Maximum failed attempts before backing off
    
    console.log('🔍 Railway Monitor initialized - checking every 30 seconds');
  }

  async testConnection() {
    try {
      const pool = new Pool(this.connectionConfig);
      
      // Quick test with 5 second timeout
      const result = await Promise.race([
        pool.query('SELECT NOW() as current_time, \'Railway connection restored\' as status'),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('CONNECTION_TIMEOUT')), 5000)
        )
      ]);
      
      await pool.end();
      return { success: true, data: result.rows[0] };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async checkConnection() {
    const timestamp = new Date().toISOString();
    console.log(`\n🔍 [${timestamp}] Checking Railway connection (attempt ${this.retryCount + 1}/${this.maxRetries})...`);

    const result = await this.testConnection();
    
    if (result.success) {
      console.log('✅ Railway database is back online!');
      console.log('📊 Connection test result:', result.data);
      
      if (!this.isConnected) {
        this.isConnected = true;
        this.retryCount = 0;
        
        console.log('🔄 Switching from OFFLINE mode to RAILWAY database...');
        
        // Notify the callback to switch back to Railway
        if (this.onConnectionRestored) {
          await this.onConnectionRestored();
        }
        
        console.log('🎉 Successfully switched back to Railway database!');
        
        // Stop monitoring once connected
        this.stopMonitoring();
      }
    } else {
      this.retryCount++;
      console.log(`❌ Railway still unavailable: ${result.error}`);
      
      if (this.retryCount >= this.maxRetries) {
        console.log(`⚠️  Reached max retries (${this.maxRetries}). Backing off to 2-minute intervals.`);
        this.retryCount = 0; // Reset for next cycle
        
        // Switch to longer interval after max retries
        if (this.checkInterval) {
          clearInterval(this.checkInterval);
          this.checkInterval = setInterval(() => this.checkConnection(), 120000); // 2 minutes
        }
      }
    }
  }

  startMonitoring() {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
    }
    
    // Initial check
    this.checkConnection();
    
    // Check every 30 seconds initially
    this.checkInterval = setInterval(() => this.checkConnection(), 30000);
    
    console.log('🚀 Railway monitoring started');
  }

  stopMonitoring() {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = null;
    }
    console.log('🛑 Railway monitoring stopped');
  }

  getStatus() {
    return {
      isConnected: this.isConnected,
      isMonitoring: !!this.checkInterval,
      retryCount: this.retryCount
    };
  }
}

module.exports = RailwayMonitor;