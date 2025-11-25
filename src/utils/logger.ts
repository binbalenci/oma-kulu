import * as Sentry from '@sentry/react-native';

interface LogContext {
  operation?: string;
  [key: string]: any;
}

interface User {
  id?: string;
  email?: string;
  username?: string;
  [key: string]: any;
}

class Logger {
  private static instance: Logger;
  private user: User | null = null;
  private environment: string = 'development';

  private constructor() {
    // Private constructor for singleton pattern
  }

  public static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger();
    }
    return Logger.instance;
  }

  /**
   * Capture errors with context
   */
  public error(error: Error | string, context?: LogContext): void {
    const errorObj = typeof error === 'string' ? new Error(error) : error;

    Sentry.withScope((scope) => {
      if (context) {
        scope.setContext('operation', context);
        Object.keys(context).forEach(key => {
          if (key !== 'operation') {
            scope.setExtra(key, context[key]);
          }
        });
      }
      scope.setLevel('error');
      Sentry.captureException(errorObj);
    });

    // Also log to console in development
    if (__DEV__) {
      console.error('Logger Error:', errorObj, context);
    }
  }

  /**
   * Capture info messages
   */
  public info(message: string, data?: any): void {
    Sentry.addBreadcrumb({
      message,
      level: 'info',
      data,
    });

    if (__DEV__) {
      console.log('Logger Info:', message, data);
    }
  }

  /**
   * Capture warnings
   */
  public warning(message: string, data?: any): void {
    Sentry.addBreadcrumb({
      message,
      level: 'warning',
      data,
    });

    if (__DEV__) {
      console.warn('Logger Warning:', message, data);
    }
  }

  /**
   * Add breadcrumbs for tracking user journey
   */
  public breadcrumb(message: string, category?: string, data?: any): void {
    Sentry.addBreadcrumb({
      message,
      category: category || 'user',
      level: 'info',
      data,
    });

    if (__DEV__) {
      console.log('Logger Breadcrumb:', message, { category, data });
    }
  }

  /**
   * Track user actions
   */
  public userAction(action: string, data?: any): void {
    const context = {
      operation: 'user_action',
      action,
      ...data,
    };

    Sentry.addBreadcrumb({
      message: `User Action: ${action}`,
      category: 'user_action',
      level: 'info',
      data: context,
    });

    if (__DEV__) {
      console.log('Logger User Action:', action, data);
    }
  }

  /**
   * Track data operations
   */
  public dataAction(action: string, data?: any): void {
    const context = {
      operation: 'data_action',
      action,
      ...data,
    };

    Sentry.addBreadcrumb({
      message: `Data Action: ${action}`,
      category: 'data_action',
      level: 'info',
      data: context,
    });

    if (__DEV__) {
      console.log('Logger Data Action:', action, data);
    }
  }

  /**
   * Track navigation
   */
  public navigationAction(screen: string, data?: any): void {
    const context = {
      operation: 'navigation',
      screen,
      ...data,
    };

    Sentry.addBreadcrumb({
      message: `Navigation: ${screen}`,
      category: 'navigation',
      level: 'info',
      data: context,
    });

    if (__DEV__) {
      console.log('Logger Navigation:', screen, data);
    }
  }

  /**
   * Track database errors
   */
  public databaseError(error: Error | string, operation: string, context?: LogContext): void {
    const errorObj = typeof error === 'string' ? new Error(error) : error;
    const dbContext = {
      operation: 'database_error',
      dbOperation: operation,
      ...context,
    };

    Sentry.withScope((scope) => {
      scope.setContext('database', dbContext);
      scope.setLevel('error');
      scope.setTag('database_operation', operation);
      Sentry.captureException(errorObj);
    });

    if (__DEV__) {
      console.error('Logger Database Error:', errorObj, dbContext);
    }
  }

  /**
   * Track database success
   */
  public databaseSuccess(operation: string, context?: LogContext): void {
    const dbContext = {
      operation: 'database_success',
      dbOperation: operation,
      ...context,
    };

    Sentry.addBreadcrumb({
      message: `Database Success: ${operation}`,
      category: 'database',
      level: 'info',
      data: dbContext,
    });

    if (__DEV__) {
      console.log('Logger Database Success:', operation, context);
    }
  }

  /**
   * Track performance warnings
   */
  public performanceWarning(operation: string, duration: number, threshold: number = 3000): void {
    if (duration > threshold) {
      const context = {
        operation: 'performance_warning',
        performanceOperation: operation,
        duration,
        threshold,
      };

      Sentry.addBreadcrumb({
        message: `Performance Warning: ${operation} took ${duration}ms`,
        category: 'performance',
        level: 'warning',
        data: context,
      });

      if (__DEV__) {
        console.warn('Logger Performance Warning:', operation, `${duration}ms`, `(threshold: ${threshold}ms)`);
      }
    }
  }

  /**
   * Set user context
   */
  public setUser(user: User): void {
    this.user = user;
    Sentry.setUser(user);

    if (__DEV__) {
      console.log('Logger User Set:', user);
    }
  }

  /**
   * Add tags
   */
  public setTag(key: string, value: string): void {
    Sentry.setTag(key, value);

    if (__DEV__) {
      console.log('Logger Tag Set:', key, value);
    }
  }

  /**
   * Set environment
   */
  public setEnvironment(env: string): void {
    this.environment = env;
    Sentry.setTag('environment', env);

    if (__DEV__) {
      console.log('Logger Environment Set:', env);
    }
  }

  /**
   * Critical error handling
   */
  public critical(error: Error | string, context?: LogContext): void {
    const errorObj = typeof error === 'string' ? new Error(error) : error;

    Sentry.withScope((scope) => {
      if (context) {
        scope.setContext('operation', context);
        Object.keys(context).forEach(key => {
          if (key !== 'operation') {
            scope.setExtra(key, context[key]);
          }
        });
      }
      scope.setLevel('fatal');
      scope.setTag('severity', 'critical');
      Sentry.captureException(errorObj);
    });

    // Always log critical errors
    console.error('Logger Critical Error:', errorObj, context);
  }
}

// Create singleton instance
const logger = Logger.getInstance();

// Export convenience functions
export const logError = (error: Error | string, context?: LogContext) => logger.error(error, context);
export const logInfo = (message: string, data?: any) => logger.info(message, data);
export const logWarning = (message: string, data?: any) => logger.warning(message, data);
export const logBreadcrumb = (message: string, category?: string, data?: any) => logger.breadcrumb(message, category, data);
export const logUserAction = (action: string, data?: any) => logger.userAction(action, data);
export const logDataAction = (action: string, data?: any) => logger.dataAction(action, data);
export const logNavigation = (screen: string, data?: any) => logger.navigationAction(screen, data);
export const logDatabaseError = (error: Error | string, operation: string, context?: LogContext) => logger.databaseError(error, operation, context);
export const logDatabaseSuccess = (operation: string, context?: LogContext) => logger.databaseSuccess(operation, context);
export const logCritical = (error: Error | string, context?: LogContext) => logger.critical(error, context);

// Export the logger instance for advanced usage
export default logger;
