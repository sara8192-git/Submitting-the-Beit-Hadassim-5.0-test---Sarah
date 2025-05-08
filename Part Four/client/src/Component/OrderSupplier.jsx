import React, { useEffect, useState } from "react";
import axios from "axios";
import { useSelector } from "react-redux"; // אם אתה שומר את ה-token ב-redux
import { Card } from "primereact/card";
import { Button } from "primereact/button";
import { jwtDecode } from 'jwt-decode';

export default function SupplierOrders() {
    const [orders, setOrders] = useState([]); // כל ההזמנות של הספק
    const token = useSelector((state) => state.token.token);
    const [productDetailsMap, setProductDetailsMap] = useState({}); // מפה של פרטי המוצרים לפי ID
    const [orderSentStatus, setOrderSentStatus] = useState({}); // סטטוס לכל הזמנה

    const supplierId = useSelector((state) => {
        if (token) {
            const decodedToken = jwtDecode(token); // פירוק הטוקן
            return decodedToken._id; // שליפת ה-ID מתוך הטוקן
        }
        return null; // אם אין טוקן, מחזיר null
    });

    // פונקציה לשליפת ההזמנות עבור הספק הספציפי
    const fetchOrdersForSupplier = async () => {
        try {
            console.log(supplierId)
            const response = await axios.get(`http://localhost:5000/order/${supplierId}`, {
                headers: {
                    Authorization: `Bearer ${token}`, // הוספת ה-Token לכותרות
                },
            });
            setOrders(response.data); // שמירת ההזמנות ב-state
        } catch (error) {
            console.error("Error fetching orders:", error);
        }
    };
    const getProductDetails = async (productId) => {
        try {
            const response = await axios.get(`http://localhost:5000/goods/${productId}`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            return response.data;
        } catch (error) {
            console.error("Error fetching product details:", error);
        }
    };
    const updateOrderStatus = async (orderId) => {
        try {
            const response = await axios.put(
                `http://localhost:5000/order/supplier`,
                { _id: orderId },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );
            if (response.status === 200 || response.status === 201) {
                setOrders((prevOrders) =>
                    prevOrders.map((order) =>
                        order._id === orderId
                            ? { ...order, status: "Processing" }
                            : order
                    )
                );
            }
        } catch (error) {
            console.error("Error updating order status:", error);
        }
    };
    useEffect(() => {
        if (supplierId) {
            fetchOrdersForSupplier(); // קריאה לפונקציה בעת טעינת הדף אם יש id לספק
        }
    }, [supplierId]); // הפעלת ה-effect רק כשיש ספק
    useEffect(() => {
        const fetchDetailsForAllOrders = async () => {
            const newProductDetailsMap = {};
            for (let order of orders) {
                console.log("Order details:", order); // הדפס את פרטי ההזמנה
                for (let item of order.GoodsId) {
                    const product = await getProductDetails(item);
                    newProductDetailsMap[item] = product; // עדכון המפה של המוצרים
                }


            }
            setProductDetailsMap(newProductDetailsMap); // עדכון המפה של המוצרים
        };

        if (orders.length > 0) {
            fetchDetailsForAllOrders(); // קריאה לפונקציה בעת קבלת ההזמנות
        }
    }, [orders]);
    return (
        <div className="p-4">
            <h2>ההזמנות שלך</h2>
            {orders.length === 0 ? (
                <p>אין הזמנות להצגה</p>
            ) : (
                <div className="grid">
                    {orders.map((order) => (
                        <Card key={order._id} title={`הזמנה #${order._id}`} className="col-12 md:col-6 lg:col-4 p-2">
                            <p><strong>סטטוס:</strong> {order.status}</p>
                            <h4>מוצרים בהזמנה:</h4>
                            <ul>
                                {order.GoodsId && order.GoodsId.length > 0 ? (
                                    order.GoodsId.map((item, index) => {
                                        const product = productDetailsMap[item]; // שליפה מתוך המפה

                                        return (
                                            <li key={index}>
                                                {product ? (
                                                    <>
                                                        <p>{product.ProductName} - {product.UnitPrice}₪ (מינימום {product.MinimumOrderQuantity})</p>
                                                    </>
                                                ) : (
                                                    <p>טוען פרטי מוצר...</p>
                                                )}
                                            </li>
                                        );
                                    })
                                ) : (
                                    <p>אין מוצרים בהזמנה</p>
                                )}
                            </ul>
                            <Button
                                label={orderSentStatus[order._id] ? order.status : order.status}
                                icon="pi pi-send"
                                onClick={() => updateOrderStatus(order._id)}
                                className={`p-button mt-3 ${orderSentStatus[order._id] ? "p-button-success" : "p-button-info"}`}
                            />                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
