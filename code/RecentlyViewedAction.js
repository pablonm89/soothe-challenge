export const ADD_RECENTLY_VIEWED_PROVIDER = 'ADD_RECENTLY_VIEWED_PROVIDER';
export const CLEAR_RECENTLY_VIEWED_PROVIDER = 'CLEAR_RECENTLY_VIEWED_PROVIDER';

export function addRecentlyViewedProvider(provider) {
    return {
        type: ADD_RECENTLY_VIEWED_PROVIDER,
        payload: { provider },
    }
}

export function clearRecentlyViewedProvider() {
    return {
        type: ADD_RECENTLY_VIEWED_PROVIDER,
    }
}