import moment from 'moment';

export const formatDate = (dateString) => {
  return moment(dateString).format('MMMM D, YYYY');
};

export const formatDateTime = (dateString) => {
  return moment(dateString).format('MMMM D, YYYY h:mm A');
};

export const fromNow = (dateString) => {
  return moment(dateString).fromNow();
};

export const getCurrentDateTime = () => {
  return moment().format('YYYY-MM-DD HH:mm:ss');
};

export const getCurrentDateFormatted = () => {
  return moment().format('MMMM D, YYYY');
};

// Format relative to current time (2025-06-02 14:23:14)
export const getAppCurrentDateTime = () => {
  return '2025-06-02 14:23:14';
};

export const getAppCurrentDateTimeFormatted = () => {
  return moment('2025-06-02 14:23:14').format('MMMM D, YYYY h:mm A');
};

export const getAppCurrentDateFormatted = () => {
  return moment('2025-06-02 14:23:14').format('MMMM D, YYYY');
};