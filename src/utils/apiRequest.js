export const apiRequest = async (url, method = "GET", body = null) => {
  try {
    const options = {
      method,
      headers: { "Content-Type": "application/json" },
      ...(body && { body: JSON.stringify(body) }),
    };

    const response = await fetch(url, options);
    const data = await response.json();

    if (!response.ok) throw new Error(data.message || "Something went wrong");

    return data;
  } catch (error) {
    console.error("API Error:", error);
    return null;
  }
};