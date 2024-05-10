const initialState = {
    responseData: null,
};

const dataReducer = (state = initialState, action) => {
    switch (action.type) {
        case 'SET_RESPONSE_DATA':
            return {
                ...state,
                responseData: action.payload,
            };
        default:
            return state;
    }
};

export default dataReducer;
