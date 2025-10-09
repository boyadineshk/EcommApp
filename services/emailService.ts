// services/emailService.ts - SIMPLIFIED & SAFE VERSION
import AsyncStorage from '@react-native-async-storage/async-storage';

// ⚠️ IMPORTANT: Change this to YOUR computer's IP address
// Find it: ipconfig (Windows) or ifconfig (Mac/Linux)
const API_BASE_URL = 'http://10.251.145.69:3001';

// ✅ Safe email service that won't crash your app
export const emailService = {
// 1️⃣ Registration Email
async sendRegistrationEmail(email: string, username: string): Promise<boolean> {
    try {
      console.log('📧 Attempting to send registration email...');

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout

      const response = await fetch(`${API_BASE_URL}/api/send-registration`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ to: email, username }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      if (result.success) {
        console.log('✅ Registration email sent successfully');
        await this.logEmail('registration', email, username);
        return true;
      }

      throw new Error(result.error || 'Failed to send email');
    } catch (error: any) {
      console.log('⚠️ Registration email failed:', error.message);
      await this.logEmail('registration_failed', email, username);
      return false; // Return false instead of throwing
    }
  },

  // 2️⃣ Login Email
  async sendLoginEmail(email: string, username: string): Promise<boolean> {
    try {
      console.log('📧 Attempting to send login email...');

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);

      const response = await fetch(`${API_BASE_URL}/api/send-login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ to: email, username }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      if (result.success) {
        console.log('✅ Login email sent successfully');
        await this.logEmail('login', email, username);
        return true;
      }

      throw new Error(result.error || 'Failed to send email');
    } catch (error: any) {
      console.log('⚠️ Login email failed:', error.message);
      await this.logEmail('login_failed', email, username);
      return false;
    }
  },

  // 3️⃣ Order Success Email
  async sendOrderSuccessEmail(
    email: string,
    orderDetails: any,
    user: any
  ): Promise<boolean> {
    try {
      console.log('📧 Attempting to send order success email...');

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);

      const response = await fetch(`${API_BASE_URL}/api/send-order-success`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ to: email, user, order: orderDetails }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      if (result.success) {
        console.log('✅ Order success email sent successfully');
        await this.logEmail('order_success', email, user.username, orderDetails);
        return true;
      }

      throw new Error(result.error || 'Failed to send email');
    } catch (error: any) {
      console.log('⚠️ Order success email failed:', error.message);
      await this.logEmail('order_success_failed', email, user.username, orderDetails);
      return false;
    }
  },

  // 4️⃣ Order Failure Email
  async sendOrderFailureEmail(
    email: string,
    orderDetails: any,
    user: any,
    reason?: string
  ): Promise<boolean> {
    try {
      console.log('📧 Attempting to send order failure email...');

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);

      const response = await fetch(`${API_BASE_URL}/api/send-order-failure`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: email,
          user,
          order: orderDetails,
          reason: reason || 'Payment processing failed'
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      if (result.success) {
        console.log('✅ Order failure email sent successfully');
        await this.logEmail('order_failure', email, user.username, { ...orderDetails, reason });
        return true;
      }

      throw new Error(result.error || 'Failed to send email');
    } catch (error: any) {
      console.log('⚠️ Order failure email failed:', error.message);
      await this.logEmail('order_failure_failed', email, user.username, { ...orderDetails, reason });
      return false;
    }
  },

  // 🏥 Health Check
  async checkServerHealth(): Promise<boolean> {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3000);

      const response = await fetch(`${API_BASE_URL}/health`, {
        method: 'GET',
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      const result = await response.json();
      return result.status === 'OK';
    } catch (error) {
      console.log('⚠️ Server health check failed');
      return false;
    }
  },

  // 📝 Log email attempts locally
  async logEmail(type: string, to: string, username: string, data?: any): Promise<void> {
    try {
      const emailLog = {
        type,
        to,
        username,
        data,
        timestamp: new Date().toISOString(),
      };

      const existingLogs = await AsyncStorage.getItem('@email_logs');
      const logs = existingLogs ? JSON.parse(existingLogs) : [];

      logs.push(emailLog);

      // Keep only last 50 logs
      if (logs.length > 50) {
        logs.splice(0, logs.length - 50);
      }

      await AsyncStorage.setItem('@email_logs', JSON.stringify(logs));
    } catch (error) {
      console.log('Failed to log email:', error);
    }
  },

  // 📊 Get email logs
  async getEmailLogs(): Promise<any[]> {
    try {
      const logs = await AsyncStorage.getItem('@email_logs');
      return logs ? JSON.parse(logs) : [];
    } catch {
      return [];
    }
  },

  // 🗑️ Clear logs
  async clearLogs(): Promise<void> {
    try {
      await AsyncStorage.removeItem('@email_logs');
      console.log('✅ Email logs cleared');
    } catch (error) {
      console.log('Failed to clear logs:', error);
    }
  },
};

// Default export
export default emailService;