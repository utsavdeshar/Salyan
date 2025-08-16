// Function to get query parameters from the URL
function getQueryParam(param) {
    const urlParams = new URLSearchParams(window.location.search);
    const value = urlParams.get(param);
    console.log(`Parameter: ${param}, Value: ${value}`); // Logging to check if value is correctly retrieved
    return value;
}

// Get the values for accessionNumber and patientId from the URL
const accessionNumber = getQueryParam('accessionNumber');
const patientId = getQueryParam('patientId');

// Replace with your actual API URL
const API_URL = window.location.origin + `/insurance/reportApi.php?accession_no=${accessionNumber}&patient_id=${patientId}`;

fetch(API_URL)
    .then(response => {
        return response.json(); // Read the response as json
    })
    .then(data => {
        console.log(data); // Log the parsed data to check its structure

        // 1. Populate Patient Information
        //The textContent property is used to set or retrieve the text inside an HTML element
        document.getElementById("patientName").textContent = (": " + data.patient_info[0].first_name + " " + data.patient_info[0].last_name) || "N/A";
        document.getElementById("patientAge").textContent = ": " + data.patient_info[0].age || "N/A";
        document.getElementById("patientGender").textContent = ": " + data.patient_info[0].gender || "N/A";
        document.getElementById("patientId").textContent = ": " + data.patient_info[0].patient_id || "N/A";
        document.getElementById("accessionNumber").textContent = ": " + data.patient_info[0].accession_number || "N/A";
        document.getElementById("collectionDate").textContent = ": " + data.patient_info[0].collection_date || "N/A";
        document.getElementById("orderDate").textContent = ": " + data.patient_info[0].order_date || "N/A";
        document.getElementById("contactNumber").textContent = ": " + (data.contact_number[0]?.contact_number || "N/A");

        // 2. Generate Tables for Test Results
        const tablesContainer = document.getElementById("tables-container");
        tablesContainer.innerHTML = ""; // Clear any existing tables if present



        for (const panelName in data.test_results) {
            console.log("+++++++++++++" + panelName);
            const tests = data.test_results[panelName];
            console.log(tests);
            if (tests.length > 0) {
                // Create a new table for each test category
                const table = document.createElement("table");
                table.className = "table table-custom ";

                // Panel name as table caption or heading
                const panelDiv = document.createElement("div");
                panelDiv.textContent = panelName;
                panelDiv.style.fontWeight = "700";
                panelDiv.style.fontSize = "1.1rem";
                panelDiv.className = "text-center font-weight-bold panel"; // panel: Added CSS classes for styling
                tablesContainer.appendChild(panelDiv);
                // Create the table header
                table.innerHTML = `
                <thead  class="bg-secondary border rounded" style=" background-color: rgb(112 136 157) !important;">
                    <tr>
                        <th class=" col-4 p-0" >Test</th>
                        <th class=" col-2 text-center p-0">Result</th>
                        <th class=" col-2 text-center p-0">Unit</th>
                        <th class="col-2 text-center p-0"> Range</th>
                        <th class="col-2 text-center p-0">Alert</th>

                    </tr>
                </thead>
            `;

                // Table body for test results
                const tbody = document.createElement("tbody");
                tests.forEach(test => {
                    console.log("------------------------------------------", test);
                    console.log("===================================", test.alert);

                    const row = document.createElement("tr");
                    // Check if the alert is "A" or "B" and add a CSS class to bold the row
                    if (test.alert === "(A)" || test.alert === " (B)") {
                        row.classList.add("bold-row"); // classList is an easier and more flexible way to add, remove, or toggle individual classes without affecting the other classes.
                    }
                    row.innerHTML = `
                    <td class="p-1 custom-row">${test.test || "N/A"}</td>
                    <td class="p-1 text-center custom-row">${test.result || "N/A"}</td>
                    <td class="p-1 text-center custom-row">${test.unit || "N/A"}</td>
                    <td class="p-1 text-center custom-row">${test.valid_range || "N/A"}</td>
                    <td class="p-1 text-center custom-row">${test.alert || ""}</td>

                `;
                    tbody.appendChild(row);
                });
                table.appendChild(tbody);
                // Append the populated table to the tables container
                tablesContainer.appendChild(table);
            }
        }
        // 3. Dynamically Add Signature Section
        const footerContainer = document.getElementById("footer-container");

        const signatureDiv = document.createElement("div");
        signatureDiv.classList.add("custom-footer", "row");
        // signatureDiv.style.position="absolute";

        // Signature data (static text)
        const signatures = [
            { title: "Performed by", subtitle: "Lab Technologist" },
            { title: "Verified by", subtitle: "Lab Assistant" },
            { title: "Approved by", subtitle: "Lab Technologist" }
        ];

        // Loop through signatures and create divs for each
        signatures.forEach(signature => {
            const signatureBlock = document.createElement("div");
            signatureBlock.classList.add("col-md-4", "col-sm-4", "text-center", "mb-3");

            // Border div (for the signature line)
            const borderDiv = document.createElement("div");
            borderDiv.classList.add("border-bottom", "border-dark", "mb-2");
            borderDiv.style.width = "150px";
            borderDiv.style.margin = "auto";

            // Role and position text
            const titleP = document.createElement("p");
            titleP.classList.add("mb-0", "fw-bold");
            titleP.textContent = signature.title;

            const subtitleSmall = document.createElement("small");
            subtitleSmall.textContent = signature.subtitle;

            // Append elements
            signatureBlock.appendChild(borderDiv);
            signatureBlock.appendChild(titleP);
            signatureBlock.appendChild(subtitleSmall);

            // Append the signatureBlock to the signature section
            signatureDiv.appendChild(signatureBlock);
        });
        footerContainer.appendChild(signatureDiv);
        adjustPageBreaks();

        // Set up the "Print" Button click handler
        window.addEventListener('load', function () {

            window.print();
        });
        document.getElementById('printButton').addEventListener('click', function () {
            window.print();
        });


    })
    .catch(error => console.error('Error fetching data:', error));

