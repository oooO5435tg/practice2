const app = new Vue({
    el: '#app',
    data: {
        columns: [
            {
                title: 'First',
                cards: []
            },
            {
                title: 'Second',
                cards: []
            },
            {
                title: 'Third',
                cards: []
            }
        ]
    },
    methods: {
        addCard(columnIndex) {
            const card = {
                title: 'New card',
                items: [
                    { text: 'Item 1', done: false },
                    { text: 'Item 2', done: false },
                    { text: 'Item 3', done: false }
                ],
                doneItems: 0,
                completedAt: null
            };

            this.columns[columnIndex].cards.push(card);
            this.saveData();
        },
        updateItem(card, itemIndex) {
            card.items[itemIndex].done = !card.items[itemIndex].done;
            card.doneItems = card.items.filter(item => item.done).length;

            if (card.doneItems >= card.items.length / 2 && this.columns[0].cards.includes(card)) {
                this.moveCard(card, 1);
            } else if (card.doneItems === card.items.length && this.columns[1].cards.includes(card)) {
                this.moveCard(card, 2);
            }
        },
        moveCard(card, targetColumnIndex) {
            const sourceColumnIndex = this.columns.findIndex(column => column.cards.includes(card));
            this.columns[sourceColumnIndex].cards.splice(this.columns[sourceColumnIndex].cards.indexOf(card), 1);
            this.columns[targetColumnIndex].cards.push(card);
            this.saveData();
        },
        saveData() {
            localStorage.setItem('columns', JSON.stringify(this.columns));
        }
    },
    created() {
        const savedColumns = JSON.parse(localStorage.getItem('columns'));
        if (savedColumns) {
            this.columns = savedColumns;
        }
    }
});