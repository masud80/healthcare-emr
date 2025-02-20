import { format } from 'date-fns';

export const setup_logger = () => {
  return {
    info: (message) => {
      const timestamp = format(new Date(), 'yyyy-MM-dd HH:mm:ss');
      console.log(`[${timestamp}] INFO: ${message}`);
    },
    error: (message) => {
      const timestamp = format(new Date(), 'yyyy-MM-dd HH:mm:ss');
      console.error(`[${timestamp}] ERROR: ${message}`);
    },
    warn: (message) => {
      const timestamp = format(new Date(), 'yyyy-MM-dd HH:mm:ss');
      console.warn(`[${timestamp}] WARN: ${message}`);
    }
  };
};
