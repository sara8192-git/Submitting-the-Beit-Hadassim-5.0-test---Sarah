import React, { useEffect, useState } from "react";
import axios from "axios";
import { Card } from "primereact/card";
import { Button } from "primereact/button";
import { useDispatch, useSelector } from 'react-redux';

export default function OrdersList() {
    const [orders, setOrders] = useState([]); // רשימת ההזמנות
    const [selectedProducts, setSelectedProducts] = useState([]); // רשימת המוצרים שנבחרו
    const [productDetailsMap, setProductDetailsMap] = useState({}); // מפה של פרטי המוצרים לפי ID
    const [supplierDetailsMap, setSupplierDetailsMap] = useState({}); // מפה של פרטי הספקים
    const token = useSelector((state) => state.token.token);
    const [orderSentStatus, setOrderSentStatus] = useState({}); // סטטוס לכל הזמנה

    // שליפת ההזמנות מהשרת
    const fetchOrders = async () => {
        try {
            const response = await axios.get("http://localhost:5000/order", {
                headers: {
                    Authorization: `Bearer ${token}` // הוספת ה-Token לכותרות
                }
            });
            setOrders(response.data); // שמירת ההזמנות ב-state
        } catch (error) {
            console.error("Error fetching orders:", error);
        }
    };

    // שליפת פרטי הספק לפי ID
    const getSupplierDetails = async (supplierId) => {
        try {
            const response = await axios.get(`http://localhost:5000/supplier/${supplierId}`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            return response.data;
        } catch (error) {
            console.error("Error fetching supplier details:", error);
        }
    };

    // עדכון סטטוס ההזמנה
    const updateOrderStatus = async (orderId) => {
        try {
            const response = await axios.put(
                `http://localhost:5000/order/admin`,
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
                            ? { ...order, status: "Completed" }
                            : order
                    )
                );            }
        } catch (error) {
            console.error("Error updating order status:", error);
        }
    };

    // שליפת פרטי המוצר לפי ID
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

    // קריאה לשליפת פרטי המוצרים עבור כל ההזמנות ופרטי הספקים
    useEffect(() => {
        fetchOrders(); // קריאה לפונקציה בעת טעינת הדף
    }, []);

    useEffect(() => {
        const fetchDetailsForAllOrders = async () => {
            const newProductDetailsMap = {};
            const newSupplierDetailsMap = {};
            for (let order of orders) {
                console.log("Order details:", order); // הדפס את פרטי ההזמנה
                for (let item of order.GoodsId) {
                    const product = await getProductDetails(item);
                    newProductDetailsMap[item] = product; // עדכון המפה של המוצרים
                }

                // אם פרטי הספק עדיין לא נטענו, נטען אותם עכשיו
                if (!newSupplierDetailsMap[order.SupplierId]) {
                    const supplier = await getSupplierDetails(order.SupplierId);
                    newSupplierDetailsMap[order.SupplierId] = supplier; // עדכון המפה של הספקים
                }
            }
            setProductDetailsMap(newProductDetailsMap); // עדכון המפה של המוצרים
            setSupplierDetailsMap(newSupplierDetailsMap); // עדכון המפה של הספקים
        };

        if (orders.length > 0) {
            fetchDetailsForAllOrders(); // קריאה לפונקציה בעת קבלת ההזמנות
        }
    }, [orders]);

    const toggleProductSelection = (productId) => {
        setSelectedProducts((prevState) =>
            prevState.includes(productId)
                ? prevState.filter((id) => id !== productId)
                : [...prevState, productId]
        );
    };

    return (
        <div className="p-4">
            <h2>רשימת ההזמנות</h2>
            {orders.length === 0 ? (
                <p>אין הזמנות להצגה</p>
            ) : (
                <div className="grid">
                    {orders.map((order) => (
                        <Card key={order._id} title={`הזמנה ID: ${order._id}`} className="col-12 md:col-6 lg:col-4 p-2">
                            <p><strong>סטטוס:</strong> {order.status}</p>
                            <p><strong>ספק:</strong> {supplierDetailsMap[order.SupplierId]?.CompanyName}</p> {/* פרטי הספק */}
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
                            />
                        </Card>
                    ))}
                </div>
            )}

            <Button label="רענן" icon="pi pi-refresh" onClick={fetchOrders} className="p-button-info mt-3" />
        </div>
    );
}
