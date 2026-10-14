//temp url for testing
//const API_URL = "http://localhost:3000";

const API_URL = "https://hirc-node-b8d6e6d9fxceb6a6.centralus-01.azurewebsites.net";

const bpForm = document.getElementById("blood-pressure-form");
let bpCategory;

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

        bpCategory = data.category;

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