const LAST_RECENT_PROVIDERS = 5;

const initialState = {
    providers: [],
}

export default function recentlyViewedReducer(state = initialState, action) {
    switch (action.type) {
        case ADD_RECENTLY_VIEWED_PROVIDER:
            const provider = action.payload.provider;
            const uniqueProviders = state.providers.filter(stateProvider => stateProvider.id !== provider);

            return {
                ...state,
                providers: [
                    provider,
                    ...uniqueProviders.slice(0, LAST_RECENT_PROVIDERS)
                ]
            }

        case CLEAR_RECENTLY_VIEWED_PROVIDER:
            return console.log('CLEAR_RECENTLY_VIEWED_PROVIDER')

        default:
            return state;
    }
}