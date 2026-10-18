//temp url for testing
// const API_URL = "http://localhost:3000";

const API_URL = "https://hirc-node-b8d6e6d9fxceb6a6.centralus-01.azurewebsites.net";

const bpForm = document.getElementById("blood-pressure-form");

bpForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    const systolic = document.getElementById("upperNum").value;
    const diastolic = document.getElementById("lowerNum").value;

    const params = new URLSearchParams({
        systolic: systolic,
        diastolic: diastolic
    });

    try {
        const response = await fetch(`${API_URL}/api/blood-pressure?${params}`);

        if (!response.ok) {
            throw new Error("API request failed");
        }

        const data = await response.json();

        const categoryNames = {
            normal: "Normal Blood Pressure",
            elevated: "Elevated Blood Pressure",
            hypertensionS1: "Hypertension Stage 1",
            hypertensionS2: "Hypertension Stage 2",
            hypertensiveCrisis: "Hypertensive Crisis"
        }

        document.getElementById("bp-calculations").value = categoryNames[data.category] || "Unknown Category";
    } catch (error) {
        console.error("Error fetching blood pressure category:", error);
        document.getElementById("bp-calculations").value = "Unable to calculate";
    }
});


//BMI API

    const bmiForm = document.getElementById("bmi-form");

    bmiForm.addEventListener("submit", async (event) => {
        event.preventDefault();

        const feet = document.getElementById("feet").value;
        const inches = document.getElementById("inches").value;
        const weight = document.getElementById("weight").value;

        const params = new URLSearchParams({ feet, inches, weight });

        try {
            const response = await fetch(`${API_URL}/api/bmi?${params}`);
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || "BMI request failed.");
            }

            document.getElementById("BMI-results").value =
                `${data.bmi} - ${data.category}`;

            console.log("BMI API result:", data);
        } catch (error) {
            console.error("Error calling BMI API:", error);
            document.getElementById("BMI-results").value = error.message;
        }
    
    });


// RISK API

const riskForm = document.getElementById("risk-form");

riskForm.addEventListener("submit", async(event) =>{
    event.preventDefault();

    const age = document.querySelector('input[name="age"]:checked').value;
    const BMI = document.querySelector('input[name="BMI"]:checked').value;
    const BP = document.querySelector('input[name="BP"]:checked').value;
    const Diabetes = document.getElementById("diabetes").checked;
    const Cancer = document.getElementById("cancer").checked;
    const Alzheimer = document.getElementById("alzheimer").checked;

    const params = new URLSearchParams({ 
        age: age, 
        bmi: BMI, 
        bp: BP, 
        diabetes: Diabetes,
        cancer: Cancer,
        alzheimer: Alzheimer 
    });

    try{
        const response = await fetch(`${API_URL}/api/riskCategory?${params}`);
        const data = await response.json();

        if (!response.ok) {
            throw new Error(`Request failed with status ${response.status}`);
        }

        document.getElementById("risk-results").value =
            `${data.riskScore} - ${data.category}`;

        console.log("Risk calculator results:", data);
    } catch (error){
        console.log("Error calling the Risk API:", error);
        document.getElementById("risk-results").value = error.message;
    }

    })

// SERVER WAKE UP (ping on page)
function setServerStatus(text, state) {
    let el = document.getElementById("server-status");
 
    // Create the status line if it isn't in the HTML
    if (!el) {
        el = document.createElement("p");
        el.id = "server-status";
        el.setAttribute("role", "status");
        const header = document.querySelector("header") || document.body;
        header.appendChild(el);
    }
 
    el.textContent = text;
    el.className = `server-status ${state}`;
}
 
async function wakeServer(retries = 5, delayMs = 3000) {
    setServerStatus("Waking up the server, please wait...", "waking");
 
    for (let attempt = 1; attempt <= retries; attempt++) {
        const controller = new AbortController();
        // A cold start can be slow, so allow up to 30 seconds per attempt
        const timer = setTimeout(() => controller.abort(), 30000);
 
        try {
            const response = await fetch(`${API_URL}/api/ping`, {
                signal: controller.signal,
                cache: "no-store"
            });
            clearTimeout(timer);
 
            if (!response.ok) {
                throw new Error(`Ping failed with status ${response.status}`);
            }
 
            // Accept either the new JSON response or the old plain-text one
            const text = await response.text();
            console.log("Ping result:", text);
            setServerStatus("Server is awake and ready.", "ready");
            return true;
        } catch (error) {
            clearTimeout(timer);
            console.warn(`Ping attempt ${attempt} of ${retries} failed:`, error);
            await new Promise((resolve) => setTimeout(resolve, delayMs));
        }
    }
 
    setServerStatus("Server is not responding. Calculations may fail; try again shortly.", "error");
    return false;
}
 
// Runs immediately (the script tag is at the end of <body>, so the page exists already).
// If the page is somehow still loading, wait for it.
if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => wakeServer());
} else {
    wakeServer();
}