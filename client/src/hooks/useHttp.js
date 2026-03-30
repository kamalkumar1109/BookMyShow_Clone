import { useReducer } from "react";

const httpReducer = (state, action) => {
    if(action.type === 'PENDING'){
        return{
            data: null,
            isLoading: true,
            error: null
        }
    }
    if(action.type === 'SUCCESS'){
        return{
            data: action.payload,
            isLoading: false,
            error: null
        }
    }
    if(action.type === 'ERROR'){
        return{
            data: null,
            isLoading: false,
            error: action.error
        }
    }
    if (action.type === "RESET") {
        return {
            data: null,
            isLoading: false,
            error: null,
        };
    }
    throw new Error('Invalid Event');
}

const useHttp = (requestFunction, startsWithPending=false) => {
    const [httpState, dispatch] = useReducer(httpReducer, {
        data: null,
        isLoading: startsWithPending,
        error: null
    });

    const sendRequest = async(...requestData) => {
        try {
            dispatch({type: 'PENDING'});
            const data = await requestFunction(...requestData);
            dispatch({type: 'SUCCESS', payload: data.payload});
        }
        catch (err){
            const apiMessage =
              err?.response?.data?.message ||
              err?.response?.data?.error ||
              err?.message;
            dispatch({type: 'ERROR', error: apiMessage || 'Something went wrong'});
        }
    }

    const reset = () => dispatch({ type: "RESET" });

    return {...httpState, sendRequest, reset};
}

export default useHttp;