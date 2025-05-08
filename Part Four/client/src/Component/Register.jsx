import React, { useState, useRef } from "react";
import { Card } from "primereact/card";
import { InputText } from "primereact/inputtext";
import { Button } from "primereact/button";
import { Toast } from "primereact/toast";
import "primereact/resources/themes/lara-light-blue/theme.css";
import "primereact/resources/primereact.min.css";
import "primeicons/primeicons.css";

const Register = () => {
    const [formData, setFormData] = useState({
        CompanyName: "",
        PhoneNumber: "",
        RepresentativeName: "",
        ListOfGoods: []
    });
    const toast = useRef(null);
    const [newGood, setNewGood] = useState({
        ProductName: "",
        UnitPrice: "",
        MinimumOrderQuantity: ""
    });
    const handleChange = (e, field) => {
        setFormData({ ...formData, [field]: e.target.value });
    };

    const handleRegister = async () => {
        try {
            const response = await fetch("http://localhost:5000/auth/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    CompanyName: formData.CompanyName,
                    PhoneNumber: formData.PhoneNumber,
                    RepresentativeName: formData.RepresentativeName,
                    ListOfGoods: formData.ListOfGoods
                })
            });

            const data = await response.json();
            if (response.ok) {
                toast.current.show({ severity: "success", summary: "Success", detail: "נרשמת בהצלחה למערכת !", life: 3000 });
            } else {
                toast.current.show({ severity: "error", summary: "Error", detail: data.message || "שגיאה ברישום", life: 3000 });
            }
        } catch (error) {
            toast.current.show({ severity: "error", summary: "Error", detail: "שגיאה בחיבור לשרת", life: 3000 });
        }
    };

    return (
        <div className="flex justify-content-center align-items-center h-screen">
            <Toast ref={toast} />
            <Card title="הצטרפות" className="p-4 w-25">
                <div className="p-fluid">
                    <div className="field">
                        <label htmlFor="CompanyName">שם החברה </label>
                        <InputText id="CompanyName" value={formData.CompanyName} onChange={(e) => handleChange(e, "CompanyName")} />
                    </div>

                    <div className="field">
                        <label htmlFor="PhoneNumber"> מספר טלפון</label>
                        <InputText id="PhoneNumber" value={formData.PhoneNumber} onChange={(e) => handleChange(e, "PhoneNumber")} />
                    </div>

                    <div className="field">
                        <label htmlFor="RepresentativeName">שם נציג</label>
                        <div className="p-inputgroup">
                            <InputText id="RepresentativeName" value={formData.RepresentativeName} onChange={(e) => handleChange(e, "RepresentativeName")} />
                        </div>
                    </div>

                    <div className="field">
                        <label>רשימת מוצרים</label>

                        {/* שדות למוצר חדש */}
                        <div className="p-inputgroup">
                            <InputText
                                placeholder="שם מוצר"
                                value={newGood.ProductName}
                                onChange={(e) => setNewGood({ ...newGood, ProductName: e.target.value })}
                            />
                            <InputText
                                placeholder="מחיר ליחידה"
                                type="number"
                                value={newGood.UnitPrice}
                                onChange={(e) => setNewGood({ ...newGood, UnitPrice: e.target.value })}
                            />
                            <InputText
                                placeholder="כמות מינימלית"
                                type="number"
                                value={newGood.MinimumOrderQuantity}
                                onChange={(e) => setNewGood({ ...newGood, MinimumOrderQuantity: e.target.value })}
                            />
                            <Button
                                label="הוסף מוצר"
                                icon="pi pi-plus"
                                onClick={() => {
                                    if (newGood.ProductName && newGood.UnitPrice && newGood.MinimumOrderQuantity) {
                                        setFormData({
                                            ...formData,
                                            ListOfGoods: [...formData.ListOfGoods, newGood]
                                        });
                                        setNewGood({ ProductName: "", UnitPrice: "", MinimumOrderQuantity: "" }); // איפוס השדות
                                    }
                                }}
                                className="p-button-success"
                            />
                        </div>

                        {/* הצגת המוצרים שנוספו בטבלה */}
                        <table className="p-datatable p-component">
                            <thead>
                                <tr>
                                    <th>שם מוצר</th>
                                    <th>מחיר ליחידה</th>
                                    <th>כמות מינימלית</th>
                                </tr>
                            </thead>
                            <tbody>
                                {formData.ListOfGoods.map((item, index) => (
                                    <tr key={index}>
                                        <td>{item.ProductName}</td>
                                        <td>{item.UnitPrice}</td>
                                        <td>{item.MinimumOrderQuantity}</td>
                                        <td>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>




                    <Button label="הצטרפות" icon="pi pi-user-plus" className="p-button-success w-full mt-3" onClick={handleRegister} />
                </div>
            </Card>
        </div>
    );
};

export default Register;
