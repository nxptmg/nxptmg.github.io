async function loadAndMergeJSON(urls) {
    try {
        const responses = await Promise.all(urls.map(url => fetch(url)));
        const jsonData = await Promise.all(responses.map(response => response.json()));

        const mergedData = jsonData.reduce((acc, data) => {
            data.data.forEach(item => {
                const existingItem = acc.find(accItem => accItem.driver_id === item.driver_id);
                if (existingItem) {
                    Object.assign(existingItem, item);
                } else {
                    acc.push(item);
                }
            });
            return acc;
        }, []);

        return mergedData;
    } catch (error) {
        console.error('Error loading or merging JSON files:', error);
    }
}


function displayData(data) {
    const tableBody = document.getElementById('data-table').getElementsByTagName('tbody')[0];
    // Filter out incomplete items
    const completeData = data.filter(item => item.display_name && item.legacy_id && item.route_password);

    completeData.forEach((item, index) => {
        const row = tableBody.insertRow();
        const cell0 = row.insertCell(0);
        const cell1 = row.insertCell(1);
        const cell2 = row.insertCell(2);
        const cell3 = row.insertCell(3);
        cell0.textContent = index + 1; // Add row number
        cell1.textContent = item.display_name;
        cell2.textContent = item.legacy_id;
        cell3.textContent = item.route_password;
        // Add more cells as needed
    });
}



const urls = [
    'https://nxptmg.github.io/name.json',
    'https://nxptmg.github.io/RouteLOG.json'
];

loadAndMergeJSON(urls).then(mergedData => {
    console.log('Merged Data:', mergedData);
    displayData(mergedData);
});

document.getElementById('copyButton').addEventListener('click', () => {
    const tableBody = document.getElementById('data-table').getElementsByTagName('tbody')[0];
    let textToCopy = '';
    for (let row of tableBody.rows) {
        textToCopy += `${row.cells[1].textContent}\t${row.cells[2].textContent}\n`;

    }
    navigator.clipboard.writeText(textToCopy).then(() => {
        alert('Names and Routes copied to clipboard!');
    }).catch(err => {
        console.error('Failed to copy text: ', err);
    });
});

document.getElementById('shareButton').addEventListener('click', () => {
    const tableBody = document.getElementById('data-table').getElementsByTagName('tbody')[0];
    let textToShare = '';
    for (let row of tableBody.rows) {
        textToShare += `${row.cells[1].textContent} - ${row.cells[3].textContent}\n`;
    }
    const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(textToShare)}`;
    window.open(whatsappUrl, '_blank');
});

document.getElementById('reloadButton').addEventListener('click', () => {
    loadAndMergeJSON(urls).then(mergedData => {
        console.log('Reloaded Data:', mergedData);
        // Clear existing table data
        const tableBody = document.getElementById('data-table').getElementsByTagName('tbody')[0];
        tableBody.innerHTML = '';
        // Display new data
        displayData(mergedData);
    });
});

