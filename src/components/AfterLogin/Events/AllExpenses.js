import React from "react";
import edit from "../../../assets/afterLogin picks/events/edit.svg"

const AllExpenses = () => {

    const Expenses = [
        {
            expence: "Facility charges",
            amount: 100
        },

        {
            expence: "Water bottle",
            amount: 100
        },

        {
            expence: "Food expenses",
            amount: 100
        },


        {
            expence: "Leather bowl",
            amount: 100
        },

        {
            expence: "Facility charges",
            amount: 100
        }
    ]


    return (
        <div className="AllExpences">
            <div className="row mt-4">

                {Expenses.map((expence, index) => (

                    <div className="member-container my-2  col-md-12 d-flex justify-content-between align-items-center rounded-3">
                        <div className="pt-3">
                            <h6>{expence.expence}</h6>
                            <p>{expence.amount}</p>
                        </div>
                        <div className="me-4 d-flex justify-content-center edit">
                            <img src={edit} alt="edit" />
                        </div>
                    </div>
                ))}

            </div>

        </div>
    )
}

export default AllExpenses;