const app = new Vue({
    el: '#app',
    data() {
        return {
            columns: [
                {
                    title: 'First',
                    cards: [],
                    maxCards: 3,
                    locked: false
                },
                {
                    title: 'Second',
                    cards: [],
                    maxCards: 5,
                    locked: false
                },
                {
                    title: 'Third',
                    cards: [],
                    maxCards: 10000,
                    locked: true
                }
            ]
        };
    },
    methods: {
        checkColumnStatus() {
            const secondColumn = this.columns[1];

            if (secondColumn.cards.length === secondColumn.maxCards) {
                this.columns[0].locked = true;
            }
        },
        checkCardCompletion(card) {
            if (card.doneItems === card.items.length) {
                const targetColumnIndex = this.columns.findIndex(column => column.title === 'Third');
                this.moveCard(card, targetColumnIndex);
                card.completedAt = new Date().toLocaleString();
            } else if (card.doneItems >= card.items.length / 2) {
                const targetColumnIndex = this.columns.findIndex(column => column.title === 'Second');
                this.moveCard(card, targetColumnIndex);
            }
        },
        addCard(column) {
            if (column.locked || (column.cards && column.cards.length >= column.maxCards)) {
                return;
            }

            const newCard = {
                id: Date.now(),
                title: 'New card',
                items: [
                    { text: 'Item 1', completed: false },
                    { text: 'Item 2', completed: false },
                    { text: 'Item 3', completed: false }
                ],
                doneItems: 0,
                completedAt: null
            };

            if (column.cards) {
                column.cards.push(newCard);
            } else {
                column.cards = [newCard];
            }

            this.checkColumnStatus();
            this.checkCardCompletion(newCard);
        },
        updateItem(card, itemIndex) {
            card.items[itemIndex].done = !card.items[itemIndex].done;
            card.doneItems = card.items.filter(item => item.done).length;

            const firstColumn = this.columns[0];
            const secondColumn = this.columns[1];

            if (firstColumn.locked && card.doneItems >= card.items.length / 2) {
                this.unlockFirstColumn();
            }

            if (firstColumn.cards.includes(card) && card.doneItems >= card.items.length / 2) {
                this.moveCard(card, 1);
            } else if (secondColumn.cards.includes(card) && card.doneItems === card.items.length) {
                this.moveCard(card, 2);
            }

            this.checkCardCompletion(card);
        },
        moveCard(card, targetColumnIndex) {
            const sourceColumnIndex = this.columns.findIndex(column => column.cards.includes(card));
            this.columns[sourceColumnIndex].cards.splice(this.columns[sourceColumnIndex].cards.indexOf(card), 1);
            this.columns[targetColumnIndex].cards.push(card);

            this.checkColumnStatus();
        },
        unlockFirstColumn() {
            const firstColumn = this.columns[0];
            firstColumn.locked = false;
        }
    },
    created() {
        const savedColumns = JSON.parse(localStorage.getItem('columns'));
        if (savedColumns) {
            this.columns = savedColumns;
            this.checkColumnStatus();
        }
    },
    updated() {
        localStorage.setItem('columns', JSON.stringify(this.columns));
    }
});