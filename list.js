
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

        if (options.value) {
            element.value = options.value;
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

    // Create a div to contain upvote button and year
    const buttonContainer = createElement('div', {
        class: 'button-container',
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
    buttonContainer.appendChild(upvoteButton);

    // Create and append year span directly
    const yearSpan = createElement('span', {
        class: 'year',
        text: `${year}年`
    });
    buttonContainer.appendChild(yearSpan);

    // Append the buttonContainer to the listItem
    listItem.appendChild(buttonContainer);

    // Create and append description span directly
const descriptionSpan = createElement('div', {
    class: 'description',
    text: ` ${description}`,
    attr: {
        title: description // Set the title attribute to the full description
    }
});
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

                let initialValue = '';

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
