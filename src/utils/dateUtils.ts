export const getDateRange = (period: string) => {
  const now = new Date();
  const endDate = now.toISOString();
  let startDate: string;

  switch (period) {
    case '7d':
      startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();
      break;
    case '30d':
      startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString();
      break;
    case '90d':
      startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000).toISOString();
      break;
    case '12m':
      startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000).toISOString();
      break;
    default:
      startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString();
  }

  return {
    date_min: startDate,
    date_max: endDate
  };
};

export const formatDateForChart = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', { 
    month: 'short', 
    day: 'numeric' 
  });
};

export const groupDataByPeriod = (data: unknown[], dateField: string, period: 'day' | 'week' | 'month') => {
  // Ensure data is an array
  if (!Array.isArray(data)) {
    return [];
  }

  const grouped = data.reduce((acc, item) => {
    const date = new Date(item[dateField]);
    let key: string;

    switch (period) {
      case 'day':
        key = date.toISOString().split('T')[0];
        break;
      case 'week':
        const startOfWeek = new Date(date);
        startOfWeek.setDate(date.getDate() - date.getDay());
        key = startOfWeek.toISOString().split('T')[0];
        break;
      case 'month':
        key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        break;
      default:
        key = date.toISOString().split('T')[0];
    }

    if (!acc[key]) {
      acc[key] = [];
    }
    acc[key].push(item);
    return acc;
  }, {} as Record<string, any[]>);

  return Object.entries(grouped).map(([key, items]) => ({
    period: key,
    count: items.length,
    items
  })).sort((a, b) => a.period.localeCompare(b.period));
};
