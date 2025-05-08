import React from "react";
import { useNavigate } from "react-router-dom";
import { Menubar } from 'primereact/menubar';
import {  Route, Routes } from 'react-router-dom'
import CreateOrderAdmin from "./CreateOrderAdmin"
import OrdersAdmin from "./OrdersAdmin"
export default function AdminDashboard() {

    const navigate = useNavigate(); // 🔹 מאפשר ניווט לדפים אחרים
    const items = [
        {
            label: 'הזמנת סחורה',
            icon: 'pi pi-home',
            command: () => {
                navigate('/admindashboard/CreateOrderAdmin')
            }
        },
        {
            label: 'הזמנות קיימות',
            icon: 'pi pi-search',
            command: () => {
                navigate('/admindashboard/OrdersAdmin')}
        }
    ];

    return (
        <div className="flex flex-column align-items-center">
            <Menubar model={items} />
            <Routes>
                <Route path="CreateOrderAdmin" element={<CreateOrderAdmin />} /> {/* נתיב חדש להרשמה */}
                <Route path="OrdersAdmin" element={<OrdersAdmin />} /> {/* נתיב חדש להרשמה */}
            </Routes>
        </div>

    );
}