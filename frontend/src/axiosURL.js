import axios from "axios"

const instance = axios.create({
    baseURL:"/firmware-monitoring/",
    withCredentials: true,
    // headers: {
    //     "Content-Type": "application/json"
    // }
});

function logout(){
    sessionStorage.removeItem("isAuthenticated");
    //Auf Login Seite leiten
    window.location.href = "/login";
}

//Falls 401 vom Backend 
instance.interceptors.response.use(
    (response) => response,
    (error) => {
        if(error.response.status === 401){
            logout();
        }
        return Promise.reject(error);
    }
);

export default instance;