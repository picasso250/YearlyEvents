// SPDX-License-Identifier: GPL-3.0

pragma solidity >=0.8.2 <0.9.0;

contract YearlyEvents {
        address public contractCreator;

    // 构造函数在合约部署时执行，设置 contractCreator 为部署者的地址
    constructor() {
        contractCreator = msg.sender;
    }

    struct Event {
        string description;
        uint256 votes;
        address creator; // Added field to store the creator's address
    }

    // Mapping from year to an array of events
    mapping(uint16 => Event[]) public events;

    // Event indicating the creation of an event
    event EventCreated(
        uint16 indexed year,
        uint256 indexed eventId,
        string description,
        address indexed creator
    );

    // Event indicating a vote for a specific event
    event Voted(
        uint16 indexed year,
        uint256 indexed eventId,
        address indexed voter,
        uint256 votes
    );

    // Function to create an event for a specific year
    function createEvent(uint16 year, string memory description) external payable {
        uint256 eventId = events[year].length;

        require(msg.value == 1e14 , "Must send exactly 1e14 wei to create an event");

        events[year].push(Event(description, 0, msg.sender)); // Store the creator's address

        // Transfer to the contract creator
        payable(contractCreator).transfer(1e14);

        // Trigger event with creator's address and event ID
        emit EventCreated(year, eventId, description, msg.sender);
    }

    // Function to vote for a specific event in a year
    function vote(uint16 year, uint256 eventId) external payable {
        require(eventId < events[year].length, "Invalid event ID"); // Check if the event ID is valid
        require(msg.value == 1e14, "Must send exactly 1e14 wei to vote for an event");

        // Increment the vote count for the specified event and year
        events[year][eventId].votes += 1;

        // Transfer 1e14 wei to the event creator
        payable(events[year][eventId].creator).transfer(1e14);

        // Get the current vote count for the event
        uint256 currentVotes = events[year][eventId].votes;

        // Trigger the vote event with the voter's address and current votes
        emit Voted(year, eventId, msg.sender, currentVotes);
    }

    // Function to get the number of events for a specific year
    function getEventsCount(uint16 year) external view returns (uint256) {
        return events[year].length;
    }


    // Event indicating the editing of an event
    event EventEdited(
        uint16 indexed year,
        uint256 indexed eventId,
        string oldDescription,
        string newDescription,
        address indexed editor
    );

    // Function to edit an existing event for a specific year
    function editEvent(uint16 year, uint256 eventId, string memory newDescription) external payable {
        // Check if the event ID is valid
        require(eventId < events[year].length, "Invalid event ID");

        // Check if the caller is the creator of the event
        require(msg.sender == events[year][eventId].creator, "Only the event creator can edit the event");

        // Check if the required amount of wei is sent
        require(msg.value == 1e14, "Must send exactly 1e14 wei to edit an event");

        // Save the old description
        string memory oldDescription = events[year][eventId].description;

        // Update the event description
        events[year][eventId].description = newDescription;

        // Transfer 1e14 wei to the event creator (editor in this case)
        payable(contractCreator).transfer(1e14);

        // Trigger the event edited event
        emit EventEdited(year, eventId, oldDescription, newDescription, msg.sender);
    }
}
