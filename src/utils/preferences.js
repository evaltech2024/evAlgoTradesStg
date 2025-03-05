import { Preferences } from '@capacitor/preferences';
import { auth, db } from '../firebaseConfig';
import { doc, setDoc, getDoc, collection, query, getDocs, where, Timestamp, orderBy } from "firebase/firestore";

// Get and store custom user data from Firestore
export const getAndStoreCustomUser = async () => {
    try {
        const customUserPref = await Preferences.get({ key: 'customUser' });
        if (customUserPref.value) return JSON.parse(customUserPref.value);
        const userPref = await Preferences.get({ key: 'user_info' });
        if (!userPref) return null;
        const userId = JSON.parse(userPref.value).uid;
        console.log('User ID:', userId);

        const userDoc = await getDoc(doc(db, 'customUser', userId));
        if (userDoc.exists()) {
            const userData = userDoc.data();
            console.log('User data:', userData);
            await setStoredApprovalStatus(userData.approvalStatus);
            await Preferences.set({
                key: `customUser`,
                value: JSON.stringify(userData)
            });
            return userData;
        }
        return null;
    } catch (error) {
        console.error('Error getting/storing custom user:', error);
        return null;
    }
};
// Get stored approval status
export const getStoredApprovalStatus = async () => {
  try {
    const { value } = await Preferences.get({ key: `approvalStatus` });
    return value ? parseInt(value) : null;
  } catch (error) {
    console.error('Error getting stored approval status:', error);
    return null;
  }
};

// Set stored approval status
export const setStoredApprovalStatus = async (status) => {
  try {
    await Preferences.set({
      key: `approvalStatus`,
      value: status.toString()
    });
  } catch (error) {
    console.error('Error setting stored approval status:', error);
  }
};

// Helper function to convert Firestore timestamps to strings
const convertTimestampForStorage = (data) => {
  if (!data) return data;
  
  // Deep clone the object to avoid modifying the original
  const clonedData = JSON.parse(JSON.stringify(data));
  
  // Convert each object's timestamps to ISO strings
  return clonedData.map(item => {
    // Convert timestamp fields to ISO strings
    if (item.start && typeof item.start !== 'string') {
      item.start = item.start.seconds ? new Date(item.start.seconds * 1000).toISOString() : new Date(item.start).toISOString();
    }
    if (item.detected_at && typeof item.detected_at !== 'string') {
      item.detected_at = item.detected_at.seconds ? new Date(item.detected_at.seconds * 1000).toISOString() : new Date(item.detected_at).toISOString();
    }
    
    return item;
  });
};

// Helper function to convert timestamp strings back to Date objects
const convertTimestampFromStorage = (data) => {
  if (!data) return data;
  
  return data.map(item => {
    if (item.start && typeof item.start === 'string') {
      item.start = new Date(item.start);
      item.detected_atDate = new Date(item.start);
    }
    if (item.detected_at && typeof item.detected_at === 'string') {
      item.detected_at = new Date(item.detected_at);
    }
    
    return item;
  });
};

// Get and store active trades from Firestore
export const getAndStoreActiveTrades = async (forceRefresh = false) => {
  try {
    // Check if we have cached data and it's not a forced refresh
    // if (!forceRefresh) {
      const cachedTrades = await getStoredActiveTrades();
      if (cachedTrades && cachedTrades.length > 0) {
        console.log('Using cached active trades');
        return cachedTrades;
      }
    // }
    
    // Fetch from Firestore if no cached data or forced refresh
    console.log('Fetching active trades from Firestore');
    const activeTradesQuery = query(collection(db, "activeTrades"));
    const activeTradesSnapshot = await getDocs(activeTradesQuery);
    
    const activeTrades = activeTradesSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    console.log('Active trades:', activeTrades);
    // Convert timestamps before storing
    const processedTrades = convertTimestampForStorage(activeTrades);
    
    // Store in preferences
    await setStoredActiveTrades(processedTrades);
    
    // Return the original data with proper date objects
    return activeTrades;
  } catch (error) {
    console.error('Error fetching/storing active trades:', error);
    return [];
  }
};

