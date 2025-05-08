import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { InputText } from "primereact/inputtext";
import { Button } from "primereact/button";
import { useDispatch } from 'react-redux';
import { setToken } from '../redux/tokenSlice';


export default function Login() {
    const [CompanyName, setCompanyName] = useState("");
    const dispatch = useDispatch();
    const [error, setError] = useState("");
    const navigate = useNavigate(); // 🔹 מאפשר ניווט לדפים אחרים

    const handleLogin = async (e) => {
        e.preventDefault(); // מונע רענון של הדף
        setError(""); // איפוס שגיאות קודמות

        try {
            const response = await axios.post("http://localhost:5000/auth/login", {
                CompanyName: CompanyName
            });

            if (response.status === 200) {
                const { accessToken, userType } = response.data;

                // שמירת הטוקן ב-Redux
                dispatch(setToken({ token: accessToken }));

                // ניווט לפי סוג המשתמש
                if (userType === "admin") {
                    navigate("/admindashboard"); // דף מנהל
                } else {
                    navigate("/supplierdashboard"); // דף ספק
                }

                // הצגת הודעה למשתמש
                alert("ההתחברות בוצעה בהצלחה!");
            }
        } catch (error) {
            setError("שם החברה שגוי");
        }
    };

    return (
        <div className="flex flex-column align-items-center">
            <h2>התחברות</h2>
            <form onSubmit={handleLogin} className="p-fluid">
                <div className="p-field">
                    <label>שם החברה</label>
                    <InputText value={CompanyName} onChange={(e) => setCompanyName(e.target.value)} />
                </div>
                {error && <p style={{ color: "red" }}>{error}</p>}
                <Button type="submit" label="התחבר" icon="pi pi-sign-in" />
            </form>
        </div>
    );
}
