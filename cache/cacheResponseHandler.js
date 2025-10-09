// cache/cacheResponseHandler.js
import { clearAllUsersListCache, clearUsersListCache } from './list.js';
import { clearUsersWithoutIdCache, clearUserDetailCache } from './detail.js';
import { clearUserDashboardCache } from './dashboard.js';

 
 
export const handleUserCacheAndHeaders = async ({ role, page, sortBy, order, id, clearDetailCache = false, clearAllListCache = false },res) => {
  const cacheTasks = [
    clearAllListCache  ? clearAllUsersListCache()  : clearUsersListCache({ role, page, sortBy, order }),
    clearDetailCache ? clearUsersWithoutIdCache() : clearUserDetailCache(id),
    clearUserDashboardCache() 
];
  const results = await Promise.allSettled(cacheTasks);
  const labels = ['List', 'Detail', 'Dashboard'];
  results.forEach((result, index) => {
    const label = labels[index];
    if (result.status === 'fulfilled') {
      console.log(`✅ ${label} - cache cleared`);
    } else {
      console.error(`❌ Failed to clear ${label} cache:`, result.reason);
    }
  });
  // Optional delay for cache propagation
  await new Promise(resolve => setTimeout(resolve, 100));
  // Set no-cache headers
  res.set({
    'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
    'Pragma': 'no-cache',
    'Expires': '0',
    'Surrogate-Control': 'no-store'
  });
};
