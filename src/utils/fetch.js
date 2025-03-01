export const FetchData = async (api) => {
  try {
    const response = await fetch(api);
    if (!response.ok) {
      throw new Error(`Error fetching data: ${response.statusText}`);
    }
    const data = await response.json();
    console.log(data);  
    return data; 
  } catch (error) {
    console.error('Error:', error);
  }
};
