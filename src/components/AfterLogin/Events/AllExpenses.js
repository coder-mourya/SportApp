import edit from "../../../assets/afterLogin picks/events/edit.svg"
import React, { useEffect } from "react";
import { fetchEventsDetails } from "../../../reducers/eventSlice";
import { useSelector } from "react-redux";
import { useDispatch } from "react-redux";
import { ThreeDots } from "react-loader-spinner";
import { useState } from "react";
import Member from "../../../assets/afterLogin picks/My team/Member.svg";
import Modal from 'react-bootstrap/Modal';
import "../../../assets/Styles/AfterLogin/event.css"
import { BaseUrl } from "../../../reducers/Api/bassUrl";
import axios from "axios";
import { toast } from "react-toastify";
import Delete from "../../../assets/afterLogin picks/My team/delete.svg";
import CurrencyInput from 'react-currency-input';
import Select from 'react-select';
import currencySymbolMap from 'currency-symbol-map';


const currencyOptions = [
    { value: 'USD', label: 'US Dollar (USD)' },
    { value: 'EUR', label: 'Euro (EUR)' },
    { value: 'GBP', label: 'British Pound (GBP)' },
    { value: 'INR', label: 'Indian Rupee (INR)' },
    { value: 'AUD', label: 'Australian Dollar (AUD)' },
    { value: 'CAD', label: 'Canadian Dollar (CAD)' },
    { value: 'CHF', label: 'Swiss Franc (CHF)' },
    { value: 'CNY', label: 'Chinese Yuan (CNY)' },
    { value: 'JPY', label: 'Japanese Yen (JPY)' },
    { value: 'NZD', label: 'New Zealand Dollar (NZD)' },
    { value: 'SGD', label: 'Singapore Dollar (SGD)' },
    { value: 'HKD', label: 'Hong Kong Dollar (HKD)' },
    { value: 'KRW', label: 'South Korean Won (KRW)' },
    { value: 'MYR', label: 'Malaysian Ringgit (MYR)' },
    { value: 'THB', label: 'Thai Baht (THB)' },
    { value: 'ZAR', label: 'South African Rand (ZAR)' },
    { value: 'BRL', label: 'Brazilian Real (BRL)' },
    { value: 'RUB', label: 'Russian Ruble (RUB)' },
    { value: 'MXN', label: 'Mexican Peso (MXN)' },
    { value: 'ARS', label: 'Argentine Peso (ARS)' },
    { value: 'CLP', label: 'Chilean Peso (CLP)' },
    { value: 'COP', label: 'Colombian Peso (COP)' },
    { value: 'PEN', label: 'Peruvian Sol (PEN)' },
    { value: 'VND', label: 'Vietnamese Dong (VND)' },
    { value: 'TRY', label: 'Turkish Lira (TRY)' },
    { value: 'PHP', label: 'Philippine Peso (PHP)' },
    { value: 'EGP', label: 'Egyptian Pound (EGP)' },
    { value: 'SAR', label: 'Saudi Riyal (SAR)' },
    { value: 'AED', label: 'United Arab Emirates Dirham (AED)' },
    { value: 'NGN', label: 'Nigerian Naira (NGN)' },
    { value: 'KES', label: 'Kenyan Shilling (KES)' },
    { value: 'GHS', label: 'Ghanaian Cedi (GHS)' },
    { value: 'TZS', label: 'Tanzanian Shilling (TZS)' },
    { value: 'UGX', label: 'Ugandan Shilling (UGX)' },
    { value: 'PKR', label: 'Pakistani Rupee (PKR)' },
    { value: 'BDT', label: 'Bangladeshi Taka (BDT)' },
    { value: 'LKR', label: 'Sri Lankan Rupee (LKR)' },
    { value: 'NPR', label: 'Nepalese Rupee (NPR)' },
    { value: 'IDR', label: 'Indonesian Rupiah (IDR)' },
    { value: 'MAD', label: 'Moroccan Dirham (MAD)' },
    { value: 'DZD', label: 'Algerian Dinar (DZD)' },
    { value: 'TND', label: 'Tunisian Dinar (TND)' },
    { value: 'BHD', label: 'Bahraini Dinar (BHD)' },
    { value: 'OMR', label: 'Omani Rial (OMR)' },
    { value: 'QAR', label: 'Qatari Riyal (QAR)' },
    { value: 'KWD', label: 'Kuwaiti Dinar (KWD)' },
    { value: 'BND', label: 'Brunei Dollar (BND)' },
    { value: 'ILS', label: 'Israeli New Shekel (ILS)' },
    { value: 'IRR', label: 'Iranian Rial (IRR)' },
    { value: 'KZT', label: 'Kazakhstani Tenge (KZT)' },
    { value: 'UZS', label: 'Uzbekistani Som (UZS)' },
    { value: 'TRY', label: 'Turkish Lira (TRY)' },
    { value: 'AZN', label: 'Azerbaijani Manat (AZN)' },
    { value: 'GEL', label: 'Georgian Lari (GEL)' },
    { value: 'AMD', label: 'Armenian Dram (AMD)' },
    { value: 'MKD', label: 'Macedonian Denar (MKD)' },
    { value: 'BGN', label: 'Bulgarian Lev (BGN)' },
    { value: 'HRK', label: 'Croatian Kuna (HRK)' },
    { value: 'RON', label: 'Romanian Leu (RON)' },
    { value: 'HUF', label: 'Hungarian Forint (HUF)' },
    { value: 'CZK', label: 'Czech Koruna (CZK)' },
    { value: 'PLN', label: 'Polish Zloty (PLN)' },
    { value: 'SEK', label: 'Swedish Krona (SEK)' },
    { value: 'NOK', label: 'Norwegian Krone (NOK)' },
    { value: 'DKK', label: 'Danish Krone (DKK)' },
    { value: 'ISK', label: 'Icelandic Krona (ISK)' },
    { value: 'ALL', label: 'Albanian Lek (ALL)' },
    { value: 'RSD', label: 'Serbian Dinar (RSD)' },
    { value: 'KGS', label: 'Kyrgyzstani Som (KGS)' },
    { value: 'MNT', label: 'Mongolian Tugrik (MNT)' },
    { value: 'AFN', label: 'Afghan Afghani (AFN)' },
    { value: 'MVR', label: 'Maldivian Rufiyaa (MVR)' },
    { value: 'LBP', label: 'Lebanese Pound (LBP)' },
    { value: 'SYP', label: 'Syrian Pound (SYP)' },
    { value: 'JOD', label: 'Jordanian Dinar (JOD)' },
    { value: 'YER', label: 'Yemeni Rial (YER)' },
    { value: 'MMK', label: 'Myanmar Kyat (MMK)' },
    { value: 'LAK', label: 'Lao Kip (LAK)' },
    { value: 'KHR', label: 'Cambodian Riel (KHR)' },
    { value: 'BND', label: 'Brunei Dollar (BND)' },
    { value: 'KYD', label: 'Cayman Islands Dollar (KYD)' },
    { value: 'BBD', label: 'Barbadian Dollar (BBD)' },
    { value: 'BSD', label: 'Bahamian Dollar (BSD)' },
    { value: 'BZD', label: 'Belize Dollar (BZD)' },
    { value: 'BMD', label: 'Bermudian Dollar (BMD)' },
    { value: 'BWP', label: 'Botswana Pula (BWP)' },
    { value: 'SBD', label: 'Solomon Islands Dollar (SBD)' },
    { value: 'FJD', label: 'Fijian Dollar (FJD)' },
    { value: 'TOP', label: 'Tongan Paʻanga (TOP)' },
    { value: 'PGK', label: 'Papua New Guinean Kina (PGK)' },
    { value: 'VUV', label: 'Vanuatu Vatu (VUV)' },
    { value: 'MWK', label: 'Malawian Kwacha (MWK)' },
    { value: 'ZMW', label: 'Zambian Kwacha (ZMW)' },
    { value: 'SZL', label: 'Swazi Lilangeni (SZL)' },
    { value: 'MGA', label: 'Malagasy Ariary (MGA)' },
    { value: 'LSL', label: 'Lesotho Loti (LSL)' },
    { value: 'GMD', label: 'Gambian Dalasi (GMD)' },
    { value: 'GNF', label: 'Guinean Franc (GNF)' },
    { value: 'SLL', label: 'Sierra Leonean Leone (SLL)' },
    { value: 'LRD', label: 'Liberian Dollar (LRD)' },
    { value: 'CDF', label: 'Congolese Franc (CDF)' },
    { value: 'XOF', label: 'West African CFA Franc (XOF)' },
    { value: 'XAF', label: 'Central African CFA Franc (XAF)' },
    { value: 'KMF', label: 'Comorian Franc (KMF)' },
    { value: 'BIF', label: 'Burundian Franc (BIF)' },
    { value: 'DJF', label: 'Djiboutian Franc (DJF)' },
    { value: 'ETB', label: 'Ethiopian Birr (ETB)' },
    { value: 'SOS', label: 'Somali Shilling (SOS)' },
    { value: 'SCR', label: 'Seychellois Rupee (SCR)' },
    { value: 'MUR', label: 'Mauritian Rupee (MUR)' },
    { value: 'NAD', label: 'Namibian Dollar (NAD)' },
    { value: 'RWF', label: 'Rwandan Franc (RWF)' },
    { value: 'TZS', label: 'Tanzanian Shilling (TZS)' },
    { value: 'ZWL', label: 'Zimbabwean Dollar (ZWL)' },
    { value: 'BZD', label: 'Belize Dollar (BZD)' },
    { value: 'GTQ', label: 'Guatemalan Quetzal (GTQ)' },
    { value: 'HNL', label: 'Honduran Lempira (HNL)' },
    { value: 'NIO', label: 'Nicaraguan Córdoba (NIO)' },
    { value: 'PAB', label: 'Panamanian Balboa (PAB)' },
    { value: 'PYG', label: 'Paraguayan Guarani (PYG)' },
    { value: 'UYU', label: 'Uruguayan Peso (UYU)' },
    { value: 'BBD', label: 'Barbadian Dollar (BBD)' },
    { value: 'TTD', label: 'Trinidad and Tobago Dollar (TTD)' },
    { value: 'JMD', label: 'Jamaican Dollar (JMD)' },
    { value: 'BBD', label: 'Barbadian Dollar (BBD)' },
    { value: 'BZD', label: 'Belize Dollar (BZD)' },
    { value: 'BMD', label: 'Bermudian Dollar (BMD)' },
    { value: 'FJD', label: 'Fijian Dollar (FJD)' },
    { value: 'GYD', label: 'Guyanese Dollar (GYD)' },
    { value: 'HTG', label: 'Haitian Gourde (HTG)' },
    { value: 'SRD', label: 'Surinamese Dollar (SRD)' },
    { value: 'XCD', label: 'East Caribbean Dollar (XCD)' },
];




