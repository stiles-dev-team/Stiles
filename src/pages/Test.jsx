import React, { useState, useEffect } from 'react'

const Test = () => {
    const [products, setProducts] = useState([])

    useEffect(() => {
        fetchProducts()
    }, [])

    const fetchProducts = async () => {
        const myHeaders = new Headers();
        
        // Add Basic Authentication using a simpler approach
        const username = 'WebUser1142';
        const password = 'e$Ye6!g]I~X@K!D';
        
        // Create credentials string and encode properly
        const credentialsString = `${username}:${password}`;
        const encodedCredentials = btoa(credentialsString);
        myHeaders.append("Authorization", `Basic ${encodedCredentials}`);

        const requestOptions = {
        method: "GET",
        headers: myHeaders,
        redirect: "follow",
        mode: 'cors' // Add CORS mode
        };

        const baseUrl = "https://stiles.southafricanorth.cloudapp.azure.com:5006/Stock/GetAllStockWebItems";

        try {
        // Try with CORS proxy first
        const proxyUrl = 'https://cors-anywhere.herokuapp.com/';
        const response = await fetch(proxyUrl + baseUrl, requestOptions);
        const result = await response.text();
        console.log("Success with proxy:", result);
        } catch (error) {
        console.log("Proxy failed, trying direct connection...");
        try {
            // Try direct connection (might work if you accept the certificate in browser)
            const response = await fetch(baseUrl, requestOptions);
            const result = await response.text();
            console.log("Success with direct connection:", result);
        } catch (directError) {
            console.error("Both methods failed:", directError);
            console.log("To fix this, you need to:");
            console.log("1. Accept the SSL certificate in your browser");
            console.log("2. Or contact the server administrator to fix the certificate");
            console.log("3. Or use a different proxy service");
        }
        };
    }


  return (
    <div>Test</div>
  )
}

export default Test