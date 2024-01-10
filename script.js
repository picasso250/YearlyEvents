// Connect to an Ethereum node using Web3.js
const web3 = new Web3(Web3.givenProvider || "http://localhost:8545");

// Smart contract address and ABI
const contractAddress = "0x1Fbaf08ba33989631E000e9d57D5f36f485903E1";
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
				"indexed": false,
				"internalType": "string",
				"name": "oldDescription",
				"type": "string"
			},
			{
				"indexed": false,
				"internalType": "string",
				"name": "newDescription",
				"type": "string"
			},
			{
				"indexed": true,
				"internalType": "address",
				"name": "editor",
				"type": "address"
			}
		],
		"name": "EventEdited",
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
			},
			{
				"internalType": "string",
				"name": "newDescription",
				"type": "string"
			}
		],
		"name": "editEvent",
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

function createElement(tag, options) {
    const element = document.createElement(tag);

    if (options) {
        // 设置属性
        if (options.attr) {
            for (const [key, value] of Object.entries(options.attr)) {
                element.setAttribute(key, value);
            }
        }

        // 添加类名
        if (options.class) {
            element.className = options.class;
        }

        // 设置文本内容
        if (options.text) {
            element.textContent = options.text;
        }

        // 添加子元素
        if (options.children) {
            for (const child of options.children) {
                element.appendChild(child);
            }
        }

        // 添加事件监听器
        if (options.on) {
            for (const [event, handler] of Object.entries(options.on)) {
                element.addEventListener(event, handler);
            }
        }

        // 设置 HTML 内容
        if (options.html) {
            element.innerHTML = options.html;
        }

        if(options.value){
            element.value=options. value;
        }

        // Set style property
        if (options.style) {
            for (const [key, value] of Object.entries(options.style)) {
                element.style[key] = value;
            }
        }
    }

    return element;
}

function createSpan(className, text) {
    return createElement('span', {
        class: className,
        text: text
    });
}
function createListItem(year, eventId, description, creator, votes) {
    const listItem = createElement('li', {
        class: 'event-list-item',
        attr: {
            'data-year': year,
            'data-event-id': eventId,
            'data-creator': creator,
            'data-votes': votes.toString()
        },
        children: []
    });

    // Create Upvote button
    const upvoteButton = createElement('button', {
        class: 'upvote-button',
        html: `${votes} &#9650;`,
        children: [],
        on: {
            click: function () {
                // Call the vote function and pass year and eventId
                vote(year, eventId);
            }
        }
    });
    listItem.appendChild(upvoteButton);

    const yearSpan = createSpan('year', `${year}年`);
    listItem.appendChild(yearSpan);

    const descriptionSpan = createSpan('description', ` ${description}`);
    listItem.appendChild(descriptionSpan);


    const editButton = createElement('button', {
        class: 'edit-button',
        html: '编辑',
        style: {
            display: 'none' // hide the button by default
        },
        on: {
            click: function () {
                // Hide the edit button
                this.style.display = 'none';

                let initialValue = ''

                // Hide the previous sibling element
                const previousSibling = this.previousElementSibling;
                if (previousSibling) {
                    previousSibling.style.display = 'none';
                    // Get the text content of the previous sibling and set it as the initial value of the input
                    initialValue = previousSibling.textContent || previousSibling.innerText;
                }

                // Create an input element
                const inputElement = createElement('input', {
                    type: 'text',
                    value: initialValue, // Set the initial value as needed
                });

                // Create a save button
                const saveButton = createElement('button', {
                    class: 'save-button',
                    html: '保存',
                    on: {
                        click: function () {
                            // Implement the save function and pass the input value
                            save(year, eventId, inputElement.value);

                            // Optionally, you can restore the visibility of the edit button and previous sibling
                            editButton.style.display = '';
                            if (previousSibling) {
                                previousSibling.style.display = '';
                            }

                            // Remove the input and save button
                            inputElement.remove();
                            this.remove();
                        }
                    }
                });

                // Append the input and save button to the parent element
                this.parentElement.appendChild(inputElement);
                this.parentElement.appendChild(saveButton);
            }
        }
    });


    // Only show the button if the creator is equal to the userAccount
    if (creator === userAccount) {
        editButton.style.display = ''; // reset the display property to its initial value, which will reveal the button
    }
    listItem.appendChild(editButton);


    return listItem;
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
        console.debug("EventCreated", event.returnValues)
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
        console.debug("Voted", event.returnValues)
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
        console.debug("EventEdited", event.returnValues)
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
