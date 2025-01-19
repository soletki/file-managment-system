import { useEffect, useState, useRef } from "react"
import Keycloak from 'keycloak-js'

function useAuth(){
    const [token, setToken] = useState(false)
    const isRun = useRef(false)

    useEffect(()=>{
        if(isRun.current)return

        isRun.current = true
        const client = new Keycloak({
            url: "http://localhost:8080",
            realm: "myrealm",
            clientId: "minio",

        })

        client.init({onLoad: "login-required"}).then(()=>{
            setToken(client.token)
        }).catch((e)=>{
            console.error("Error initializing keycloak")
        })
    }, [])

    return token
}

export default useAuth