function formatNumber(number) {
    return number.toString().padStart(3, '0');
}

function isComplete(item) {
    return item.display_name && item.legacy_id && item.date && item.route_password;
}

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

const urls = [
    '/name.json',
    '/RouteLOG.json'
];

loadAndMergeJSON(urls).then(mergedData => {
    const tableBody = document.getElementById('tableBody');
    const completeData = mergedData.filter(isComplete);

    completeData.forEach((item, index) => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td class="text-center">${formatNumber(index + 1)}</td>
            <td class="px-4 py-4 text-sm text-gray-500 whitespace-nowrap">
                <div class="flex items-center gap-x-2">
                    <div>
                        <h2 class="text-sm font-medium text-gray-800">${item.display_name}</h2>
                    </div>
                </div>
            </td>
            <td class="px-4 py-4 text-sm text-gray-500 whitespace-nowrap">${item.legacy_id}</td>
            <td class="px-4 py-4 text-sm text-gray-500 whitespace-nowrap">${item.date}</td>
            <td class="px-4 py-4 text-sm font-bold text-gray-500 whitespace-nowrap">${item.route_password}</td>
        `;
        tableBody.appendChild(row);
    });
});

document.getElementById('searchInput').addEventListener('input', function () {
    const searchQuery = this.value.toLowerCase();
    const rows = document.querySelectorAll('#tableBody tr');

    rows.forEach(row => {
        const cells = row.querySelectorAll('td');
        const match = Array.from(cells).some(cell => cell.textContent.toLowerCase().includes(searchQuery));
        row.style.display = match ? '' : 'none';
    });
});


function copyToClipboard(text) {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand('copy');
    document.body.removeChild(textarea);
}

function formatForExcel(data) {
    return data.map(item => `${item.display_name}\t${item.legacy_id}`).join('\n');
}

document.getElementById('copyButton').addEventListener('click', () => {
    loadAndMergeJSON(urls).then(mergedData => {
        const completeData = mergedData.filter(isComplete);
        const formattedData = formatForExcel(completeData);
        copyToClipboard(formattedData);
        alert('Data copied to clipboard!');
    });
});


function formatForWhatsApp(data) {
    return data.map(item => `${item.display_name}   ${item.route_password}`).join('\n');
}

function shareToWhatsApp(message) {
    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
}

document.getElementById('shareButton').addEventListener('click', () => {
    loadAndMergeJSON(urls).then(mergedData => {
        const completeData = mergedData.filter(isComplete);
        const formattedData = formatForWhatsApp(completeData);
        shareToWhatsApp(formattedData);
    });
});

function reloadData() {
    loadAndMergeJSON(urls).then(mergedData => {
        const tableBody = document.getElementById('tableBody');
        tableBody.innerHTML = ''; // Clear existing rows

        const completeData = mergedData.filter(isComplete);

        completeData.forEach((item, index) => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td class="text-center">${formatNumber(index + 1)}</td>
                <td class="px-4 py-4 text-sm text-gray-500 whitespace-nowrap">
                    <div class="flex items-center gap-x-2">
                        <div>
                            <h2 class="text-sm font-medium text-gray-800">${item.display_name}</h2>
                        </div>
                    </div>
                </td>
                <td class="px-4 py-4 text-sm text-gray-500 whitespace-nowrap">${item.legacy_id}</td>
                <td class="px-4 py-4 text-sm text-gray-500 whitespace-nowrap">${item.date}</td>
                <td class="px-4 py-4 text-sm font-bold text-gray-500 whitespace-nowrap">${item.route_password}</td>
            `;
            tableBody.appendChild(row);
        });
    });
}

document.getElementById('reloadButton').addEventListener('click', reloadData);
