import {createReducer, createAsyncThunk} from "@reduxjs/toolkit"
import axios from "../axiosURL"


//Devices vom Server laden
export const loadDevices = createAsyncThunk("devices", async () => {
    const res = await axios.get("devices");
    console.log("API Antwort:", res.data);
    return res.data || [];
})


const initState = {
    devices: []
}

const devicesReducer = createReducer(initState, (builder) => {
    builder
        .addCase(loadDevices.fulfilled, (state, action) => {
            state.devices = action.payload
        })
        //.addCase(deleteDevices)
})

export default devicesReducer;