// Get active trades from storage
export const getStoredActiveTrades = async () => {
  try {
    const { value } = await Preferences.get({ key: 'activeTrades' });
    if (!value) return null;
    
    const parsedData = JSON.parse(value);
    return convertTimestampFromStorage(parsedData);
  } catch (error) {
    console.error('Error getting stored active trades:', error);
    return null;
  }
};

// Get user active trades from storage
export const getStoredUserActiveTrades = async () => {
    try {
        const userPref = await Preferences.get({ key: 'user_info' });
        if (!userPref) return null;
        const userId = JSON.parse(userPref.value).uid;
        console.log('User ID:', userId);
      const { value } = await Preferences.get({ key: 'activeTrades' });
      if (!value) return null;
    const parsedData = JSON.parse(value);
    console.log('Parsed data:', parsedData);
    // Check if user exists in userList and filter trades for this user's ID
    const userTrades = parsedData.filter(trade => {
        const userList = trade.usersList || [];
        return userList.includes(userId);
    });
    return convertTimestampFromStorage(userTrades);
    } catch (error) {
      console.error('Error getting stored active trades:', error);
      return null;
    }
  };
// Store active trades in preferences
export const setStoredActiveTrades = async (trades) => {
  try {
    await Preferences.set({
      key: 'activeTrades',
      value: JSON.stringify(trades)
    });
    // Also store the last update timestamp
    // await Preferences.set({
    //   key: 'activeTradesLastUpdate',
    //   value: new Date().toISOString()
    // });
  } catch (error) {
    console.error('Error setting active trades in storage:', error);
  }
};

// Get and store stock snapshots from Firestore
export const getAndStoreStockSnapshots = async (forceRefresh = false) => {
  try {
    // Check if we have cached data and it's not a forced refresh
    // if (!forceRefresh) {
      const cachedSnapshots = await getStoredStockSnapshots();
      if (cachedSnapshots) {
        console.log('Using cached stock snapshots');
        return cachedSnapshots;
      }
    // }
    
    // Fetch from Firestore if no cached data or forced refresh
    console.log('Fetching stock snapshots from Firestore');
    const stockSnapshotQuery = query(collection(db, "stockSnapshot"), where("symbol", "==", "ALL"));
    const stockSnapshotSnapshot = await getDocs(stockSnapshotQuery);
    
    if (stockSnapshotSnapshot.empty) {
      return null;
    }
    
    const stockSnapshots = stockSnapshotSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }))[0];
    
    // Store in preferences
    await setStoredStockSnapshots(stockSnapshots);
    
    return stockSnapshots;
  } catch (error) {
    console.error('Error fetching/storing stock snapshots:', error);
    return null;
  }
};

// Get stock snapshots from storage
export const getStoredStockSnapshots = async () => {
  try {
    const { value } = await Preferences.get({ key: 'stockSnapshots' });
    return value ? JSON.parse(value) : null;
  } catch (error) {
    console.error('Error getting stored stock snapshots:', error);
    return null;
  }
};

