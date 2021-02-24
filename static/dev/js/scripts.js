const tasks = [
    {
        id: 0,
        entryTimestamp: 1614010031296,
        taskTitle: 'Title 1',
        taskMessage: 'Message 1',
        taskMarker: 'gray'
    },
    {
        id: 1,
        entryTimestamp: 1614010031396,
        taskTitle: 'Title 2',
        taskMessage: 'Message 2',
        taskMarker: 'green'
    },
    {
        id: 2,
        entryTimestamp: 1614010031696,
        taskTitle: 'Title 3',
        taskMessage: 'Message 3',
        taskMarker: 'red'
    },
];

let editingItemId;
let dateSort = 'newest';


const getItemData = () => {

    const form = document.querySelector('.js_form');

    form.addEventListener('submit', (e) => {

        e.preventDefault();
        const formData = Object.fromEntries(new FormData(e.target));
        const timestamp = new Date().getTime();

        if (editingItemId >= 0) {

            // we are editing an existing item
            // find the item in the tasks array by the id
            // create a new object with updated properties (new property: lastEditTimestamp)
            // overwrite the data in tasks[entryIndex]


            const entryIndex = tasks.findIndex(x => x.id === editingItemId);

            const editedObject = {
                id: editingItemId,
                entryTimestamp: tasks[entryIndex].entryTimestamp,
                lastEditTimestamp: timestamp,
                ...formData
            }

            tasks[entryIndex] = editedObject;

            console.log('DATA FOR SERVER - UPDATE');
            console.log(`
                const url = 'https://someurl.com/tasks/2';
                const data = {
                    id: 2,
                    entryTimeStamp: 1614156855456,
                    lastEditTimestamp: 1614156860000,
                    taskTitle: 'Some title',
                    taskMessage: 'Some message',
                    taskMarker: 'red'
                };
                fetch(url, {
                    method: 'PATCH',
                    headers: {
                        'Content-Type: 'application/json; charset=UTF-8'
                    },
                    body: JSON.stringify(data)
                });
            `);

        } else {

            // we are creating a new item
            // set the id and entryTimestamp
            // spread the data from the form elements

            const newObject = {
                id: tasks.length,
                entryTimestamp: timestamp,
                ...formData
            }

            // if entryDate === 'newest' the item is pushed to the end of tasksArray
            // if entryDate === 'oldest' the item is added to the beginning od the tasksArray

            if (dateSort === 'newest') {
                tasks.push(newObject);
            } else {
                tasks.unshift(newObject);
                console.log('tasks', tasks);
            }

            console.log('DATA FOR SERVER - NEW ENTRY');
            console.log(`
                const url = 'https://someurl.com/tasks';
                const data = {
                    id: 3,
                    entryTimeStamp: 1614156855456,
                    taskTitle: 'Some title',
                    taskMessage: 'Some message',
                    taskMarker: 'red'
                };
                fetch(url, {
                    method: 'POST',
                    headers: {
                        'Content-Type: 'application/json; charset=UTF-8'
                    },
                    body: JSON.stringify(data)
                });
            `);
        }

        buildItemList();

        // reset the form
        e.target.reset();

    });

}

const buildItemList = (rebuild = false) => {

    const itemsWrapper = document.querySelector('.js_tasksWrapper');

    if (rebuild) {

        // repopulate the itemsWrapper element - was previously emptyed in filterResults()

        tasks.forEach(task => {

            const markupInnerHtml = createTaskInnerMarkup(task);

            const markup = document.createElement('div');
            markup.className = `task is-${task.taskMarker}`;
            markup.dataset.id = task.id;

            markup.innerHTML = markupInnerHtml;

            itemsWrapper.prepend(markup);
        });

        return;
    }

    if (editingItemId >= 0) {

        // we are editing an existing entry
        // find an existing element in the DOM and an existing item in the tasks array using the editingItemId
        // change/update the markers class
        // update the existing element innerHTML
        // we are done editing, set the ediitingItemId to undefined

        const existingElement = itemsWrapper.querySelector(`[data-id="${editingItemId}"`);
        const existingItem = tasks.find(x => x .id === editingItemId);
        existingElement.className = `task is-${existingItem.taskMarker}`;
        existingElement.innerHTML = createTaskInnerMarkup(existingItem);

        editingItemId = undefined;

        return;
    }

    // we are adding the last entry of tasks array if entryDate sorting is set to 'newest', or first entry if it is set to 'oldest'

    let newItem;
    if (dateSort === 'newest') {
        newItem = tasks[tasks.length - 1];
    } else {
        newItem = tasks[0];
    }

    // create new div, add classes and data-id to id and fill it up with inner content

    const taskElement = document.createElement('div');
    taskElement.className = `task is-${newItem.taskMarker}`;
    taskElement.dataset.id = tasks.length - 1;

    taskElement.innerHTML = createTaskInnerMarkup(newItem);

    // if entryDate === 'newest' the item is prepended to the beginning
    // if entryDate === 'oldest' the item is appended to the end

    if (dateSort === 'newest') {
        itemsWrapper.prepend(taskElement);
    } else {
        itemsWrapper.append(taskElement);
    }


}

const createTaskInnerMarkup = item => {

    // return the inner markup for a single task

    return `
        <div class="task__inner_wrap">
            <a role="button" class="task__edit_btn js_editTask">Edit</a>
            <p class="task__title">${item.taskTitle}</p>
            <p class="task__message">${item.taskMessage}</p>
        </div>
    `;
}

const attachEventListener = () => {

    // attach click event to "EDIT" buttons which are created dynamically

    const itemsWrapper = document.querySelector('.js_tasksWrapper')

    itemsWrapper.addEventListener('click', (e) => {
        if(e.target.classList.contains('js_editTask')) {
            editItem(e.target.closest('.task').dataset.id);
        }
    });

}

const editItem = (id) => {

    // when the edit button is clicked, get the id of the task
    // find the item with that id in the tasks array an d get it's keys and values
    // loop through the keys (exclude id and timestamps)
    // repopulate the form elements based on the name="key" attribute

    editingItemId = Number(id);
    const itemData = tasks.find(x => x.id === editingItemId);
    const form = document.querySelector('.js_form');
    const objectKeys = Object.keys(itemData);
    const objectValues = Object.values(itemData);

    console.log(objectKeys);

    objectKeys.forEach((key, index) => {

        if (['id', 'entryTimestamp', 'lastEditTimestamp'].includes(key)) return;

        const element = form.querySelector(`[name="${key}"]`);
        const value = objectValues[index];
        element.value = value;

    });
}

const filterResults = () => {

    const form = document.querySelector('.js_filtersForm');
    const tasksWrapper = document.querySelector('.js_tasksWrapper');
    const filterByDate = form.querySelector('.js_filterByDate');
    const filterByMarker = form.querySelector('.js_filterByMarker');

    filterByMarker.addEventListener('change', (e) => {

        // every time the value changes
        // reset the tasksWrapper className

        const value = e.target.value;
        tasksWrapper.className = `wrapper__tasks js_tasksWrapper show-${value}-markers`
    });

    filterByDate.addEventListener('change', (e) => {

        // every time da value get change, reverse the tasks array
        // update the global dateSort variable (needed for later use)
        // empty the tasksWrapper innerHTML and rebuild it inside buildItemList

        dateSort = e.target.value;
        tasks.reverse();
        tasksWrapper.innerHTML = '';
        buildItemList(true);
    });

}



getItemData();
attachEventListener();
filterResults();
buildItemList(true);