// 4. Adjust page breaks dynamically


// Function to adjust page breaks
function adjustPageBreaks() {
    const footerContainer = document.getElementById("footer-container");
    const tablesContainer = document.getElementById("tables-container");
    const panels = document.getElementsByClassName("panel");

    console.log(panels);

    // Measure heights
    const tablesHeight = tablesContainer.offsetHeight; // Total height of the tables
    console.log(tablesHeight);
    const footerHeight = footerContainer.offsetHeight; // Height of the footer
    console.log(footerHeight);
    const windowHeight = document.body.scrollHeight;
    console.log(windowHeight);


    const contentHeight = document.body.scrollHeight; // Total height of content
    const pageHeight = 1122;


    // Calculate available space
    const totalHeight = tablesHeight + footerHeight;
    console.log(totalHeight);

    // Adjust footer placement and page breaks
    if (contentHeight > pageHeight && contentHeight < 1312) {
        const b = "true";
        console.log(b);
        const lastPanel = panels[panels.length - 1];
        console.log(lastPanel);
        if (lastPanel) {
            lastPanel.classList.add("page-break");
            // lastPanel.classList.add("mt-5")
        }
    } else {
        const a = "false";
        console.log(a);
        footerContainer.style.pageBreakBefore = "auto"; // Keep footer on the same page
    }
}

window.addEventListener('beforeprint', function () {
    const contentHeight = document.body.scrollHeight; // Total height of content
    const pageHeight = 1122; // A4 height in pixels at 96 DPI (approx.)

    if (contentHeight > pageHeight) {
        console.log('Content will overflow onto another page. Adding page breaks...');
        document.body.classList.add('page-break');
    } else {
        document.body.classList.remove('page-break');
    }
});