// Store stock snapshots in preferences
export const setStoredStockSnapshots = async (snapshots) => {
  try {
    await Preferences.set({
      key: 'stockSnapshots',
      value: JSON.stringify(snapshots)
    });
    // Also store the last update timestamp
    await Preferences.set({
      key: 'stockSnapshotsLastUpdate',
      value: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error setting stock snapshots in storage:', error);
  }
};

// Helper function to check if cached data is stale (older than specified minutes)
export const isCacheStale = async (key, minutes = 5) => {
  try {
    const { value } = await Preferences.get({ key: `${key}LastUpdate` });
    if (!value) return true;
    
    const lastUpdate = new Date(value);
    const now = new Date();
    const diffMs = now - lastUpdate;
    const diffMinutes = diffMs / (1000 * 60);
    
    return diffMinutes > minutes;
  } catch (error) {
    console.error(`Error checking if ${key} cache is stale:`, error);
    return true; // If there's an error, assume cache is stale
  }
};

// ------------ LAST UPDATED AT ------------ //
// Get and store lastUpdatedAt data
export const getAndStoreLastUpdatedAt = async (forceRefresh = false) => {
  try {
    // if (!forceRefresh) {
      const cachedData = await getStoredLastUpdatedAt();
      if (cachedData) {
        console.log('Using cached lastUpdatedAt');
        return cachedData;
      }
    // }
    
    console.log('Fetching lastUpdatedAt from Firestore');
    // Query the lastUpdatedAt collection - assuming there's a single document or we want the latest one
    const lastUpdatedQuery = query(collection(db, "lastUpdatedAt"));
    const lastUpdatedSnapshot = await getDocs(lastUpdatedQuery);
    
    if (lastUpdatedSnapshot.empty) {
      return null;
    }
    
    const lastUpdatedData = {
      id: lastUpdatedSnapshot.docs[0].id,
      ...lastUpdatedSnapshot.docs[0].data()
    };
    // Process timestamps for storage
    const processedData = lastUpdatedData.map(item => {
        const processed = { ...item };
        // Process any timestamp fields
        if (processed.lastUpdated && typeof processed.lastUpdated !== 'string') {
            processed.lastUpdatedDate = processed.lastUpdated.seconds ? new Date(processed.lastUpdated.seconds * 1000).toISOString() : new Date(processed.lastUpdated).toISOString();
            // delete processed.end; // Remove the original timestamp
        }
        return processed;
        });
    // Store in preferences
    await setStoredLastUpdatedAt(processedData);
    
    return processedData;
  } catch (error) {
    console.error('Error fetching/storing lastUpdatedAt:', error);
    return null;
  }
};

export const getStoredLastUpdatedAt = async () => {
  try {
    const { value } = await Preferences.get({ key: 'lastUpdatedAt' });
    return value ? JSON.parse(value) : null;
  } catch (error) {
    console.error('Error getting stored lastUpdatedAt:', error);
    return null;
  }
};

export const setStoredLastUpdatedAt = async (data) => {
  try {
    await Preferences.set({
      key: 'lastUpdatedAt',
      value: JSON.stringify(data)
    });
    // await Preferences.set({
    //   key: 'lastUpdatedAtLastUpdate',
    //   value: new Date().toISOString()
    // });
  } catch (error) {
    console.error('Error storing lastUpdatedAt:', error);
  }
};

// ------------ STOCK HISTORY ------------ //
// Get and store stockHistory data
export const getAndStoreStockHistory = async (days = 5, forceRefresh = false) => {
  try {
    const cacheKey = 'stockHistory_all';
    
    // if (!forceRefresh) {
      const cachedData = await getStoredStockHistory();
      if (cachedData) {
        // console.log(`Using cached stock history for ${symbol || 'all symbols'}`);
        return cachedData;
      }
    // }
    
    // console.log(`Fetching stock history for ${symbol || 'all symbols'} from Firestore`);
    
    // Calculate date cutoff
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);
    const cutoffTimestamp = Timestamp.fromDate(cutoffDate);
    
    // Build the query based on whether we want one symbol or all
    // let stockHistoryQuery;
    // if (symbol) {
    //   stockHistoryQuery = query(
    //     collection(db, "stockHistory"),
    //     where("symbol", "==", symbol),
    //     where("end", ">=", cutoffTimestamp),
    //     orderBy("end", "desc")
    //   );
    // } else {
      stockHistoryQuery = query(
        collection(db, "stockHistory"),
        where("end", ">=", cutoffTimestamp),
        orderBy("end", "desc")
      );
    // }
    
    const stockHistorySnapshot = await getDocs(stockHistoryQuery);
    
    if (stockHistorySnapshot.empty) {
      return [];
    }
    
    const stockHistoryData = stockHistorySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    // Process timestamps for storage
    const processedData = stockHistoryData.map(item => {
      const processed = { ...item };
      // Process any timestamp fields
      if (processed.end && typeof processed.end !== 'string') {
        processed.endDate = processed.end.seconds ? new Date(processed.end.seconds * 1000).toISOString() : new Date(processed.end).toISOString();
        delete processed.end; // Remove the original timestamp
      }
      if (processed.start && typeof processed.start !== 'string') {
        processed.startDate = processed.start.seconds ? new Date(processed.start.seconds * 1000).toISOString() : new Date(processed.start).toISOString();
        delete processed.start; // Remove the original timestamp
      }
      return processed;
    });
    
    // Store in preferences
    await setStoredStockHistory(processedData);
    
    return stockHistoryData;
  } catch (error) {
    console.error(`Error fetching/storing stock history for 'all symbols':`, error);
    return [];
  }
};

export const getStoredStockHistory = async () => {
  try {
    // const cacheKey = symbol ? `stockHistory_${symbol}` : 'stockHistory_all';
    const { value } = await Preferences.get({ key: 'stockHistory_all' });
    
    if (!value) return null;
    
    const parsedData = JSON.parse(value);
    
    // Convert stored dates back to Date objects
    return parsedData.map(item => {
      const processed = { ...item };
      if (processed.endDate) {
        processed.end = new Date(processed.endDate);
        delete processed.endDate;
      }
      if (processed.startDate) {
        processed.start = new Date(processed.startDate);
        delete processed.startDate;
      }
      return processed;
    });
  } catch (error) {
    console.error(`Error getting stored stock history for 'all symbols':`, error);
    return null;
  }
};

export const setStoredStockHistory = async (data, symbol = null) => {
  try {
    const cacheKey = 'stockHistory_all';
    await Preferences.set({
      key: cacheKey,
      value: JSON.stringify(data)
    });
    await Preferences.set({
      key: `${cacheKey}LastUpdate`,
      value: new Date().toISOString()
    });
  } catch (error) {
    console.error(`Error storing stock history for  'all symbols':`, error);
  }
};

// ------------ USER PREFERENCES ------------ //
// Get and store userPref data for a specific user
export const getAndStoreUserPref = async (userId, forceRefresh = false) => {
  if (!userId) {
    console.error('Cannot fetch user preferences: no userId provided');
    return null;
  }
  
  try {
    if (!forceRefresh) {
      const cachedData = await getStoredUserPref(userId);
      if (cachedData) {
        console.log(`Using cached user preferences for user ${userId}`);
        return cachedData;
      }
    }
    
    console.log(`Fetching user preferences for user ${userId} from Firestore`);
    const userPrefQuery = query(
      collection(db, "userPref"),
      where("userID", "==", userId)
    );
    
    const userPrefSnapshot = await getDocs(userPrefQuery);
    
    if (userPrefSnapshot.empty) {
      return null;
    }
    
    // Assuming each user has one preference document
    const userPrefData = {
      id: userPrefSnapshot.docs[0].id,
      ...userPrefSnapshot.docs[0].data()
    };
    
    // Store in preferences
    await setStoredUserPref(userId, userPrefData);
    
    return userPrefData;
  } catch (error) {
    console.error(`Error fetching/storing user preferences for user ${userId}:`, error);
    return null;
  }
};

export const getStoredUserPref = async (userId) => {
  try {
    const { value } = await Preferences.get({ key: `userPref_${userId}` });
    return value ? JSON.parse(value) : null;
  } catch (error) {
    console.error(`Error getting stored user preferences for user ${userId}:`, error);
    return null;
  }
};

export const setStoredUserPref = async (userId, data) => {
  try {
    await Preferences.set({
      key: `userPref_${userId}`,
      value: JSON.stringify(data)
    });
    await Preferences.set({
      key: `userPref_${userId}LastUpdate`,
      value: new Date().toISOString()
    });
  } catch (error) {
    console.error(`Error storing user preferences for user ${userId}:`, error);
  }
};

// ------------ USER STATS ------------ //
// Get and store userStats data for a specific user
export const getAndStoreUserStats = async (forceRefresh = false) => {
    
    const userPref = await Preferences.get({ key: 'user_info' });
    if (!userPref) return null;
    const userId = JSON.parse(userPref.value).uid;
  
  try {
    // if (!forceRefresh) {
      const cachedData = await getStoredUserStats(userId);
      if (cachedData) {
        console.log(`Using cached user stats for user ${userId}`);
        return cachedData;
      }
    // }
    
    console.log(`Fetching user stats for user ${userId} from Firestore`);
    const userStatsQuery = query(
      collection(db, "userStats"),
      where("userID", "==", userId)
    );
    
    const userStatsSnapshot = await getDocs(userStatsQuery);
    
    if (userStatsSnapshot.empty) {
      return null;
    }
    
    // Process all user stats documents (might have multiple entries)
    const userStatsData = userStatsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    // Process timestamps for storage
    const processedData = userStatsData.map(item => {
      const processed = { ...item };
      // Convert any timestamp fields
      if (processed.lastUpdated && typeof processed.lastUpdated !== 'string') {
        processed.lastUpdated = processed.lastUpdated.seconds ? 
          new Date(processed.lastUpdated.seconds*1000).toISOString() : 
          new Date(processed.lastUpdated).toISOString();
      }
      return processed;
    });
    
    // Store in preferences
    await setStoredUserStats(processedData);
    
    return userStatsData;
  } catch (error) {
    console.error(`Error fetching/storing user stats for user:`, error);
    return null;
  }
};

export const getStoredUserStats = async () => {
  try {
    const { value } = await Preferences.get({ key: `userStats` });
    
    if (!value) return null;
    
    const parsedData = JSON.parse(value);
    
    // Convert stored dates back to Date objects
    return parsedData.map(item => {
      const processed = { ...item };
      if (processed.lastUpdated) {
        processed.timestamp = new Date(processed.lastUpdated);
        delete processed.lastUpdated;
      }
      return processed;
    });
  } catch (error) {
    console.error(`Error getting stored user stats for user:`, error);
    return null;
  }
};

export const setStoredUserStats = async (data) => {
  try {
    await Preferences.set({
      key: `userStats`,
      value: JSON.stringify(data)
    });
    // await Preferences.set({
    //   key: `userStatsLastUpdate`,
    //   value: new Date().toISOString()
    // });
  } catch (error) {
    console.error(`Error storing user stats for user:`, error);
  }
};

// ------------ UTILITY FUNCTIONS ------------ //
// Get all cached data for a specific user
export const getAllUserCachedData = async (userId) => {
  try {
    const [userPref, userStats, activeTrades, stockSnapshots, stockHistory] = await Promise.all([
    //   getStoredUserPref(userId),
      getStoredUserStats(userId),
      getStoredActiveTrades(),
      getStoredStockSnapshots(),
      getStoredStockHistory()
    ]);
    
    return {
      userPref,
      userStats,
      activeTrades,
      stockSnapshots,
      stockHistory
    };
  } catch (error) {
    console.error(`Error retrieving all cached data for user ${userId}:`, error);
    return null;
  }
};

// Clear all cached data (useful for logout)
export const clearAllCachedData = async () => {
  try {
    await Preferences.clear();
    console.log('All cached data cleared');
    return true;
  } catch (error) {
    console.error('Error clearing cached data:', error);
    return false;
  }
};

// // Import needed for 'limit' if not already imported
// import { limit } from "firebase/firestore";
