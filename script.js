// Connect to an Ethereum node using Web3.js
const web3 = new Web3(Web3.givenProvider || "http://localhost:8545");

// Get the contract instance
const contract = new web3.eth.Contract(contractABI, contractAddress);

// Get the account from MetaMask
let userAccount;

// Prompt user to connect their MetaMask wallet
async function connectWallet() {
    if (window.ethereum) {
        try {
            await window.ethereum.enable();
            userAccount = (await web3.eth.getAccounts())[0];
            if (userAccount) {
                Array.from(document.querySelectorAll('#eventList li')).forEach((li) => {
                    const creator = li.dataset.creator; // get the value of the "data-creator" attribute
                    li.querySelector('.edit-button').style.display = (creator === userAccount) ? '' : 'none';
                });
            }
        } catch (error) {
            console.error("Error connecting:", error);
        }
    } else {
        console.error("MetaMask not found.");
    }
}
connectWallet();
document.getElementById("addButton").addEventListener("click", async () => {
    const input = document.getElementById("eventInput").value;
    const currentYear = new Date().getFullYear(); // 获取当前年份

    if (!userAccount) {
        await connectWallet();
    }

    try {
        await contract.methods.createEvent(currentYear, input)
            .send({ from: userAccount, value: web3.utils.toWei('0.0001', 'ether') });
    } catch (error) {
        console.error("Error storing string:", error);
    }
});

async function save(year, eventId, newDescription) {
    try {
        // Assuming you have an "editEvent" method in your contract
        await contract.methods.editEvent(year,eventId, newDescription)
            .send({ from: userAccount, value: web3.utils.toWei('0.0001', 'ether') });
    } catch (error) {
        console.error("Error editing event:", error);
    }
}

function exportListToJson() {
    const listItems = document.getElementById('eventList').querySelectorAll('.event-list-item');
    const exportedData = [];

    listItems.forEach(item => {
        const year = item.getAttribute('data-year');
        const eventId = item.getAttribute('data-event-id');
        const description = item.querySelector('.description').textContent.trim();
        const creator = item.getAttribute('data-creator');
        const votes = parseInt(item.getAttribute('data-votes'));

        const listItemData = {
            year,
            eventId,
            description,
            creator,
            votes
        };

        exportedData.push(listItemData);
    });

    const jsonData = JSON.stringify(exportedData, null, 2);
    console.log(jsonData);
}

// 假设你的合约有一个名为`vote`的方法，用于处理投票
async function vote(year, eventId) {
    if (!userAccount) {
        // 如果用户尚未连接钱包，则连接钱包
        await connectWallet();
    }

    try {
        // 调用合约的vote方法，并传递year和eventId
        await contract.methods.vote(year, eventId).send({ from: userAccount, value: '100000000000000' }); // 1e14 wei

        console.log("Vote successful");
    } catch (error) {
        console.error("Error voting:", error);
    }
}


let options = {
    fromBlock: "genesis",
    toBlock: 'latest'
};

// Listen for new events
contract.events.EventCreated({
    fromBlock: "genesis"
}, function (error, event) {
    if (error) {
        console.error(error);
    } else {
        const year = event.returnValues.year;
        const eventId = event.returnValues.eventId;
        const description = event.returnValues.description;
        const creator = event.returnValues.creator;

        // Check if the event already exists in the list
        const existingListItem = document.querySelector(`[data-event-id="${eventId}"][data-year="${year}"]`);

        if (existingListItem) {
            existingListItem.querySelector('.description').textContent = description;
            existingListItem.setAttribute('data-creator', creator);
            existingListItem.querySelector('.edit-button').style.display = (creator === userAccount) ? '' : 'none';
        } else {
            // Create and prepend the new list item
            const eventList = document.getElementById("eventList");
            const listItem = createListItem(year, eventId, description, creator, 0);
            eventList.insertBefore(listItem, eventList.firstChild);
        }
        sortAndRenderList();
    }
});

function sortAndRenderList() {
    // 获取事件列表元素
    const eventList = document.getElementById("eventList");

    // 获取所有列表项并转换为数组
    const listItems = Array.from(eventList.getElementsByTagName("li"));

    // 按照投票数降序和事件ID倒序排序列表项数组
    listItems.sort((a, b) => {
        const votesA = parseInt(a.getAttribute('data-votes')) || 0;
        const votesB = parseInt(b.getAttribute('data-votes')) || 0;
        const eventIdA = parseInt(a.getAttribute('data-event-id')) || 0;
        const eventIdB = parseInt(b.getAttribute('data-event-id')) || 0;

        if (votesB !== votesA) {
            // 如果投票数不相等，按投票数降序
            return votesB - votesA;
        } else {
            // 如果投票数相等，按事件ID倒序
            return eventIdB - eventIdA;
        }
    });

    // 从 DOM 中移除所有列表项
    listItems.forEach(item => eventList.removeChild(item));

    // 将排序后的列表项重新添加到 DOM 中
    listItems.forEach(item => eventList.appendChild(item));
}

contract.events.Voted({
    fromBlock: "genesis"
}, function (error, event) {
    if (error) {
        console.error(error);
    } else {
        const year = event.returnValues.year;
        const eventId = event.returnValues.eventId;
        const voter = event.returnValues.voter;
        const votes = event.returnValues.votes;

        // Update the existing list item or create a new one if it doesn't exist
        const eventList = document.getElementById("eventList");
        const existingListItem = document.querySelector(`[data-event-id="${eventId}"][data-year="${year}"]`);

        if (existingListItem) {
            // Update the existing list item's vote count
            existingListItem.setAttribute('data-votes', votes);

            // Update the upvote button text
            const upvoteButton = existingListItem.querySelector('button');
            upvoteButton.innerHTML = `${votes} &#9650;`;
        } else {
            // Event not found, create and prepend the new list item
            const listItem = createListItem(year, eventId, '', '', votes);
            eventList.insertBefore(listItem, eventList.firstChild);
        }

        // 调用排序和渲染函数
        sortAndRenderList();
    }
});

contract.events.EventEdited({
    fromBlock: "genesis"
}, function (error, event) {
    if (error) {
        console.error(error);
    } else {
        const year = event.returnValues.year;
        const eventId = event.returnValues.eventId;
        const oldDescription = event.returnValues.oldDescription;
        const newDescription = event.returnValues.newDescription;
        const editor = event.returnValues.editor;

        // Update the existing list item or create a new one if it doesn't exist
        const eventList = document.getElementById("eventList");
        const existingListItem = document.querySelector(`[data-event-id="${eventId}"][data-year="${year}"]`);

        if (existingListItem) {
            // Update the existing list item's description
            existingListItem.setAttribute('data-description', newDescription);

            const upvoteButton = existingListItem.querySelector('.description');
            upvoteButton.textContent = newDescription;

        } else {
            // Event not found, handle as needed (e.g., log, ignore, or create a new item)
            console.warn(`Event with ID ${eventId} for year ${year} not found.`);
            // Event not found, create and prepend the new list item
            const listItem = createListItem(year, eventId, newDescription, editor, 0);
            eventList.insertBefore(listItem, eventList.firstChild);
        }

        // 调用排序和渲染函数
        sortAndRenderList();
    }
});
