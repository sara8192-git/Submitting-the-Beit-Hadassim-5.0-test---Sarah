import React, { useEffect, useState } from "react";
import axios from "axios";
import { Card } from "primereact/card";
import { Button } from "primereact/button";
import { useDispatch, useSelector } from 'react-redux';

export default function SuppliersList() {
    const [suppliers, setSuppliers] = useState([]);
    const [selectedProducts, setSelectedProducts] = useState([]); // רשימת המוצרים שנבחרו
    const [productDetailsMap, setProductDetailsMap] = useState({}); // מפה של פרטי המוצרים לפי ID
    const token = useSelector((state) => state.token.token)
    const [orderSentStatus, setOrderSentStatus] = useState({}); // סטטוס לכל ספק

    // מביאה את כל הספקים מהשרת
    const fetchSuppliers = async () => {
        try {
            const response = await axios.get("http://localhost:5000/supplier", {
                headers: {
                    Authorization: `Bearer ${token}` // הוספת ה-Token לכותרות
                }
            }); setSuppliers(response.data); // שמירת הנתונים ב-state
        } catch (error) {
            console.error("Error fetching suppliers:", error);
        }
    };
    const updateProductStatus = async (SupplierId, selectedProductIds) => {
        try {
            console.log(selectedProductIds)
            const response = await axios.post(
                `http://localhost:5000/order/createOrder`,
                { SupplierId, GoodsId :selectedProductIds},
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );
            if (response.status === 200 || response.status === 201) {
                setOrderSentStatus(prev => ({
                    ...prev,
                    [SupplierId]: true
                }));
            }
        } catch (error) {
            console.error("Error updating product status:", error);
        }
    };

    const getProductDetails = async (productId) => {
        try {
            const response = await axios.get(`http://localhost:5000/goods/${productId}`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            return response.data; // עדכון עם פרטי המוצר
        } catch (error) {
            console.error("Error fetching product details:", error);
        }
    };
    useEffect(() => {
        fetchSuppliers(); // קריאה לפונקציה בעת טעינת הדף
    }, []);
    
    useEffect(() => {
        const fetchProductDetailsForAllGoods = async () => {
            const newProductDetailsMap = {};
            for (let supplier of suppliers) {
                for (let item of supplier.ListOfGoods) {
                    const product = await getProductDetails(item);
                    newProductDetailsMap[item] = product; // עדכון המפה
                }
            }
            setProductDetailsMap(newProductDetailsMap); // שמירת כל פרטי המוצרים במפה
        };

        if (suppliers.length > 0) {
            fetchProductDetailsForAllGoods(); // קריאה לפונקציה בעת קבלת הספקים
        }
    }, [suppliers]); // הפעלת ה-effect כאשר הספקים נטענים
    
    const toggleProductSelection = (productId) => {
        setSelectedProducts(prevState =>
            prevState.includes(productId)
                ? prevState.filter(id => id !== productId)
                : [...prevState, productId]
        );
    };
    
    return (
        <div className="p-4">
            <h2>רשימת הספקים</h2>
            {suppliers.length === 0 ? (
                <p>אין ספקים להצגה</p>
            ) : (
                <div className="grid">
                    {suppliers.map((supplier) => (
                        <Card key={supplier._id} title={supplier.CompanyName} className="col-12 md:col-6 lg:col-4 p-2">
                            <p><strong>שם נציג:</strong> {supplier.RepresentativeName}</p>
                            <p><strong>טלפון:</strong> {supplier.PhoneNumber}</p>
                            <p><strong>סטטוס הזמנה:</strong> {supplier.status}</p>

                            <h4>הסחורות המוצעות:</h4>
                            <ul>
                                {supplier.ListOfGoods && supplier.ListOfGoods.length > 0 ? (
                                    supplier.ListOfGoods.map((item, index) => {
                                        const product = productDetailsMap[item]; // שליפה מתוך המפה

                                        return (
                                            <li key={index}>
                                                {product ? (
                                                    <>
                                                        <p>{product.ProductName} - {product.UnitPrice}₪ (מינימום {product.MinimumOrderQuantity})</p>
                                                        <Button 
                                                            icon="pi pi-check" 
                                                            label="סמן " 
                                                            onClick={() => toggleProductSelection(item)} 
                                                            className={selectedProducts.includes(item) ? "p-button-success" : "p-button-secondary"}
                                                        />
                                                    </>
                                                ) : (
                                                    <p>טוען פרטי מוצר...</p>
                                                )}
                                            </li>
                                        );
                                    })
                                ) : (
                                    <p>אין מוצרים זמינים</p>
                                )}
                            </ul>
                            <Button 
                                label={orderSentStatus[supplier._id] ? "ההזמנה נשלחה" : "להזמנה לחץ כאן"} 
                                icon="pi pi-send" 
                                onClick={() => updateProductStatus(supplier._id, selectedProducts)} 
                                className={`p-button mt-3 ${orderSentStatus[supplier._id] ? "p-button-success" : "p-button-info"}`} 
                            />
                        </Card>
                    ))}
                </div>
            )}

            <Button label="רענן" icon="pi pi-refresh" onClick={fetchSuppliers} className="p-button-info mt-3" />
        </div>
    );
}