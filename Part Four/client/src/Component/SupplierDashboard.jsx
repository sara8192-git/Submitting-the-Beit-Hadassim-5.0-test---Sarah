import React from "react";
import { useNavigate } from "react-router-dom";
import { Menubar } from 'primereact/menubar';
import {  Route, Routes } from 'react-router-dom'
import OrderSupplier from "./OrderSupplier"
export default function SupplierDashboard() {

    const navigate = useNavigate(); // 🔹 מאפשר ניווט לדפים אחרים
    const items = [
        {
            label: 'צפיה בהזמנות ',
            icon: 'pi pi-home',
            command: () => {
                navigate('/supplierdashboard/OrderSupplier')
            }
        }
       
    ];

    return (
        <div className="flex flex-column align-items-center">
            <Menubar model={items} />
            <Routes>
                <Route path="OrderSupplier" element={<OrderSupplier />} /> {/* נתיב חדש להרשמה */}
            </Routes>
        </div>

    );
}