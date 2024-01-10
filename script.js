// Connect to an Ethereum node using Web3.js
const web3 = new Web3(Web3.givenProvider || "http://localhost:8545");

// Smart contract address and ABI
const contractAddress = "0xbCB889B2ee030af249DadAef6080424c012294C2"; 
const contractABI = [
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "uint16",
				"name": "year",
				"type": "uint16"
			},
			{
				"indexed": true,
				"internalType": "uint256",
				"name": "eventId",
				"type": "uint256"
			},
			{
				"indexed": false,
				"internalType": "string",
				"name": "description",
				"type": "string"
			},
			{
				"indexed": true,
				"internalType": "address",
				"name": "creator",
				"type": "address"
			}
		],
		"name": "EventCreated",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "uint16",
				"name": "year",
				"type": "uint16"
			},
			{
				"indexed": true,
				"internalType": "uint256",
				"name": "eventId",
				"type": "uint256"
			},
			{
				"indexed": true,
				"internalType": "address",
				"name": "voter",
				"type": "address"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "votes",
				"type": "uint256"
			}
		],
		"name": "Voted",
		"type": "event"
	},
	{
		"inputs": [
			{
				"internalType": "uint16",
				"name": "year",
				"type": "uint16"
			},
			{
				"internalType": "string",
				"name": "description",
				"type": "string"
			}
		],
		"name": "createEvent",
		"outputs": [],
		"stateMutability": "payable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint16",
				"name": "year",
				"type": "uint16"
			},
			{
				"internalType": "uint256",
				"name": "eventId",
				"type": "uint256"
			}
		],
		"name": "vote",
		"outputs": [],
		"stateMutability": "payable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint16",
				"name": "",
				"type": "uint16"
			},
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"name": "events",
		"outputs": [
			{
				"internalType": "string",
				"name": "description",
				"type": "string"
			},
			{
				"internalType": "uint256",
				"name": "votes",
				"type": "uint256"
			},
			{
				"internalType": "address",
				"name": "creator",
				"type": "address"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint16",
				"name": "year",
				"type": "uint16"
			}
		],
		"name": "getEventsCount",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	}
];

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
            console.log("Connected:", userAccount);
        } catch (error) {
            console.error("Error connecting:", error);
        }
    } else {
        console.error("MetaMask not found.");
    }
}

document.getElementById("addButton").addEventListener("click", async () => {
    const input = document.getElementById("eventInput").value;
    const currentYear = new Date().getFullYear(); // 获取当前年份

    if (!userAccount) {
        await connectWallet();
    }
    
    try {
        await contract.methods.createEvent(currentYear, input)
            .send({ from: userAccount, value: web3.utils.toWei('0.0001', 'ether') });
// 0.24$
    } catch (error) {
        console.error("Error storing string:", error);
    }
});

function createSpan(className, text) {
    const span = document.createElement("span");
    span.className = className;
    const textNode = document.createTextNode(text);
    span.appendChild(textNode);
    return span;
}
function createListItem(year, eventId, description, creator, className) {
    const listItem = document.createElement("li");

    // 创建一个包含事件ID、创建者信息和投票数量的data属性
    listItem.setAttribute('data-year', year);
    listItem.setAttribute('data-event-id', eventId);
    listItem.setAttribute('data-creator', creator);
    listItem.setAttribute('data-votes', '0'); // 默认投票数量为0

    const eventInfoDiv = document.createElement("div");
    eventInfoDiv.appendChild(createSpan(`${className}-year`, `${year}`));
    eventInfoDiv.appendChild(createSpan(`${className}-description`, ` ${description}`));

    // 添加Upvote按钮
    const upvoteButton = document.createElement("button");
    upvoteButton.classList.add("upvote-button"); // Add a class to the upvote button

    // 获取当前投票数量
    const currentVotes = parseInt(listItem.getAttribute('data-votes'));

    upvoteButton.innerHTML = `${currentVotes} &#9650;`; // 显示投票数量和向上的三角符号
    upvoteButton.addEventListener("click", function () {
        // 调用vote函数，并传递year和eventId
        vote(year, eventId);
    });

    eventInfoDiv.appendChild(upvoteButton);

    listItem.appendChild(eventInfoDiv);

    return listItem;
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
            // Event already exists, update the description only
            existingListItem.querySelector('.event-list-item-description').textContent = description;
        } else {
            // Create and prepend the new list item
            const eventList = document.getElementById("eventList");
            const listItem = createListItem(year, eventId, description, creator, 'event-list-item');
            eventList.insertBefore(listItem, eventList.firstChild);
        }
    }
});

// Listen for Voted events
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
            const voteCount = parseInt(existingListItem.getAttribute('data-votes'));
            existingListItem.setAttribute('data-votes', votes);
        
            // Update the upvote button text
            const upvoteButton = existingListItem.querySelector('button');
            upvoteButton.innerHTML = `${votes} &#9650;`;
        } else {
            // Event not found, create and prepend the new list item
            const listItem = createListItem(year, eventId, '', voter, 'event-list-item');
            eventList.insertBefore(listItem, eventList.firstChild);
        }
    }
});