const AllExpenses = ({ eventId }) => {
    const EventDetails = useSelector((state) => state.events.eventDetails);
    const token = useSelector((state) => state.auth.user.data.user.token);
    const user = useSelector((state) => state.auth.user.data.user);
    const dispatch = useDispatch();
    const [loading, setLoading] = useState(true);
    const [formData, setFormData] = useState({
        eventId: "",
        title: "",
        cost: "",
        currencyCode: "",
    })



    const adminCheck = EventDetails?.allMemberDetails?.find((member) => member?.memberId === user?._id);


    // fetch event details
    useEffect(() => {
        dispatch(fetchEventsDetails({ eventId: eventId, token })).then(() => {
            setLoading(false);
        });
    }, [token, dispatch, eventId]);

    const handleInputChange = (event) => {
        const { name, value } = event.target;
        setFormData({ ...formData, [name]: value });
    };


    // Add Expenses

    const [showAddExpenses, setShowAddExpenses] = useState(false);
    const handleShowAddExpenses = () => {
        if (!adminCheck?.isAdmin) {
            toast.error("Only admins can add expenses");
        } else {
            setShowAddExpenses(true);
        }
    }
    const handleCloseAddExpenses = () => setShowAddExpenses(false);
    const [isCurrencySet, setIsCurrencySet] = useState(false);

    useEffect(() => {
        if (EventDetails && EventDetails.currencyCode) {
            setIsCurrencySet(true);
            setSelectedCurrency(currencyOptions.find(option => option.value === EventDetails.currencyCode));
        }
    }, [EventDetails]);


    const handleAddCost = async () => {
        handleCloseAddExpenses();
        setLoading(true);
        const adCostUrl = BaseUrl();

        let data = {
            eventId: eventId,
            title: formData.title,
            cost: formData.cost,
            currencyCode: formData.currencyCode || EventDetails?.currencyCode
        }



        // console.log("add cost data ", data);
        // setLoading(false)
        // return;

        try {
            const res = await axios.post(`${adCostUrl}/user/event/add/expense`, data, {
                headers: {
                    Authorization: `Bearer ${token}`,
                }
            })

            if (res.data.status === 200) {
                // console.log("res data ", res.data);
                toast.success(res.data.message);
                dispatch(fetchEventsDetails({ eventId: eventId, token }));
                // Clear the form data here
                setFormData({
                    title: '',
                    cost: '',
                    currencyCode: ''
                });
            } else {
                const errorMessage = res.data.errors ? res.data.errors.msg : "Error adding expenses";
                toast.error(errorMessage);
            }
        } catch (error) {
            toast.error("internal server error");
        } finally {
            setLoading(false);
        }
    }

    // edit expenses

    const [showEditExpenses, setShowEditExpenses] = useState(false);
    const [selectedExpenseId, setSelectedExpenseId] = useState(null);
    const handleShowEditExpenses = (expenseId) => {
        // console.log("selected expense id ", expenseId);
        if (!adminCheck?.isAdmin) {
            toast.error("Only admins can edit expenses");
        } else {
            setShowEditExpenses(true);
            setSelectedExpenseId(expenseId);
        }
    }
    const handleCloseEditExpenses = () => setShowEditExpenses(false);


    const handleEdit = async () => {
        setLoading(true);
        const EditCostUrl = BaseUrl();
        let data = {
            eventId: eventId,
            title: formData.title,
            cost: formData.cost,
            currencyCode: formData.currencyCode
        }

        const expenseId = selectedExpenseId;

        // console.log("edit cost data ", data, expenseId);

        // return;

        try {
            const res = await axios.put(`${EditCostUrl}/user/event/edit/expense/${expenseId}`, data, {
                headers: {
                    Authorization: `Bearer ${token}`,
                }
            })

            if (res.status === 200) {

                toast.success(res.data.message);
                dispatch(fetchEventsDetails({ eventId: eventId, token }));
                handleCloseEditExpenses();
            } else {
                const errorMessage = res.data.errors ? res.data.errors.msg : "Error adding expenses";
                toast.error(errorMessage);
            }
        } catch (error) {
            toast.error("internal server error");
        } finally {
            setLoading(false);
        }
    }

    // delete expenses
    const [showDelete, setShowDelete] = useState(false);
    const handleShowDelete = (expenseId) => {
        if (!adminCheck?.isAdmin) {
            toast.error("Only admins can delete expenses");
        } else {
            setShowDelete(true);
            setSelectedExpenseId(expenseId);
        }
    }
    const handleCloseDelete = () => setShowDelete(false);

    const handleDelete = async () => {
        handleCloseDelete();
        setLoading(true);
        const deleteUrl = BaseUrl();
        const expenseId = selectedExpenseId;

        try {
            const res = await axios.delete(`${deleteUrl}/user/event/expense/delete/${expenseId}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                }
            })

            if (res.data.status === 200) {
                console.log("delete response ", res.data);
                toast.success(res.data.message);
                dispatch(fetchEventsDetails({ eventId: eventId, token }));

            }
        } catch (error) {
            toast.error("internal server error");
        } finally {
            setLoading(false);
        }
    }


    const [selectedCurrency, setSelectedCurrency] = useState(currencyOptions[0]);

    const handleCurrencyChange = (option) => {
        setSelectedCurrency(option);
        setFormData({ ...formData, currencyCode: option.value });
    };

    const handleAmountChange = (event, maskedValue, floatValue) => {
        setFormData({ ...formData, cost: floatValue }); // Update cost in formData with the numerical value
    };



    return (
        <div className="">

            {loading ? (
                <div className="text-center loader flex-grow-1 d-flex justify-content-center align-items-center">
                    <ThreeDots
                        height={80}
                        width={80}
                        color="green"
                        ariaLabel="loading"
                        wrapperStyle={{}}
                        wrapperClass=""
                        visible={true}
                    />
                </div>
            ) : (
                <div className="row mt-4 members-expences AllExpences">
                    {EventDetails.eventExpenses.length === 0 ? (
                        <div className="py-5 d-flex flex-column">
                            <div className="d-flex justify-content-center align-items-center">
                                <img src={Member} alt="member pick" className="img-fluid"
                                    style={{ width: "250px", height: "250px" }}
                                />
                            </div>
                            <p className="text-center mt-2">There are no expenses.</p>


                        </div>

                    ) : (
                        EventDetails.eventExpenses.map((expence, index) => {

                            const currencySymbol = currencySymbolMap(expence.currencyCode) || '';

                            return (
                                <div className="member-container my-2 d-flex justify-content-center">
                                    <div key={index} className=" d-flex justify-content-between align-items-center rounded-3"
                                        style={{
                                            backgroundColor: "#F4F5F9",
                                            border: "1px solid #E9EAF3",
                                            width: "100%",
                                        }}
                                    >

                                        <div className="pt-3 ps-2">
                                            <h6>{expence.title}</h6>
                                            <p>{currencySymbol}{expence.cost}</p>
                                        </div>

                                        <div className=" d-flex justify-content-center align-items-center">
                                            <div className=" edit  d-flex justify-content-center"
                                                style={{
                                                    cursor: "pointer",
                                                }}

                                                onClick={() => handleShowEditExpenses(expence._id)}
                                            >
                                                <img src={edit} alt="edit" />
                                            </div>

                                            <img src={Delete} alt="delete icon"
                                                onClick={() => handleShowDelete(expence._id)}
                                                style={{ cursor: "pointer", }}
                                            />
                                        </div>



                                    </div>
                                </div>
                            )

                        })
                    )}


                </div>
            )}

            <div className="mt-2 ">
                <button className="btn "
                    style={{
                        width: "100%",
                        backgroundColor: "#D32F2F",
                        color: "white",
                    }}

                    onClick={handleShowAddExpenses}
                >Add Expenses</button>
            </div>

            {/* add expenses */}
            <Modal show={showAddExpenses} onHide={handleCloseAddExpenses} centered>
                <Modal.Header closeButton style={{ borderBottom: "none" }}>
                    <Modal.Title className="text-center">Add Cost</Modal.Title>
                </Modal.Header>

                <Modal.Body>
                    <div className="px-3">
                        <form >
                            <div>
                                <label htmlFor="title">Title</label>
                                <input type="text"
                                    placeholder="Enter here"
                                    id="title"
                                    name="title"
                                    className="form-control py-2 mt-2"
                                    value={formData.title}
                                    onChange={handleInputChange}
                                    required
                                />
                            </div>

                            <div className="mt-3 custom-currency-input ">
                                <label htmlFor="about">Amount</label>
                                <div className="currency-input-wrapper">
                                    {!isCurrencySet && (
                                        <Select
                                            options={currencyOptions}
                                            value={selectedCurrency}
                                            onChange={handleCurrencyChange}
                                            placeholder="Select a currency"
                                            className="currency-select"
                                            isSearchable={true}
                                            styles={{
                                                menu: (provided) => ({
                                                    ...provided,
                                                    width: '300px',
                                                }),
                                            }}

                                        />
                                    )}
                                    <CurrencyInput
                                        id="cost"
                                        name="cost"
                                        value={formData.cost}
                                        onChangeEvent={handleAmountChange}
                                        decimalSeparator="."
                                        thousandSeparator=","
                                        precision="0"
                                        className={`currency-input form-control py-2 ${!isCurrencySet ? 'currency-input-with-dropdown' : 'currency-input-without-dropdown'}`}
                                        placeholder="0.00"
                                        allowNegativeValue={false}
                                        prefix={selectedCurrency ? `${selectedCurrency.value} ` : ''}
                                    />
                                </div>
                            </div>
                        </form>

                        <div className="mt-5 add-cost-btn">
                            <button className="btn"
                                style={{ width: "100%", backgroundColor: "#D32F2F", color: "white" }}
                                onClick={handleAddCost}
                            >
                                Add
                            </button>
                        </div>
                    </div>
                </Modal.Body>

            </Modal>

            {/* edit expenses */}

            <Modal show={showEditExpenses} onHide={handleCloseEditExpenses} centered>
                <Modal.Header closeButton style={{ borderBottom: "none" }}>
                    <Modal.Title className="text-center">Edit Expenses</Modal.Title>
                </Modal.Header>

                <Modal.Body>
                    <div className="px-3">
                        <form >
                            <div>
                                <label htmlFor="title">Title</label>
                                <input type="text"
                                    placeholder="Enter here"
                                    id="title"
                                    name="title"
                                    className="form-control py-2 mt-2"
                                    value={formData.title}
                                    onChange={handleInputChange}
                                    required
                                />
                            </div>

                            <div className="mt-3">
                                <label htmlFor="about">Amount</label>
                                <input type="text"
                                    placeholder="Enter Amount"
                                    id="cost"
                                    name="cost"
                                    className="form-control py-2 mt-2"
                                    value={formData.cost}
                                    onChange={handleInputChange}
                                    required
                                />
                            </div>
                        </form>

                        <div className="mt-5 add-cost-btn">
                            <button className="btn"
                                style={{ width: "100%", backgroundColor: "#D32F2F", color: "white" }}
                                onClick={handleEdit}
                            >
                                Update
                            </button>
                        </div>
                    </div>
                </Modal.Body>

            </Modal>

            {/* Delete expenses */}

            <Modal show={showDelete} onHide={handleCloseDelete} centered>
                <Modal.Header closeButton style={{ borderBottom: "none" }} className="pb-0">
                    <Modal.Title >Delete expense</Modal.Title>
                </Modal.Header >
                <Modal.Body>

                    <p>Are you sure you want to delete this expense ?</p>

                    <div className="d-flex justify-content-center expence-delete-btn">
                        <button className="btn border-success  me-2" style={{ width: "100%" }} onClick={handleCloseDelete}>No</button>
                        <button className="btn border-danger ms-2" style={{ width: "100%" }} onClick={handleDelete}>Yes</button>
                    </div>

                </Modal.Body>
            </Modal>

        </div>
    )
}

export default AllExpenses;