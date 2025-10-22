const axios = require("axios");
const qs = require("qs");

// Fetch CRM token
const getCRMToken = async () => {
  const tokenURL = "http://oneassist.net.in/OneAssistCrmAPI/token";

  const requestBody = qs.stringify({
    username: "guruprasath@oneassist.net",
    password: "oneassist@123",
    grant_type: "password",
    proj: "crm",
  });

  const headers = {
    "Content-Type": "application/x-www-form-urlencoded",
  };

  try {
    const response = await axios.post(tokenURL, requestBody, { headers });
    return response.data.access_token;
  } catch (error) {
    console.error("Failed to get CRM token:", error.message);
    throw new Error("Token fetch failed");
  }
};

// Save contact to CRM
const saveContactToCRM = async (payload, token) => {
  const url =
    "http://oneassist.net.in/OneAssistCrmAPI/api/Contact/savecontactdetails";

  try {
    const response = await axios.post(url, payload, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
    console.log(response);

    return response.data;
  } catch (error) {
    console.error("Failed to save contact to CRM:", error.message);
    throw new Error("CRM save failed");
  }
};

module.exports = {
  getCRMToken,
  saveContactToCRM,
};
