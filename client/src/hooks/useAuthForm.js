import { useState } from "react";
import { toast } from 'react-toastify';
import { useNavigate } from "react-router-dom";

export const useAuthForm = (initialState, authApi, actionType) => {
    const [values, setValues] = useState(initialState);
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const [apiError, setApiError] = useState('');
    const navigate = useNavigate();

    const handleChange = (e) => {
        const { name, value } = e.target;
        setValues((prev) => ({ ...prev, [name]: value }));

        if (errors[name]) {
            setErrors((prev) => ({ ...prev, [name]: "" }));
        }

        if (apiError) setApiError("");
    };

    const validate = () => {
        let err = {};

        // Common validations
        if (!values.email?.trim()) err.email = "Email is required";
        else if (!/^\S+@\S+\.\S+$/.test(values.email)) err.email = "Email is invalid";

        if (!values.password?.trim()) err.password = "Password is required";

        // Register validations
        if (actionType === "register") {
            if (!values.company_name?.trim()) err.company_name = "Company name is required";
            if (!values.full_name?.trim()) err.full_name = "Full name is required";

            if (values.password !== values.confirm_password) {
                err.confirm_password = "Passwords do not match";
            }
        }

        return err;
    };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiError("");

    const validationErrors = validate();
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) return;

    try {
        setLoading(true);
        const dataToSend = { ...values };

        const response = await authApi(dataToSend);

        // LOGIN SUCCESS
        if (actionType === "login") {
            const accessToken = response?.accessToken;
            const user = response?.user;

            if (accessToken) {
                localStorage.setItem("accessToken", accessToken);
            }

            if (user) {
                localStorage.setItem("userData", JSON.stringify(user));
            }

            toast.success("Login Successful");
            navigate("/dashboard");
            console.log("navigate")
            return;
        }

        // REGISTER SUCCESS
        if (actionType === "register" && response?.message) {
            toast.success(response.message);
            navigate("/auth-2/sign-in");
            return;
        }

        setApiError("Something went wrong");

    } catch (error) {
        console.error("Auth Error:", error);

        if (error.response?.data?.message) {
            setApiError(error.response.data.message);
            toast.error(error.response.data.message);
        } else {
            setApiError("Something went wrong");
            toast.error("Something went wrong");
        }
    } finally {
        setLoading(false);
    }
};


    return {
        values,
        errors,
        loading,
        apiError,
        handleChange,
        handleSubmit,
    };
};
