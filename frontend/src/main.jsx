import './index.css'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Provider } from 'react-redux'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import { configureStore } from '@reduxjs/toolkit'
import { Navigate } from 'react-router-dom'

import App from './App.jsx'
import AllDevices from './components/AllDevices/AllDevices.jsx'
import devicesReducer from './reducer/devicesReducer.js'
import DeviceDetail from './components/DeviceDetail/DeviceDetail.jsx'
import AddDevice from './components/AddDevice/AddDevice.jsx'
import Advanced from './components/Advanced/Advanced.jsx'
import SetManagementData from './components/SetManagementData/SetManagementData.jsx'
import LoginScreen from './components/LoginScreen/LoginScreen.jsx'
import CheckNewFirmware from './components/CheckNewFirmware/CheckNewFirmware.jsx'

const store = configureStore({
  reducer: {
    devices: devicesReducer
  }
})

const ProtectedRoute = ({children}) => {
  const isAuthenticated = sessionStorage.getItem("isAuthenticated") === "true";
  if(!isAuthenticated){
    return <Navigate  to="/login" replace/>;
  }
  return children;
}

const router = createBrowserRouter([
  {
    path: "/login",
    element: <LoginScreen/>
  },
  {
    path: "/",
    element: (
      <ProtectedRoute>
        <App/>
      </ProtectedRoute>
    ),
    children: [
      {
        index: true,
        element: <AllDevices/>
      },
      {
        path: "/device/:ip",
        element: <DeviceDetail/>
      },
      {
        path: "/addDevice",
        element: <AddDevice/>
      },
      {
        path: "/advanced",
        element: <Advanced/>
      },
      {
        path: "/setManagementData",
        element: <SetManagementData/>
      },
      {
        path: "/checkNewFirmware",
        element: <CheckNewFirmware/>
      }
    ]
  }
])

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Provider store={store}>
      <RouterProvider router={router} />
    </Provider>
  </StrictMode>
)
