import React, { useState } from "react";
interface user {
    username: string;
    password: string;
    email: string;
    role: string;
}
export function Login(){
    const [user, setUser] = useState<user>({
        username: "",
        password: "",
        email: "",
        role: ""
    });






}




